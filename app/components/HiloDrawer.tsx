import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useChatContext } from '../../context/ChatContext';
import { Alert, Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import AnimatedReanimated, {
    Easing,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';

const HILO_TITLE_KEY = '@hilo_title';
const DEFAULT_HILO_TITLE = 'Lead with Chema';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

// Cinematic easing — smooth deceleration, no bounce
const EASE_OUT_CUBIC = Easing.out(Easing.cubic);
const OPEN_DURATION = 350;
const CLOSE_DURATION = 300;

interface HiloDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  hiloTitle?: string;
}

export default function HiloDrawer({ isOpen, onClose, isDark, hiloTitle }: HiloDrawerProps) {
  const router = useRouter();
  const { 
    allHilos, 
    currentHiloId,
    createHilo, 
    switchHilo, 
    renameHilo, 
    deleteHilo 
  } = useChatContext();

  const translateX = useSharedValue(isOpen ? 0 : -DRAWER_WIDTH);
  const opacity = useSharedValue(isOpen ? 1 : 0);
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Keep drawer mounted during close animation to prevent white flash
  const [isVisible, setIsVisible] = useState(isOpen);
  
  // Rename modal state
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [savedTitle, setSavedTitle] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');

  // Load saved title from AsyncStorage when drawer opens
  useEffect(() => {
    if (isOpen) {
      loadSavedTitle();
    }
  }, [isOpen]);

  const loadSavedTitle = async () => {
    try {
      const stored = await AsyncStorage.getItem(HILO_TITLE_KEY);
      if (stored !== null) {
        setSavedTitle(stored);
      }
    } catch (err) {
      console.log('Error loading hilo title:', err);
    }
  };

  // Determine display title: savedTitle > hiloTitle prop > default
  const displayTitle = savedTitle || (hiloTitle && hiloTitle.trim() !== '' ? hiloTitle : DEFAULT_HILO_TITLE);

  const handleLongPress = () => {
    setRenameInput(displayTitle);
    setShowRenameModal(true);
  };

  const handleRenameCancel = () => {
    setShowRenameModal(false);
    setRenameInput('');
  };

  const handleRenameSave = async () => {
    const trimmed = renameInput.trim();
    if (trimmed.length > 0) {
      try {
        await AsyncStorage.setItem(HILO_TITLE_KEY, trimmed);
        setSavedTitle(trimmed);
      } catch (err) {
        console.log('Error saving hilo title:', err);
      }
    }
    setShowRenameModal(false);
    setRenameInput('');
  };

  React.useEffect(() => {
    if (isOpen) {
      // Show drawer immediately when opening
      setIsVisible(true);
      // Opening: slide in + fade in
      translateX.value = withTiming(0, { duration: OPEN_DURATION, easing: EASE_OUT_CUBIC });
      opacity.value = withTiming(1, { duration: OPEN_DURATION, easing: EASE_OUT_CUBIC });
    } else if (isVisible) {
      // Closing: slide out + fade, then unmount after animation
      translateX.value = withTiming(-DRAWER_WIDTH, { duration: CLOSE_DURATION, easing: EASE_OUT_CUBIC });
      opacity.value = withTiming(0, { duration: CLOSE_DURATION, easing: EASE_OUT_CUBIC }, () => {
        runOnJS(setIsVisible)(false);
      });
    }
  }, [isOpen]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-DRAWER_WIDTH, 0], [0, 0.5]),
  }));

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      if (e.translationX < 0) {
        translateX.value = Math.max(e.translationX, -DRAWER_WIDTH);
      }
    })
    .onEnd((e) => {
      if (e.translationX < -DRAWER_WIDTH * 0.3 || e.velocityX < -500) {
        // Close with cinematic ease
        translateX.value = withTiming(-DRAWER_WIDTH, { duration: CLOSE_DURATION, easing: EASE_OUT_CUBIC });
        runOnJS(onClose)();
      } else {
        // Snap back open
        translateX.value = withTiming(0, { duration: OPEN_DURATION, easing: EASE_OUT_CUBIC });
      }
    });

  // Render delete button for swipe action
  const renderRightActions = (hiloId: string, hiloTitle: string) => {
    return (
      <TouchableOpacity
        onPress={() => {
          Alert.alert(
            "Delete HILO",
            `Are you sure you want to delete "${hiloTitle}"? This will permanently delete all messages in this conversation.`,
            [
              { text: "Cancel", style: "cancel" },
              { 
                text: "Delete", 
                style: "destructive",
                onPress: async () => {
                  await deleteHilo(hiloId);
                }
              }
            ]
          );
        }}
        style={{
          backgroundColor: '#FF3B30',
          justifyContent: 'center',
          alignItems: 'center',
          width: 80,
          height: '100%'
        }}
      >
        <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
      </TouchableOpacity>
    );
  };

  // Only unmount after close animation completes
  if (!isVisible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop overlay - fades in/out smoothly */}
      <TouchableWithoutFeedback onPress={onClose}>
        <AnimatedReanimated.View 
          style={[
            StyleSheet.absoluteFill, 
            { backgroundColor: '#000000' },
            backdropStyle
          ]} 
        />
      </TouchableWithoutFeedback>

      {/* Drawer */}
      <GestureDetector gesture={panGesture}>
        <AnimatedReanimated.View
          style={[
            styles.drawer,
            { backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF' },
            drawerStyle,
          ]}
        >
          {/* Shadow edge */}
          <View style={[styles.shadowEdge, isDark && styles.shadowEdgeDark]} />

          {/* Header */}
          <Text style={[styles.headerText, { color: isDark ? '#EDEDED' : '#111111' }]}>
            Hilo
          </Text>

          {/* Top half - Future features */}
          <View style={styles.topSection}>
            {/* Decisions */}
            <TouchableOpacity
              onPress={() => {
                onClose();
                router.push('/decisions');
              }}
              style={styles.placeholderSection}
            >
              <Text style={[styles.sectionHeader, { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }]}>
                DECISIONS
              </Text>
            </TouchableOpacity>

            {/* Boardroom placeholder */}
            <Pressable
              onPress={() => {
                Alert.alert(
                  "Boardroom",
                  "Coming soon. Collaborate with your team on strategic decisions.",
                  [{ text: "Got it" }]
                );
              }}
              style={styles.placeholderSection}
            >
              <Text style={[styles.sectionHeader, { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }]}>
                BOARDROOM
              </Text>
              <Text style={[styles.placeholderTitle, { color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }]}>
                Team Strategy
              </Text>
            </Pressable>

            {/* Projects placeholder */}
            <Pressable
              onPress={() => {
                Alert.alert(
                  "Projects",
                  "Coming soon. Track long-term initiatives and milestones.",
                  [{ text: "Got it" }]
                );
              }}
              style={styles.placeholderSection}
            >
              <Text style={[styles.sectionHeader, { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }]}>
                PROJECTS
              </Text>
              <Text style={[styles.placeholderTitle, { color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }]}>
                Initiative Tracking
              </Text>
            </Pressable>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />

          {/* Bottom half - HILOs */}
          <View style={styles.bottomSection}>
            {/* Recents header */}
            <Text style={[styles.sectionHeader, { color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.65)', marginBottom: 8 }]}>
              RECENTS
            </Text>

            {/* HILO list */}
            <GestureHandlerRootView style={{ flex: 1 }}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {allHilos.map((hilo) => {
                  const isActive = hilo.id === currentHiloId;
                  
                  return (
                    <Swipeable
                      key={hilo.id}
                      renderRightActions={() => renderRightActions(hilo.id, hilo.title)}
                      overshootRight={false}
                    >
                      <Pressable
                        onPress={() => {
                          if (!isActive) {
                            switchHilo(hilo.id);
                            onClose();
                          }
                        }}
                        onLongPress={() => {
                          Alert.prompt(
                            "Rename HILO",
                            "Enter new name",
                            [
                              { text: "Cancel", style: "cancel" },
                              { 
                                text: "Rename", 
                                onPress: async (text) => {
                                  if (text && text.trim()) {
                                    await renameHilo(hilo.id, text.trim());
                                  }
                                }
                              }
                            ],
                            "plain-text",
                            hilo.title
                          );
                        }}
                        delayLongPress={400}
                        style={[
                          styles.threadRow,
                          { backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF' },
                          isActive && { 
                            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                          }
                        ]}
                      >
                        <Text 
                          style={[
                            styles.threadTitle, 
                            { color: isDark ? '#EDEDED' : '#111111' },
                            isActive && { fontWeight: '600' }
                          ]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {hilo.title}
                        </Text>
                        
                        {isActive && (
                          <View style={{ 
                            width: 6, 
                            height: 6, 
                            borderRadius: 3, 
                            backgroundColor: isDark ? '#EDEDED' : '#111111',
                            marginLeft: 8
                          }} />
                        )}
                      </Pressable>
                    </Swipeable>
                  );
                })}
              
                {/* Create new HILO button */}
                <TouchableOpacity
                  onPress={() => {
                    Alert.prompt(
                      "New HILO",
                      "What would you like to name this conversation?",
                      [
                        { text: "Cancel", style: "cancel" },
                        { 
                          text: "Create", 
                          onPress: async (text) => {
                            if (text && text.trim()) {
                              await createHilo(text.trim());
                              onClose();
                            }
                          }
                        }
                      ],
                      "plain-text",
                      "Board Meeting Prep"
                    );
                  }}
                  activeOpacity={0.6}
                  style={[
                    styles.pencilButton,
                    { 
                      backgroundColor: isDark ? '#0D0D0D' : '#FFFFFF',
                      borderWidth: 1,
                      borderColor: isDark ? '#3A3A3A' : '#000000',
                      marginTop: 12,
                      alignSelf: 'center'
                    }
                  ]}
                >
                  <Ionicons 
                    name="add" 
                    size={20} 
                    color={isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.50)'} 
                  />
                </TouchableOpacity>
              </ScrollView>
            </GestureHandlerRootView>
          </View>

          {/* Right edge divider */}
          <View 
            style={[
              styles.rightDivider, 
              { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }
            ]} 
          />
        </AnimatedReanimated.View>
      </GestureDetector>

      {/* Rename Modal */}
      <Modal
        visible={showRenameModal}
        transparent
        animationType="fade"
        onRequestClose={handleRenameCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#EDEDED' : '#111111' }]}>
              Rename Hilo
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                { 
                  backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                  color: isDark ? '#EDEDED' : '#111111',
                  borderColor: isDark ? '#3A3A3C' : '#000000'
                }
              ]}
              value={renameInput}
              onChangeText={setRenameInput}
              placeholder="Enter title..."
              placeholderTextColor={isDark ? 'rgba(237,237,237,0.4)' : 'rgba(17,17,17,0.4)'}
              autoFocus
              selectTextOnFocus
              maxLength={50}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                onPress={handleRenameCancel} 
                style={[styles.modalButton, styles.modalButtonCancel]}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalButtonText, { color: isDark ? '#FF453A' : '#FF3B30' }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleRenameSave} 
                style={[styles.modalButton, styles.modalButtonSave, { backgroundColor: isDark ? '#0A84FF' : '#007AFF' }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export { DRAWER_WIDTH };

const styles = StyleSheet.create({
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  shadowEdge: {
    position: 'absolute',
    right: -10,
    top: 0,
    bottom: 0,
    width: 10,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  shadowEdgeDark: {
    shadowColor: '#000',
    shadowOpacity: 0.4,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
  },
  topSection: {
    paddingTop: 8,
  },
  bottomSection: {
    flex: 1,
    paddingBottom: 20,
  },
  placeholderSection: {
    marginBottom: 16,
    paddingVertical: 8,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  contentArea: {
    flex: 1,
  },
  threadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 4,
    paddingRight: 16,
  },
  threadTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    marginRight: 12,
  },
  pencilButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltip: {
    position: 'absolute',
    top: 56,
    left: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
  teaserContainer: {
    position: 'absolute',
    bottom: 50,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  teaserTitle: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 4,
  },
  teaserSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
  },
  rightDivider: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.8,
    maxWidth: 320,
    borderRadius: 14,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalInput: {
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: 'transparent',
  },
  modalButtonSave: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

