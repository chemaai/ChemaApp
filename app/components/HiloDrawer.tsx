import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import { Alert, Dimensions, StyleSheet, Text, View, TouchableWithoutFeedback, Pressable, TouchableOpacity, Modal, TextInput } from 'react-native';

const HILO_TITLE_KEY = '@hilo_title';
const DEFAULT_HILO_TITLE = 'Lead with Chema';
import AnimatedReanimated, { 
  Easing,
  interpolate,
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

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
  const translateX = useSharedValue(isOpen ? 0 : -DRAWER_WIDTH);
  const opacity = useSharedValue(isOpen ? 1 : 0);
  const [showTooltip, setShowTooltip] = useState(false);
  
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
      // Opening: slide in + fade in
      translateX.value = withTiming(0, { duration: OPEN_DURATION, easing: EASE_OUT_CUBIC });
      opacity.value = withTiming(1, { duration: OPEN_DURATION, easing: EASE_OUT_CUBIC });
    } else {
      // Closing: slide out + subtle fade
      translateX.value = withTiming(-DRAWER_WIDTH, { duration: CLOSE_DURATION, easing: EASE_OUT_CUBIC });
      opacity.value = withTiming(0.85, { duration: CLOSE_DURATION, easing: EASE_OUT_CUBIC });
    }
  }, [isOpen]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: interpolate(translateX.value, [-DRAWER_WIDTH, 0], [0.85, 1]),
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

  if (!isOpen) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Overlay to close drawer when tapping chat area */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, { left: DRAWER_WIDTH }]} />
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

          {/* Thread list area */}
          <View style={styles.contentArea}>
            {/* Single thread row — Apple Files style */}
            <Pressable
              onPress={() => {}}
              onLongPress={handleLongPress}
              delayLongPress={400}
              style={styles.threadRow}
            >
              <Text 
                style={[
                  styles.threadTitle, 
                  { color: isDark ? '#EDEDED' : '#111111' }
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {displayTitle}
              </Text>
              <TouchableOpacity
                onPress={() => Alert.alert("Coming Soon", "More Hilos are coming soon!")}
                activeOpacity={0.7}
                style={[
                  styles.pencilButton,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.05)' }
                ]}
              >
                <Ionicons 
                  name="pencil" 
                  size={16} 
                  color={isDark ? '#EDEDED' : '#111111'} 
                />
              </TouchableOpacity>
            </Pressable>

            {/* Tooltip for long-press */}
            {showTooltip && (
              <View style={[styles.tooltip, { backgroundColor: isDark ? '#333' : '#222' }]}>
                <Text style={styles.tooltipText}>Rename coming soon</Text>
              </View>
            )}
          </View>

          {/* Teaser content — positioned at bottom */}
          <View style={styles.teaserContainer}>
            <Text style={[styles.teaserTitle, { color: isDark ? 'rgba(237,237,237,0.6)' : 'rgba(17,17,17,0.6)' }]}>
              More threads coming soon…
            </Text>
            <Text style={[styles.teaserSubtitle, { color: isDark ? 'rgba(237,237,237,0.6)' : 'rgba(17,17,17,0.6)' }]}>
              Chema is organizing your future.
            </Text>
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
                  borderColor: isDark ? '#3A3A3C' : '#E5E5EA'
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
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
  },
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
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
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

