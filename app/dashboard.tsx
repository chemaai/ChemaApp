import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useChatContext } from '../context/ChatContext';
import { useAuthContext } from '../context/AuthContext';
import ChemaIcon from '../components/ChemaIcon';
import UpgradeModal from './components/UpgradeModal';

export default function DashboardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { allHilos, createHilo, deleteHilo, switchHilo, renameHilo } = useChatContext();
  const { user } = useAuthContext() as { user: { id?: string } | null };
  
  const [decisionCount, setDecisionCount] = useState(0);
  const [outcomeCount, setOutcomeCount] = useState(0);
  const [milestoneCount, setMilestoneCount] = useState(0);
  const [weeklyReview, setWeeklyReview] = useState<any>(null);
  const [generatingReview, setGeneratingReview] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const loadCounts = async () => {
    if (!user?.id) return;
    
    try {
      // Fetch all three in parallel
      const [decisionsRes, outcomesRes, milestonesRes] = await Promise.all([
        fetch(`https://chema-00yh.onrender.com/api/decisions?user_id=${user.id}`),
        fetch(`https://chema-00yh.onrender.com/api/outcomes?user_id=${user.id}`),
        fetch(`https://chema-00yh.onrender.com/api/milestones?user_id=${user.id}`)
      ]);
      
      const [decisionsData, outcomesData, milestonesData] = await Promise.all([
        decisionsRes.json(),
        outcomesRes.json(),
        milestonesRes.json()
      ]);
      
      if (decisionsData.success) setDecisionCount(decisionsData.decisions.length);
      if (outcomesData.success) setOutcomeCount(outcomesData.outcomes.length);
      if (milestonesData.success) setMilestoneCount(milestonesData.milestones.length);
    } catch (error) {
      console.error('Error loading counts:', error);
    }
  };

  const fetchWeeklyReview = async () => {
    try {
      const response = await fetch(
        `https://chema-00yh.onrender.com/api/weekly-review/latest?user_id=${user?.id}`
      );
      const data = await response.json();
      if (data.success && data.review) {
        setWeeklyReview(data.review);
      }
    } catch (error) {
      console.error('Error fetching weekly review:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCounts();
      if (user?.id) {
        fetchWeeklyReview();
      }
    }, [user?.id])
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0D0D0D' : '#FFFFFF' }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: isDark ? '#333' : '#E5E5E5' }]}>
        <View style={styles.logoContainer}>
          <Image
            source={isDark 
              ? require('../assets/images/chema_logo_dark.svg')
              : require('../assets/images/chema_logo.svg')
            }
            style={{
              width: 200,
              height: 48,
              transform: [{ scale: 3.93 }, { translateY: isDark ? 2 : 5 }]
            }}
            contentFit="contain"
          />
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content}>
        
        {/* Weekly Review Section */}
        <TouchableOpacity 
          style={[styles.weeklyReviewCard, { 
            backgroundColor: isDark ? '#1C1C1E' : '#F5F5F5' 
          }]}
          onPress={async () => {
            if (weeklyReview) {
              // Review exists, open it
              router.push({
                pathname: '/weekly-review',
                params: {
                  reviewId: weeklyReview.id,
                  reviewContent: weeklyReview.review_content,
                  weekStart: weeklyReview.week_start,
                  weekEnd: weeklyReview.week_end
                }
              });
            } else {
              // No review, generate it
              setGeneratingReview(true);
              try {
                const response = await fetch(
                  'https://chema-00yh.onrender.com/api/weekly-review/generate',
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      user_id: user?.id,
                      test_mode: true  // Can remove later for production
                    })
                  }
                );
                const data = await response.json();
                if (data.success) {
                  setWeeklyReview(data.review);
                  router.push({
                    pathname: '/weekly-review',
                    params: {
                      reviewId: data.review.id,
                      reviewContent: data.review.review_content,
                      weekStart: data.review.week_start,
                      weekEnd: data.review.week_end
                    }
                  });
                } else if (data.error === 'upgrade_required') {
                  Alert.alert(
                    'Weekly Review',
                    'Get AI-powered weekly accountability reviews with Founder tier ($19.99/mo). Review your unresolved decisions, track patterns, and stay accountable.',
                    [
                      { text: 'Not Now', style: 'cancel' },
                      { 
                        text: 'View Plans', 
                        onPress: () => setShowUpgradeModal(true)
                      }
                    ]
                  );
                } else {
                  Alert.alert('Error', data.message || 'Failed to generate review');
                }
              } catch (error) {
                console.error('Error generating review:', error);
                Alert.alert('Error', 'Failed to generate review');
              } finally {
                setGeneratingReview(false);
              }
            }
          }}
        >
          <Text style={[styles.weeklyReviewTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            WEEKLY REVIEW
          </Text>
          
          {generatingReview ? (
            <ActivityIndicator style={{ marginTop: 8 }} />
          ) : weeklyReview ? (
            <>
              <Text style={[styles.weeklyReviewDate, { color: isDark ? '#999' : '#666' }]}>
                {new Date(weeklyReview.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(weeklyReview.week_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
              <Text 
                style={[styles.weeklyReviewPreview, { color: isDark ? '#CCC' : '#666' }]}
                numberOfLines={2}
              >
                {weeklyReview.review_content
                  .replace(/WEEKLY REVIEW.*?\n/gi, '')
                  .replace(/\d{4}-\d{2}-\d{2} to \d{4}-\d{2}-\d{2}.*?\n/g, '')
                  .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/gu, '')
                  .trim()
                  .substring(0, 100)}...
              </Text>
            </>
          ) : (
            <Text style={[styles.weeklyReviewSubtitle, { color: isDark ? '#999' : '#666' }]}>
              Tap to generate your weekly review
            </Text>
          )}
        </TouchableOpacity>

        {/* HILOs Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: isDark ? '#999' : '#666' }]}>
            Hilo Threads
          </Text>
          
          {allHilos.slice(0, 5).map((hilo) => (
            <View 
              key={hilo.id}
              style={{ backgroundColor: isDark ? '#0D0D0D' : '#FFFFFF' }}
            >
              <TouchableOpacity
                style={styles.hiloItem}
                onPress={async () => {
                  await switchHilo(hilo.id);
                  router.push('/chat');
                }}
                onLongPress={() => {
                  Alert.alert(
                    hilo.title,
                    'Choose an action',
                    [
                      {
                        text: 'Rename',
                        onPress: () => {
                          Alert.prompt(
                            'Rename Conversation',
                            'Enter new name:',
                            async (newTitle) => {
                              if (newTitle && newTitle.trim()) {
                                await renameHilo(hilo.id, newTitle.trim());
                              }
                            },
                            'plain-text',
                            hilo.title
                          );
                        }
                      },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => {
                          Alert.alert(
                            'Delete Conversation',
                            `Delete "${hilo.title}"?`,
                            [
                              { text: 'Cancel', style: 'cancel' },
                              {
                                text: 'Delete',
                                style: 'destructive',
                                onPress: async () => {
                                  await deleteHilo(hilo.id);
                                }
                              }
                            ]
                          );
                        }
                      },
                      { text: 'Cancel', style: 'cancel' }
                    ]
                  );
                }}
              >
                <View style={styles.hiloContent}>
                  <Text style={[styles.hiloTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                    {hilo.title}
                  </Text>
                </View>
                {hilo.active && (
                  <View style={[styles.activeDot, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]} />
                )}
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity 
            style={styles.newButton}
            onPress={async () => {
              await createHilo('New Hilo');
              router.push('/chat');
            }}
          >
            <Text style={[styles.newButtonText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              + New Hilo
            </Text>
          </TouchableOpacity>
        </View>

        {/* Decisions/Outcomes/Milestones Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: isDark ? '#999' : '#666' }]}>
            Executive Memory
          </Text>
          
          <TouchableOpacity 
            style={styles.featureItem}
            onPress={() => router.push('/decisions')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <ChemaIcon name="decision" size={16} color={isDark ? '#FFFFFF' : '#000000'} />
              <Text style={[styles.featureTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Decisions
              </Text>
            </View>
            <Text style={[styles.featureCount, { color: isDark ? '#666' : '#999' }]}>
              ({decisionCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.featureItem}
            onPress={() => router.push('/outcomes')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <ChemaIcon name="outcome" size={16} color={isDark ? '#FFFFFF' : '#000000'} />
              <Text style={[styles.featureTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Outcomes
              </Text>
            </View>
            <Text style={[styles.featureCount, { color: isDark ? '#666' : '#999' }]}>
              ({outcomeCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.featureItem}
            onPress={() => router.push('/milestones')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <ChemaIcon name="milestone" size={16} color={isDark ? '#FFFFFF' : '#000000'} />
              <Text style={[styles.featureTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Milestones
              </Text>
            </View>
            <Text style={[styles.featureCount, { color: isDark ? '#666' : '#999' }]}>
              ({milestoneCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.featureItem}
            onPress={() => router.push('/monthly-audit')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <ChemaIcon name="audit" size={16} color={isDark ? '#FFFFFF' : '#000000'} />
              <Text style={[styles.featureTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Monthly Audit
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Recents Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: isDark ? '#999' : '#666' }]}>
            RECENTS
          </Text>
          
          {allHilos.find(h => h.active) && (
            <TouchableOpacity
              style={styles.hiloItem}
              onPress={async () => {
                const activeHilo = allHilos.find(h => h.active);
                if (activeHilo) {
                  await switchHilo(activeHilo.id);
                  router.push('/chat');
                }
              }}
            >
              <Text style={[styles.hiloTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                {allHilos.find(h => h.active)?.title}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Settings */}
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
        >
          <Text style={[styles.settingsText, { color: isDark ? '#666' : '#999' }]}>
            Settings
          </Text>
        </TouchableOpacity>

      </ScrollView>
      {showUpgradeModal && (
        <UpgradeModal
          checkoutUrl=""
          onClose={() => setShowUpgradeModal(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 104,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingBottom: 20,
    paddingLeft: 10,
    paddingRight: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  logoContainer: {
    height: 48,
    width: 200,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  logoImage: {
    width: 200,
    height: 48,
    transform: [{ scale: 3.93 }, { translateY: 5 }],
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 2,
  },
  content: {
    flex: 1,
  },
  weeklyReviewCard: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  weeklyReviewTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  weeklyReviewSubtitle: {
    fontSize: 14,
  },
  weeklyReviewDate: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
    fontWeight: '500',
  },
  weeklyReviewPreview: {
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  hiloItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  hiloContent: {
    flex: 1,
  },
  hiloTitle: {
    fontSize: 16,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  newButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  newButtonText: {
    fontSize: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  featureCount: {
    fontSize: 15,
  },
  settingsButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  settingsText: {
    fontSize: 16,
  },
});

