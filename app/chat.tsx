import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AnimatedReanimated, { FadeIn, Easing as ReanimatedEasing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import ChemaMenu from './components/ChemaMenu';

const spacingPresets = {
  cinematic: {
    paddingTop: 12,
    paddingBottom: 16,
    marginBottom: 12,
  },
  tight: {
    paddingTop: 4,
    paddingBottom: 4,
    marginBottom: 4,
  },
  open: {
    paddingTop: 16,
    paddingBottom: 22,
    marginBottom: 18,
  },
  reflective: {
    paddingTop: 20,
    paddingBottom: 28,
    marginBottom: 20,
  }
};

function getSpacingStyle(style: string) {
  return spacingPresets[style as keyof typeof spacingPresets] || spacingPresets.cinematic;
}

function formatChemaText(raw: string): string {
  // Preserve all newlines from backend - no preprocessing
  return raw || '';
}

const createMessageId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;

const PulseDot = ({ color = "black" }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.25, { duration: 700 }), // larger pulse, no shrinking
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedReanimated.View
      style={[
        {
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
};

function renderBoldText(content: string) {
  const parts: React.ReactNode[] = [];
  const boldPattern = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let matchIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = boldPattern.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    parts.push(
      <Text key={`bold-${matchIndex}`} style={markdownStyles.strong}>
        {match[1]}
      </Text>
    );
    lastIndex = match.index + match[0].length;
    matchIndex += 1;
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts.length > 0 ? parts : content;
}

export function renderFormattedText(text: string) {
  if (!text) return null;

  // Split into blocks: paragraph breaks (double newlines or sentence end + newline + capital) and numbered list items
  const blocks = text.split(/(\n\n+)|(?<=[.!?])\n(?=[A-Z])|(?=\n\d+\.\s+[A-Z0-9])/);

  // Remove empty entries
  const clean = blocks.filter(b => b && b.trim().length > 0);

  // Fix list numbering resets
  let lastNum = 0;
  const formattedBlocks = clean.map((block) => {
    const match = block.match(/^(\d+)\.\s/);
    if (match) {
      let num = parseInt(match[1], 10);
      if (num <= lastNum && lastNum >= 9) {
        num = lastNum + 1;
        block = block.replace(/^(\d+)\./, `${num}.`);
      }
      lastNum = num;
    } else {
      lastNum = 0;
    }
    return block.trim();
  });

  return (
    <>
      {formattedBlocks.map((block, index) => (
        <React.Fragment key={index}>
          <Text style={markdownStyles.text}>
            {renderBoldText(block)}
          </Text>
          {index < formattedBlocks.length - 1 && <View style={{ height: 10 }} />}
        </React.Fragment>
      ))}
    </>
  );
}

const MagicWords = ({ children }: { children: React.ReactNode }) => {
  return (
    <AnimatedReanimated.View
      entering={FadeIn.duration(500)}
      style={{ opacity: 0 }}
    >
      {children}
    </AnimatedReanimated.View>
  );
};

export default function ChatScreen() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string; id?: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const sendLock = React.useRef(false);
  const pulseAnim = useSharedValue(0.95);

  useEffect(() => {
    if (isLoading) {
      pulseAnim.value = withRepeat(
        withTiming(1.05, { duration: 900, easing: ReanimatedEasing.inOut(ReanimatedEasing.ease) }),
        -1,
        true
      );
    } else {
      pulseAnim.value = 0.95;
    }
  }, [isLoading]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const handlePdfPress = () => {
    console.log("PDF button pressed");
  };

  const handleSend = async () => {
    if (sendLock.current) return;
    sendLock.current = true;
    if (!input.trim() || isLoading) {
      sendLock.current = false;
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const userInput = input.trim();
    const userMessage = {
      role: 'user' as const,
      content: userInput,
      id: createMessageId()
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    console.log("CHEMA → sending request");

    try {
      const response = await fetch("https://chema-00yh.onrender.com/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userInput,
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
            id: m.id || Date.now().toString()
          })),
        }),
      });

      console.log("CHEMA → received response");

      if (!response.ok) {
        throw new Error('Network error');
      }

      const data = await response.json();
      console.log("BACKEND RAW RESPONSE →", data);
      const replyText = data.reply || "Ready when you are — clarity starts with conversation.";
      const assistantMessage = {
        role: 'assistant' as const,
        content: replyText,
        id: createMessageId()
      };

      setMessages(prev => {
        const withoutThinking = prev.filter(m => m.content !== "__thinking__");
        return [...withoutThinking, assistantMessage];
      });
    } catch (error) {
      console.log("CHEMA → error", error);
      const fallbackText = "Chema is waking up… retrying soon.";
      const errorMessage = {
        role: 'assistant' as const,
        content: fallbackText,
        id: createMessageId()
      };
      setMessages(prev => {
        const withoutThinking = prev.filter(m => m.content !== "__thinking__");
        return [...withoutThinking, errorMessage];
      });
    } finally {
      setIsLoading(false);
      sendLock.current = false;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.header}>
        <Pressable onPress={() => setShowMenu(true)}>
          <Text style={styles.headerTitle}>Chema</Text>
        </Pressable>
      </View>
      <FlatList
        data={
          isLoading
            ? [...messages, { role: 'assistant', content: '__thinking__', id: 'thinking-dot' }]
            : messages
        }
        keyExtractor={(item) => item.id!}
        renderItem={({ item }) => {
          if (item.content === '__thinking__') {
            return (
              <View style={{ alignSelf: 'flex-start', paddingLeft: 20, paddingVertical: 10 }}>
                <PulseDot color="black" />
              </View>
            );
          }

          // keep existing user + assistant bubble logic
          if (item.role === 'user') {
            return (
              <View style={styles.userBubble}>
                <Text style={styles.userText}>{item.content}</Text>
              </View>
            );
          }

          return (
            <View style={[styles.chemaContainer, getSpacingStyle((item as any).layoutStyle || "cinematic")]}>
              <MagicWords>
                {renderFormattedText(item.content)}
              </MagicWords>
            </View>
          );
        }}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.inputWrapper}>
        <View style={styles.inputRow}>
          <TouchableOpacity
            onPress={handlePdfPress}
            style={styles.pdfButton}
            activeOpacity={0.7}
          >
            <Text style={styles.pdfPlus}>＋</Text>
          </TouchableOpacity>
          <View style={styles.inputContainer}>

          <TextInput
            multiline
            style={styles.input}
            placeholder="Lead with Chema"
            placeholderTextColor="rgba(0,0,0,0.30)"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            editable={!isLoading}
          />

          <TouchableOpacity
            onPress={handleSend}
            activeOpacity={0.6}
            style={styles.sendButton}
            disabled={isLoading}
          >
            <View style={styles.sendCircle}>
              <View style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
                {isLoading ? (
                  <AnimatedReanimated.View
                    style={[
                      {
                        width: 12,
                        height: 12,
                        backgroundColor: '#FFFFFF',
                        borderRadius: 2,
                      },
                      pulseStyle,
                    ]}
                  />
                ) : input.length > 0 ? (
                  <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
                ) : (
                  <Image
                    source={require('../assets/images/flower_dark.svg')}
                    style={{
                      width: 40,
                      height: 40,
                      resizeMode: 'contain',
                    }}
                  />
                )}
              </View>
            </View>
          </TouchableOpacity>

          </View>
        </View>
      </View>
      {showMenu && (
        <ChemaMenu onClose={() => setShowMenu(false)} />
      )}
    </KeyboardAvoidingView>
  );
}

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 16,
    lineHeight: 22,
    color: '#000000',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 22,
    color: '#000000',
    marginBottom: 14,
  },
  strong: {
    fontWeight: '600',
  },
  ordered_list: {
    marginVertical: 0,
    paddingVertical: 0,
  },
  ordered_list_item: {
    marginBottom: 6,
  },
  ordered_list_icon: {
    marginRight: 4,
  },
  unordered_list: {
    marginVertical: 0,
    paddingVertical: 0,
  },
  unordered_list_item: {
    marginBottom: 6,
  },
  unordered_list_icon: {
    marginRight: 6,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    color: '#000000',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    opacity: 0.95,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#F3F3F3',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '75%',
    marginBottom: 16
  },
  userText: {
    fontSize: 16,
    color: '#000'
  },
  chemaContainer: {
    alignSelf: 'flex-start',
    marginBottom: 16
  },
  chemaText: {
    fontSize: 16,
    color: '#000'
  },
  inputWrapper: {
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingTop: 4,
    paddingBottom: 4,
    marginBottom: -2,
  },
  inputContainer: {
    position: 'relative',
    flex: 1,
    minHeight: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    borderRadius: 24,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingLeft: 16,
    paddingRight: 54,
    marginRight: 4,
  },
  input: {
    fontSize: 16,
    color: '#000000',
    textAlignVertical: 'top',
    paddingTop: 10,
    paddingBottom: 10,
    flexShrink: 1,
    marginTop: 2,
  },
  sendButton: {
    position: 'absolute',
    right: 8,
    bottom: 4,
  },
  sendCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  pdfPlus: {
    fontSize: 20,
    color: 'rgba(0,0,0,0.4)',
    marginTop: -1,
  },
});