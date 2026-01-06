import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../context/AuthContext';

interface Milestone {
  id: string;
  content: string;
  created_at: string;
  target_date?: string;
  completed: boolean;
  completed_at?: string;
  hilo_id?: string;
}

export default function MilestonesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuthContext() as { user: { id?: string } | null };
  
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMilestones();
  }, []);

  const loadMilestones = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(
        `https://chema-00yh.onrender.com/api/milestones?user_id=${user.id}`
      );
      const data = await response.json();
      
      if (data.success) {
        setMilestones(data.milestones);
      }
    } catch (error) {
      console.error('Error loading milestones:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMilestone = async (id: string, content: string) => {
    Alert.alert(
      'Delete Milestone',
      `Delete "${content.substring(0, 50)}..."?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `https://chema-00yh.onrender.com/api/milestones/${id}`,
                { method: 'DELETE' }
              );
              
              if (response.ok) {
                setMilestones(milestones.filter(m => m.id !== id));
              }
            } catch (error) {
              console.error('Error deleting milestone:', error);
              Alert.alert('Error', 'Failed to delete milestone');
            }
          }
        }
      ]
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 17, color: isDark ? '#FFFFFF' : '#000000' }}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          MILESTONES
        </Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView style={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} />
        ) : milestones.length === 0 ? (
          <Text style={[styles.emptyText, { color: isDark ? '#666' : '#999' }]}>
            No milestones tracked yet
          </Text>
        ) : (
          milestones.map((milestone) => (
            <TouchableOpacity
              key={milestone.id}
              onLongPress={() => deleteMilestone(milestone.id, milestone.content)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.milestoneCard,
                  { 
                    backgroundColor: isDark ? '#1C1C1E' : '#F5F5F5',
                    borderBottomColor: isDark ? '#333' : '#E5E5E5'
                  }
                ]}
              >
                <Text style={[styles.date, { color: isDark ? '#999' : '#666' }]}>
                  {formatDate(milestone.created_at)}
                </Text>
                <Text style={[styles.contentText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  {milestone.content}
                </Text>
                {milestone.completed && (
                  <Text style={[styles.completed, { color: '#4CAF50' }]}>
                    ✓ Completed
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
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
  milestoneCard: {
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
  completed: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
});

