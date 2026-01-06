import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../context/AuthContext';

interface Outcome {
  id: string;
  content: string;
  created_at: string;
  decision_id?: string;
  decision_content?: string;
  hilo_id?: string;
}

export default function OutcomesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuthContext() as { user: { id?: string } | null };
  
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOutcomes();
  }, []);

  const loadOutcomes = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(
        `https://chema-00yh.onrender.com/api/outcomes?user_id=${user.id}`
      );
      const data = await response.json();
      
      if (data.success) {
        setOutcomes(data.outcomes);
      }
    } catch (error) {
      console.error('Error loading outcomes:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteOutcome = async (id: string, content: string) => {
    Alert.alert(
      'Delete Outcome',
      `Delete "${content.substring(0, 50)}..."?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `https://chema-00yh.onrender.com/api/outcomes/${id}`,
                { method: 'DELETE' }
              );
              
              if (response.ok) {
                setOutcomes(outcomes.filter(o => o.id !== id));
              }
            } catch (error) {
              console.error('Error deleting outcome:', error);
              Alert.alert('Error', 'Failed to delete outcome');
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
          OUTCOMES
        </Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView style={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} />
        ) : outcomes.length === 0 ? (
          <Text style={[styles.emptyText, { color: isDark ? '#666' : '#999' }]}>
            No outcomes logged yet
          </Text>
        ) : (
          outcomes.map((outcome) => (
            <TouchableOpacity
              key={outcome.id}
              onLongPress={() => deleteOutcome(outcome.id, outcome.content)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.outcomeCard,
                  { 
                    backgroundColor: isDark ? '#1C1C1E' : '#F5F5F5',
                    borderBottomColor: isDark ? '#333' : '#E5E5E5'
                  }
                ]}
              >
                <Text style={[styles.date, { color: isDark ? '#999' : '#666' }]}>
                  {formatDate(outcome.created_at)}
                </Text>
                
                {/* Show linked decision if exists */}
                {outcome.decision_content && (
                  <View style={{
                    marginBottom: 12,
                    paddingBottom: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: isDark ? '#333' : '#E5E5E5'
                  }}>
                    <Text style={{ 
                      color: isDark ? '#666' : '#999',
                      fontSize: 11,
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      marginBottom: 4
                    }}>
                      DECISION
                    </Text>
                    <Text style={{ 
                      color: isDark ? '#999' : '#666',
                      fontSize: 14,
                      fontStyle: 'italic',
                      lineHeight: 20
                    }}>
                      {outcome.decision_content}
                    </Text>
                  </View>
                )}
                
                <Text style={{
                  color: isDark ? '#666' : '#999',
                  fontSize: 11,
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: 4
                }}>
                  OUTCOME
                </Text>
                <Text style={[styles.contentText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  {outcome.content}
                </Text>
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
  outcomeCard: {
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
});

