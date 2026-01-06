import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../context/AuthContext';
import UpgradeModal from './components/UpgradeModal';

interface Decision {
  id: string;
  content: string;
  created_at: string;
  resolved: boolean;
  hilo_id?: string;
}

export default function DecisionsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuthContext() as { user: { id?: string } | null };
  
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    loadDecisions();
  }, []);

  const loadDecisions = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(
        `https://chema-00yh.onrender.com/api/decisions?user_id=${user.id}`
      );
      const data = await response.json();
      
      if (data.success) {
        setDecisions(data.decisions);
      }
    } catch (error) {
      console.error('Error loading decisions:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDecision = async (id: string, content: string) => {
    Alert.alert(
      'Delete Decision',
      `Delete "${content.substring(0, 50)}..."?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `https://chema-00yh.onrender.com/api/decisions/${id}`,
                { method: 'DELETE' }
              );
              
              if (response.ok) {
                setDecisions(decisions.filter(d => d.id !== id));
              }
            } catch (error) {
              console.error('Error deleting decision:', error);
              Alert.alert('Error', 'Failed to delete decision');
            }
          }
        }
      ]
    );
  };

  const handleLogOutcome = (decision: Decision) => {
    Alert.prompt(
      'Log Outcome',
      `What was the outcome of: "${decision.content.substring(0, 50)}..."?`,
      async (outcomeText) => {
        if (!outcomeText || !outcomeText.trim()) return;
        
        try {
          const response = await fetch(
            `https://chema-00yh.onrender.com/api/decisions/${decision.id}/resolve`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: user?.id,
                content: outcomeText.trim(),
                hilo_id: decision.hilo_id
              })
            }
          );
          
          if (response.ok) {
            // Reload decisions to show updated status
            loadDecisions();
            Alert.alert('Success', 'Outcome logged successfully');
          } else {
            const data = await response.json();
            if (data.error === 'upgrade_required') {
              setShowUpgradeModal(true);
            } else {
              Alert.alert('Error', data.message || 'Failed to log outcome');
            }
          }
        } catch (error) {
          console.error('Error logging outcome:', error);
          Alert.alert('Error', 'Failed to log outcome');
        }
      },
      'plain-text'
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 17, color: isDark ? '#FFFFFF' : '#000000' }}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          DECISIONS
        </Text>
        <View style={{ width: 20 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} />
        ) : decisions.length === 0 ? (
          <Text style={[styles.emptyText, { color: isDark ? '#666' : '#999' }]}>
            No decisions saved yet
          </Text>
        ) : (
          decisions.map((decision) => (
            <TouchableOpacity
              key={decision.id}
              onLongPress={() => deleteDecision(decision.id, decision.content)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.decisionCard,
                  { 
                    backgroundColor: isDark ? '#1C1C1E' : '#F5F5F5',
                    borderBottomColor: isDark ? '#333' : '#E5E5E5'
                  }
                ]}
              >
                <Text style={[styles.date, { color: isDark ? '#999' : '#666' }]}>
                  {formatDate(decision.created_at)}
                </Text>
                <Text style={[styles.contentText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  {decision.content}
                </Text>
                {!decision.resolved && (
                  <TouchableOpacity
                    onPress={() => handleLogOutcome(decision)}
                    style={{
                      marginTop: 12,
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 4,
                      borderWidth: 1,
                      borderColor: isDark ? '#666' : '#CCC',
                      alignSelf: 'flex-start'
                    }}
                  >
                    <Text style={{ 
                      fontSize: 12,
                      color: isDark ? '#FFFFFF' : '#000000',
                      fontWeight: '500'
                    }}>
                      Log Outcome
                    </Text>
                  </TouchableOpacity>
                )}
                {decision.resolved && (
                  <Text style={[styles.resolved, { color: '#4CAF50' }]}>
                    ✓ Resolved
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 1,
  },
  scrollContent: {
    flex: 1,
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
  },
  decisionCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderBottomWidth: 1,
  },
  date: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 22,
  },
  resolved: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
});
