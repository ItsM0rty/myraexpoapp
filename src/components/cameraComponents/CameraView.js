import React from 'react';
import { View, TouchableOpacity, Text, Dimensions } from 'react-native';
import { CameraView as ExpoCameraView } from 'expo-camera';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS } from 'react-native-reanimated';
import { 
  Zap, 
  ZapOff, 
  Settings2, 
  RefreshCcw,
  ChevronDown,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = 6/8;

export const CameraView = ({
  cameraRef,
  facing,
  flashMode,
  setFlashMode,
  zoom,
  setZoom,
  isVirtualDevice,
  isSwitchingCamera,
  postMode,
  setPostMode,
  showSettings,
  dailiesDuration,
  showDurationDropdown,
  scale,
  savedScale,
  onCapture,
  onSwitchCamera,
  onToggleSettings,
  onToggleDurationDropdown,
  onSelectDuration,
  animations,
  isCapturing,
}) => {
  // Convert zoom to display value (1.0x to 5.0x)
  const zoomToDisplay = (zoomValue) => {
    return (zoomValue * 4 + 1).toFixed(1);
  };

  // Convert scale to zoom value (0-1 range for expo-camera)
  const scaleToZoom = (scaleValue) => {
    const clampedScale = Math.max(1, Math.min(5, scaleValue));
    return (clampedScale - 1) / 4;
  };

  // Update zoom from gesture scale
  const updateZoomFromScale = (newScale) => {
    const newZoom = scaleToZoom(newScale);
    setZoom(newZoom);
    animations.showZoomIndicator();
  };

  // Pinch gesture for zoom
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      const newScale = savedScale.value * event.scale;
      const clampedScale = Math.max(1, Math.min(5, newScale));
      scale.value = clampedScale;
      runOnJS(updateZoomFromScale)(clampedScale);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  return (
    <View style={styles.container}>
      {/* Soft flash overlay */}
      <Animated.View 
        style={[styles.flashOverlay, animations.flashAnimatedStyle]} 
        pointerEvents="none"
      />

      {/* Top controls */}
      <View style={styles.topControls}>
        <TouchableOpacity
          onPress={() => setFlashMode(prev => prev === 'off' ? 'on' : 'off')}
          style={styles.topControlButton}
          disabled={isVirtualDevice}
        >
          {flashMode === 'off' ? (
            <ZapOff size={28} color="#ffffff" />
          ) : (
            <Zap size={28} color="#fbbf24" />
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.topControlButton}
          onPress={onToggleSettings}
        >
          <Settings2 size={28} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Settings Dropdown */}
      {showSettings && (
        <Animated.View style={[styles.settingsDropdown, animations.settingsAnimatedStyle]}>
          <Text style={styles.settingsTitle}>Settings</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Dailies duration</Text>
          </View>

          {/* Duration Selector integrated */}
          <TouchableOpacity 
            style={[
              styles.durationSelector,
              showDurationDropdown && styles.durationSelectorExpanded
            ]}
            onPress={onToggleDurationDropdown}
          >
            <View style={styles.durationSelectorContent}>
              <Text style={styles.durationText}>{dailiesDuration}</Text>
              <ChevronDown 
                size={16} 
                color="#ffffff" 
                style={[
                  styles.chevronIcon,
                  showDurationDropdown && styles.chevronIconRotated
                ]}
              />
            </View>
            
            {/* Expanded options */}
            {showDurationDropdown && (
              <Animated.View style={[styles.durationOptions, animations.dropdownAnimatedStyle]}>
                <TouchableOpacity 
                  style={[styles.durationOption, dailiesDuration === '12h' && styles.durationOptionActive]}
                  onPress={() => onSelectDuration('12h')}
                >
                  <Text style={[styles.durationOptionText, dailiesDuration === '12h' && styles.durationOptionTextActive]}>
                    12h
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.durationOption, dailiesDuration === '24h' && styles.durationOptionActive]}
                  onPress={() => onSelectDuration('24h')}
                >
                  <Text style={[styles.durationOptionText, dailiesDuration === '24h' && styles.durationOptionTextActive]}>
                    24h
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Zoom indicator - always visible, positioned above camera */}
      <View style={styles.zoomIndicator}>
        <Text style={styles.zoomText}>{zoomToDisplay(zoom)}x</Text>
      </View>

      {/* Camera viewfinder with pinch gesture */}
      <View style={styles.cameraContainer}>
        <View style={styles.cameraFrame}>
          <GestureDetector gesture={pinchGesture}>
            <View style={styles.cameraWrapper}>
              <ExpoCameraView
                ref={cameraRef}
                style={styles.camera}
                facing={facing}
                flash={flashMode}
                zoom={zoom}
                mirror={facing === 'front'}
              />
            </View>
          </GestureDetector>
        </View>
      </View>



      {/* Bottom controls */}
      <View style={styles.bottomControlsContainer}>
        <View style={styles.bottomControls}>
          {/* Gallery preview */}
          <View style={styles.galleryPreview}>
            <View style={styles.galleryCircle1} />
            <View style={styles.galleryCircle2} />
          </View>

          {/* Capture button */}
          <TouchableOpacity 
            style={[styles.captureButton, (isCapturing || isVirtualDevice) && styles.captureButtonDisabled]}
            onPress={onCapture}
            disabled={isCapturing || isVirtualDevice}
            activeOpacity={isCapturing ? 0.3 : 0.7}
          >
            <View style={[styles.captureButtonInner, isCapturing && styles.captureButtonCapturing]} />
          </TouchableOpacity>

          {/* Camera switch button */}
          <TouchableOpacity 
            onPress={onSwitchCamera}
            style={[styles.switchButton, (isVirtualDevice || isSwitchingCamera) && styles.switchButtonDisabled]}
            disabled={isVirtualDevice || isSwitchingCamera}
          >
            <RefreshCcw size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Updated styles
const styles = {
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  flashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    zIndex: 1000,
  },
  topControls: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  topControlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsDropdown: {
    position: 'absolute',
    top: 80,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(20px)',
    borderRadius: 16,
    padding: 20,
    minWidth: 240,
    zIndex: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 20,
  },
  settingRow: {
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  durationSelector: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  durationSelectorExpanded: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  durationSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  durationText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  chevronIcon: {
    transform: [{ rotate: '0deg' }],
  },
  chevronIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
  durationOptions: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  durationOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  durationOptionActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  durationOptionText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  durationOptionTextActive: {
    fontWeight: '600',
  },
  zoomIndicator: {
    position: 'absolute',
    top: 65,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    zIndex: 15,
  },
  zoomText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 16,
    paddingTop: 95,
    backgroundColor: '#000000',
  },
  cameraFrame: {
    aspectRatio: ASPECT_RATIO,
    width: '100%',
    maxWidth: 400,
    maxHeight: height - 200,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000000',
    position: 'relative',
  },
  cameraWrapper: {
    width: '100%',
    height: '100%',
  },
  camera: {
    width: '100%',
    height: '100%',
  },

  bottomControlsContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  bottomControls: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    borderRadius: 50,
    paddingHorizontal: 32,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  galleryPreview: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  galleryCircle1: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: 'transparent',
  },
  galleryCircle2: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: 'transparent',
    transform: [{ translateX: 8 }, { translateY: 4 }],
  },
  captureButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
  },
  captureButtonCapturing: {
    backgroundColor: '#9ca3af',
  },
  switchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchButtonDisabled: {
    opacity: 0.5,
  },
};