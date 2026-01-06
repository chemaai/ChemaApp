import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthContext } from '../context/AuthContext';

export default function WeeklyReviewScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const params = useLocalSearchParams();
  const { user } = useAuthContext() as { user: { id?: string } | null };
  
  const [regenerating, setRegenerating] = useState(false);
  
  const reviewContent = params.reviewContent as string;
  const weekStart = params.weekStart as string;
  const weekEnd = params.weekEnd as string;
  
  // Strip emojis from content
  const stripEmojis = (text: string) => {
    if (!text) return text;
    return text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/gu, '').trim();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  // Render content with bold section titles
  const renderFormattedContent = (content: string) => {
    if (!content) return <Text style={[styles.reviewText, { color: isDark ? '#FFFFFF' : '#000000' }]}>No review content available</Text>;
    
    const cleanContent = stripEmojis(content);
    const sectionTitles = [
      'Weekly Review',
      'WEEKLY REVIEW',
      'Decisions',
      'DECISIONS',
      'Outcomes',
      'OUTCOMES',
      'Milestones',
      'MILESTONES',
      'Executive Summary',
      'EXECUTIVE SUMMARY'
    ];
    
    // Create regex pattern for section titles
    const pattern = new RegExp(`(${sectionTitles.join('|')})`, 'gi');
    const parts = cleanContent.split(pattern);
    
    return (
      <Text style={[styles.reviewText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
        {parts.map((part, index) => {
          const isTitle = sectionTitles.some(title => 
            title.toLowerCase() === part.toLowerCase()
          );
          
          if (isTitle) {
            return (
              <Text key={index} style={{ fontWeight: '700' }}>
                {part}
              </Text>
            );
          }
          return <Text key={index}>{part}</Text>;
        })}
      </Text>
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 17, color: isDark ? '#FFFFFF' : '#000000' }}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          WEEKLY REVIEW
        </Text>
        <View style={{ width: 20 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {weekStart && weekEnd && (
          <>
            <Text style={[styles.dateRange, { color: isDark ? '#999' : '#666' }]}>
              {formatDate(weekStart)} - {formatDate(weekEnd)}
            </Text>
            
            <TouchableOpacity
              onPress={async () => {
                setRegenerating(true);
                try {
                  const response = await fetch(
                    'https://chema-00yh.onrender.com/api/weekly-review/generate',
                    {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        user_id: user?.id,
                        test_mode: true
                      })
                    }
                  );
                  const data = await response.json();
                  if (data.success) {
                    // Update with new review
                    router.replace({
                      pathname: '/weekly-review',
                      params: {
                        reviewId: data.review.id,
                        reviewContent: data.review.review_content,
                        weekStart: data.review.week_start,
                        weekEnd: data.review.week_end
                      }
                    });
                  }
                } catch (error) {
                  console.error('Error regenerating:', error);
                  Alert.alert('Error', 'Failed to regenerate review');
                } finally {
                  setRegenerating(false);
                }
              }}
              disabled={regenerating}
              style={{
                marginBottom: 24,
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: isDark ? '#666' : '#CCC',
                alignSelf: 'flex-start',
                opacity: regenerating ? 0.5 : 1
              }}
            >
              {regenerating ? (
                <ActivityIndicator size="small" />
              ) : (
                <Text style={{ 
                  fontSize: 13,
                  color: isDark ? '#FFFFFF' : '#000000',
                  fontWeight: '500'
                }}>
                  ↻ Regenerate Review
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}
        
        {renderFormattedContent(reviewContent)}
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
  content: {
    flex: 1,
    padding: 20,
  },
  dateRange: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 24,
  },
  reviewText: {
    fontSize: 15,
    lineHeight: 24,
  },
});
