import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Keyboard, KeyboardAvoidingView, Linking, NativeScrollEvent, NativeSyntheticEvent, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import AnimatedReanimated, { cancelAnimation, FadeIn, Easing as ReanimatedEasing, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useAuthContext } from '../context/AuthContext';
import { useChatContext } from '../context/ChatContext';
import { useColorScheme } from '../hooks/use-color-scheme';
import ChemaMenu from './components/ChemaMenu';
import ExamplePrompts from './components/ExamplePrompts';
import HiloDrawer, { DRAWER_WIDTH } from './components/HiloDrawer';
import UpgradeModal from './components/UpgradeModal';

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

const PulseDot = ({ isDark = false }: { isDark?: boolean }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.25, { duration: 700 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedReanimated.View style={[animatedStyle, { pointerEvents: 'none' }]}>
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />
    </AnimatedReanimated.View>
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

// LetterChar: Individual animated character
const LetterChar = ({ char, delay }: { char: string; delay: number }) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 300, easing: ReanimatedEasing.inOut(ReanimatedEasing.ease) })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <AnimatedReanimated.Text style={animatedStyle}>
      {char}
    </AnimatedReanimated.Text>
  );
};

// LetterReveal: Animates text character-by-character with staggered opacity
const LetterReveal = ({ text, baseDelay, isDark }: { text: string; baseDelay: number; isDark: boolean }) => {
  const characters = text.split('');

  return (
    <Text style={[markdownStyles.text, { color: isDark ? '#FFFFFF' : '#000000' }]}>
      {characters.map((char, charIndex) => (
        <LetterChar
          key={charIndex}
          char={char}
          delay={baseDelay + charIndex * 4}
        />
      ))}
    </Text>
  );
};

export function renderFormattedText(text: string, isDark: boolean = false) {
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
        <View key={index}>
          <LetterReveal
            text={block}
            baseDelay={index * 200}
            isDark={isDark}
          />
          {index < formattedBlocks.length - 1 && <View style={{ height: 10 }} />}
        </View>
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
  const { user, userProfile } = useAuthContext() as unknown as { 
    user: { id?: string } | null; 
    userProfile: { plan?: string } | null;
  };
  // Use ChatContext to persist messages across navigation
  const { messages, setMessages } = useChatContext();
  const { openMenu } = useLocalSearchParams<{ openMenu?: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true); // Show example prompts until first message
  const sendLock = useRef(false);
  const flatListRef = useRef<FlatList>(null);
  const isNearBottom = useRef(true); // Track if user is near bottom of chat
  const contentHeight = useRef(0);
  const scrollViewHeight = useRef(0);
  const pulseAnim = useSharedValue(0.95);

  // Auto-open menu if coming from MyAccount
  useEffect(() => {
    if (openMenu === 'true') {
      setShowMenu(true);
      // Clear the param to prevent re-opening on subsequent renders
      router.setParams({ openMenu: undefined });
    }
  }, [openMenu]);

  // Scroll tracking - only auto-scroll if user is near bottom
  const SCROLL_THRESHOLD = 150; // pixels from bottom to consider "near bottom"
  
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
    isNearBottom.current = distanceFromBottom < SCROLL_THRESHOLD;
    contentHeight.current = contentSize.height;
    scrollViewHeight.current = layoutMeasurement.height;
  }, []);

  const scrollToBottom = useCallback((animated = true) => {
    if (flatListRef.current && isNearBottom.current) {
      flatListRef.current.scrollToEnd({ animated });
    }
  }, []);

  // Memoize filtered messages to prevent unnecessary re-renders
  const filteredMessages = useMemo(() => {
    return messages.filter(m => (m as any).type !== 'pdf_upload');
  }, [messages]);

  const listData = useMemo(() => {
    if (isLoading) {
      return [...filteredMessages, { role: 'assistant' as const, content: '__thinking__', id: 'thinking-dot' }];
    }
    return filteredMessages;
  }, [filteredMessages, isLoading]);
  
  // Hilo drawer state
  const [showHilo, setShowHilo] = useState(false);
  const hiloTranslateX = useSharedValue(0);
  
  // Menu discovery pulse animation
  const [menuDiscovered, setMenuDiscovered] = useState(true); // Default true to prevent flash
  const headerScale = useSharedValue(1);
  const headerOpacity = useSharedValue(1);

  // Check if menu has been discovered on mount
  useEffect(() => {
    const checkMenuDiscovered = async () => {
      try {
        const discovered = await AsyncStorage.getItem('menuDiscovered');
        if (discovered === 'true') {
          setMenuDiscovered(true);
        } else {
          setMenuDiscovered(false);
        }
      } catch (err) {
        console.log('Error reading menuDiscovered:', err);
        setMenuDiscovered(false);
      }
    };
    checkMenuDiscovered();
  }, []);

  // Run pulse animation when menu not discovered
  useEffect(() => {
    if (!menuDiscovered) {
      // Scale: 1.00 → 1.04 → 1.00
      headerScale.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 1100, easing: ReanimatedEasing.inOut(ReanimatedEasing.ease) }),
          withTiming(1.00, { duration: 1100, easing: ReanimatedEasing.inOut(ReanimatedEasing.ease) })
        ),
        -1, // infinite
        false
      );
      // Opacity: 1.00 → 0.85 → 1.00
      headerOpacity.value = withRepeat(
        withSequence(
          withTiming(0.85, { duration: 1100, easing: ReanimatedEasing.inOut(ReanimatedEasing.ease) }),
          withTiming(1.00, { duration: 1100, easing: ReanimatedEasing.inOut(ReanimatedEasing.ease) })
        ),
        -1,
        false
      );
    } else {
      // Stop animation and reset to default
      cancelAnimation(headerScale);
      cancelAnimation(headerOpacity);
      headerScale.value = withTiming(1, { duration: 200 });
      headerOpacity.value = withTiming(1, { duration: 200 });
    }
  }, [menuDiscovered]);

  const headerPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
    opacity: headerOpacity.value,
  }));

  const handleChemaTap = async () => {
    setShowMenu(true);
    if (!menuDiscovered) {
      setMenuDiscovered(true);
      try {
        await AsyncStorage.setItem('menuDiscovered', 'true');
      } catch (err) {
        console.log('Error saving menuDiscovered:', err);
      }
    }
  };

  // Auth guard - redirect to register if not logged in
  useEffect(() => {
    if (!user?.id) {
      router.replace('/auth/Register');
    }
  }, [user]);

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

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  // Hilo drawer animation (cinematic timing to match drawer)
  useEffect(() => {
    hiloTranslateX.value = withTiming(showHilo ? DRAWER_WIDTH : 0, {
      duration: showHilo ? 350 : 300,
      easing: ReanimatedEasing.out(ReanimatedEasing.cubic),
    });
  }, [showHilo]);

  const chatContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: hiloTranslateX.value }],
  }));

  // Left-edge swipe gesture to open Hilo
  const gestureStartX = useSharedValue(0);
  const edgeSwipeGesture = Gesture.Pan()
    .activeOffsetX([20, 100])
    .failOffsetY([-15, 15]) // Allow vertical scrolling to take over
    .onBegin((e) => {
      gestureStartX.value = e.absoluteX;
    })
    .onEnd((e) => {
      if (e.translationX > 50 && gestureStartX.value < 35) {
        runOnJS(setShowHilo)(true);
      }
    });

  const handlePdfPress = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];
      await uploadPdf(asset);

    } catch (err) {
      console.error("PDF Picker Error:", err);
    }
  };

  const uploadPdf = async (file: any) => {
    try {
      // 1. Insert permanent PDF message BEFORE calling backend
      const pdfMessage = {
        id: createMessageId(),
        role: "user" as const,
        type: "pdf",
        name: file.name || "document.pdf",
        uri: file.uri,
        content: `PDF Uploaded: ${file.name || "document.pdf"}`,
      };
      setMessages((prev) => [...prev, pdfMessage]);
      
      // Scroll to show PDF message
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // 2. Convert URI to blob
      const response = await fetch(file.uri);
      const blob = await response.blob();

      // 3. Build form data
      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name || "document.pdf",
        type: file.mimeType || "application/pdf",
      } as any);

      // 4. Trigger Chema typing indicator
      setIsLoading(true);

      // 5. Send to backend (NO CONTENT-TYPE HEADER!!)
      if (!user?.id) {
        router.replace('/auth/Register');
        return;
      }
      console.log("🚀 Sending to backend user_id:", user.id);
      const res = await fetch("https://chema-00yh.onrender.com/analyze_pdf", {
        method: "POST",
        headers: {
          "X-User-ID": user.id,
        },
        body: formData,
      });

      const data = await res.json();

      // Check for upgrade_required error
      if (data.error === "upgrade_required") {
        setCheckoutUrl(data.url || "");
        setShowUpgradeModal(true);
        setIsLoading(false);
        return;
      }

      // 6. Push Chema's reply as a normal assistant message (PDF message stays in array)
      const assistantMessage = {
        role: "assistant" as const,
        content: data.reply || "Chema couldn't read this PDF.",
        id: createMessageId(),
      };
      setMessages((prev) => {
        const withoutThinking = prev.filter(m => m.content !== "__thinking__");
        return [...withoutThinking, assistantMessage];
      });

      setIsLoading(false);
      
      // Scroll to show new assistant message
      setTimeout(() => scrollToBottom(true), 150);

    } catch (err) {
      console.error("UPLOAD ERROR:", err);

      const errorMessage = {
        role: "assistant" as const,
        content: "There was an error processing that PDF.",
        id: createMessageId(),
      };
      setMessages((prev) => {
        const withoutThinking = prev.filter(m => m.content !== "__thinking__");
        return [...withoutThinking, errorMessage];
      });

      setIsLoading(false);
      
      // Scroll to show error message
      setTimeout(() => scrollToBottom(true), 150);
    }
  };

  // Handle sending a message (supports both input field and direct prompt text)
  const handleSend = async (promptText?: string) => {
    if (sendLock.current) return;
    sendLock.current = true;
    
    const textToSend = promptText || input;
    
    if (!textToSend.trim() || isLoading) {
      sendLock.current = false;
      return;
    }

    // Hide example prompts on first message
    if (messages.length === 0) {
      setShowPrompts(false);
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const userInput = textToSend.trim();
    const userMessage = {
      role: 'user' as const,
      content: userInput,
      id: createMessageId()
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Auto-scroll to show new user message (always scroll when user sends)
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    console.log("CHEMA → sending request");

    if (!user?.id) {
      router.replace('/auth/Register');
      return;
    }

    try {
      console.log("🚀 Sending to backend user_id:", user.id);
      const response = await fetch("https://chema-00yh.onrender.com/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-ID": user.id,
        },
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
      
      // Check for upgrade_required error
      if (data.error === "upgrade_required") {
        setCheckoutUrl(data.url || "");
        setShowUpgradeModal(true);
        setIsLoading(false);
        sendLock.current = false;
        return;
      }
      
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
      
      // Scroll to show new assistant message (only if user was near bottom)
      setTimeout(() => scrollToBottom(true), 150);
    } catch (error) {
      console.log("CHEMA → error", error);
      
      // Show upgrade modal for non-founder users on error (may be rate limited)
      const currentPlan = userProfile?.plan || 'free';
      if (currentPlan !== 'founder') {
        // Clear the thinking indicator without adding error message
        setMessages(prev => prev.filter(m => m.content !== "__thinking__"));
        setShowUpgradeModal(true);
      } else {
        // Founder users see a generic connection error
        const fallbackText = "Connection interrupted. Please try again.";
        const errorMessage = {
          role: 'assistant' as const,
          content: fallbackText,
          id: createMessageId()
        };
        setMessages(prev => {
          const withoutThinking = prev.filter(m => m.content !== "__thinking__");
          return [...withoutThinking, errorMessage];
        });
        
        // Scroll to show error message
        setTimeout(() => scrollToBottom(true), 150);
      }
    } finally {
      setIsLoading(false);
      sendLock.current = false;
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <AnimatedReanimated.View style={{ flex: 1 }}>
      {/* Left edge swipe zone - only this area detects the drawer gesture */}
      <GestureDetector gesture={edgeSwipeGesture}>
        <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 25, zIndex: 100 }} />
      </GestureDetector>
      <AnimatedReanimated.View
        entering={FadeIn.duration(450).delay(100)}
        style={[{ flex: 1 }, chatContainerStyle]}
      >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.container, { backgroundColor: isDark ? '#0D0D0D' : 'white' }]}
      >
      <View style={[styles.header, { backgroundColor: isDark ? '#0D0D0D' : 'transparent' }]}>
        <Pressable onPress={handleChemaTap}>
          <AnimatedReanimated.View style={headerPulseStyle}>
            <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#000' }]}>Chema</Text>
          </AnimatedReanimated.View>
        </Pressable>
      </View>
      <FlatList
        ref={flatListRef}
        data={listData}
        extraData={isLoading}
        keyExtractor={(item) => item.id!}
        // Enable scrolling
        scrollEnabled={true}
        nestedScrollEnabled={true}
        // Smooth scroll performance
        scrollEventThrottle={16}
        onScroll={handleScroll}
        // Prevent scroll jitter and layout shifts
        removeClippedSubviews={Platform.OS === 'android'}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
        // Better performance for dynamic content
        windowSize={21}
        maxToRenderPerBatch={5}
        initialNumToRender={10}
        updateCellsBatchingPeriod={50}
        // Smooth momentum scrolling
        decelerationRate="normal"
        showsVerticalScrollIndicator={false}
        // Handle keyboard
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        // Allow scroll to work with gestures
        bounces={true}
        overScrollMode="never"
        onScrollToIndexFailed={(info) => {
          // Fallback: scroll to approximate position
          setTimeout(() => {
            flatListRef.current?.scrollToOffset({
              offset: info.averageItemLength * info.index,
              animated: true,
            });
          }, 100);
        }}
        renderItem={({ item }) => {
          if (item.content === '__thinking__') {
            return (
              <View style={{ alignSelf: 'flex-start', paddingLeft: 20, paddingVertical: 10, position: 'relative' }}>
                <View style={styles.thinkingDotContainer}>
                  <PulseDot isDark={isDark} />
                </View>
              </View>
            );
          }

          // Ignore pdf_upload messages (they should not show raw text)
          if ((item as any).type === 'pdf_upload') {
            return null;
          }

          // keep existing user + assistant bubble logic
          if (item.role === 'user') {
            // Render PDF message with icon and open action
            if ((item as any).type === 'pdf') {
              return (
                <View style={[styles.pdfBubble, { backgroundColor: isDark ? '#0a0a0a' : '#FFFFFF', borderColor: isDark ? '#2a2a2a' : 'rgba(0,0,0,0.1)' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="document-text" size={20} color={isDark ? "#FFFFFF" : "#000"} style={{ marginRight: 8 }} />
                    <Text style={[styles.userText, { color: isDark ? '#FFFFFF' : '#000' }]}>{(item as any).name || "document.pdf"}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      const uri = (item as any).uri;
                      if (uri) {
                        Linking.openURL(uri).catch(err => console.error("Failed to open PDF:", err));
                      }
                    }}
                    style={{ marginTop: 8 }}
                  >
                    <Text style={{ fontSize: 14, color: isDark ? 'rgba(255,255,255,0.50)' : '#666', textDecorationLine: 'underline' }}>
                      Open PDF
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }
            return (
              <View style={[styles.userBubble, { backgroundColor: isDark ? '#0D0D0D' : '#FFFFFF', borderColor: isDark ? '#3A3A3A' : '#D9D9D9' }]}>
                <Text style={[styles.userText, { color: isDark ? '#FFFFFF' : '#000' }]}>{item.content}</Text>
              </View>
            );
          }

          return (
            <View style={[styles.chemaContainer, getSpacingStyle((item as any).layoutStyle || "cinematic"), isDark && { backgroundColor: 'transparent', borderWidth: 0, borderColor: 'transparent', shadowColor: 'transparent', elevation: 0 }]}>
              <MagicWords>
                {renderFormattedText(item.content, isDark)}
              </MagicWords>
            </View>
          );
        }}
        contentContainerStyle={styles.listContent}
      />

      {/* Example prompts - only show when no messages yet */}
      {messages.length === 0 && showPrompts && (
        <ExamplePrompts 
          onSend={(text) => handleSend(text)} 
          visible={showPrompts}
          paused={input.length > 0}
        />
      )}

      <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#0D0D0D' : '#FFFFFF' }, !keyboardVisible && { marginBottom: Platform.OS === "ios" ? 16 : 12 }]}>
        <View style={styles.inputRow}>
          <TouchableOpacity
            onPress={handlePdfPress}
            style={[styles.pdfButton, { backgroundColor: isDark ? '#0D0D0D' : '#FFFFFF', borderColor: isDark ? '#3A3A3A' : 'rgba(0,0,0,0.12)' }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.pdfPlus, { color: isDark ? 'rgba(255,255,255,0.50)' : 'rgba(0,0,0,0.4)' }]}>＋</Text>
          </TouchableOpacity>
          <View style={[styles.inputContainer, { backgroundColor: isDark ? '#0D0D0D' : '#FFFFFF', borderColor: isDark ? '#3A3A3A' : 'rgba(0,0,0,0.12)' }]}>

          <TextInput
            multiline
            style={[styles.input, { color: isDark ? '#FFFFFF' : '#000000' }]}
            placeholder="Lead with Chema"
            placeholderTextColor={isDark ? "rgba(255,255,255,0.50)" : "rgba(0,0,0,0.30)"}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
            editable={!isLoading}
          />

          <TouchableOpacity
            onPress={() => handleSend()}
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
      {showUpgradeModal && (
        <UpgradeModal
          checkoutUrl={checkoutUrl}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}
      </KeyboardAvoidingView>
      </AnimatedReanimated.View>
      {showHilo && (
        <HiloDrawer
          isOpen={showHilo}
          onClose={() => setShowHilo(false)}
          isDark={isDark}
          hiloTitle={(() => {
            const firstUserMsg = messages.find(m => m.role === 'user');
            return firstUserMsg ? firstUserMsg.content.substring(0, 10) : '';
          })()}
        />
      )}
    </AnimatedReanimated.View>
    </GestureHandlerRootView>
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
  thinkingDotContainer: {
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: [{ translateY: -4 }],
    pointerEvents: 'none',
  },
  header: {
    alignItems: 'center',
    marginTop: 58,
    paddingTop: 8,
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    maxWidth: '75%',
    marginBottom: 16
  },
  pdfBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    maxWidth: '75%',
    marginBottom: 16
  },
  userText: {
    fontSize: 16,
    color: '#000'
  },
  chemaContainer: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    backgroundColor: 'transparent',
    borderWidth: 0,
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