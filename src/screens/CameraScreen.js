import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  Dimensions, 
  StyleSheet, 
  Alert,
  Platform
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { 
  ArrowLeft, 
  Zap, 
  ZapOff, 
  Settings2, 
  RefreshCcw, 
  AlertTriangle,
  Image as ImageIcon,
  Calendar,
  Globe,
  Users
} from 'lucide-react-native';
import { 
  Gesture, 
  GestureDetector, 
  GestureHandlerRootView 
} from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  runOnJS 
} from 'react-native-reanimated';
import { initializeCameraWithDetection } from '../components/VirtualDeviceDetector';

const { width, height } = Dimensions.get('window');

// Aspect ratio constant for easy switching
const ASPECT_RATIO = 6/8; // Change to 5/6 when needed

export default function CameraScreen({ onBack }) {
  const [facing, setFacing] = useState('back');
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [postMode, setPostMode] = useState('post');
  const [audienceMode, setAudienceMode] = useState('public');
  const [flashMode, setFlashMode] = useState('off');
  const [isVirtualDevice, setIsVirtualDevice] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [zoom, setZoom] = useState(0);
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);
  const cameraRef = useRef(null);
  
  // Pinch-to-zoom gesture values
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  
  // Flash animation
  const flashOpacity = useSharedValue(0);

  // Camera permission and device validation using the extracted detector
  useEffect(() => {
    const initializeCamera = async () => {
      setCameraError(null);
      
      const result = await initializeCameraWithDetection(permission, requestPermission);
      
      if (result.isVirtualDevice) {
        setIsVirtualDevice(true);
        setCameraError(result.error);
        return;
      }
      
      if (result.error) {
        setCameraError(result.error);
        return;
      }
      
      // Camera initialized successfully
      setIsVirtualDevice(false);
    };

    initializeCamera();
  }, [permission]);

  // Convert scale to zoom value (0-1 range for expo-camera)
  const scaleToZoom = (scaleValue) => {
    // Map scale 1-5 to zoom 0-1, with more granular control
    const clampedScale = Math.max(1, Math.min(5, scaleValue));
    return (clampedScale - 1) / 4; // 0 to 1 range
  };

  // Convert zoom to display value (1.0x to 5.0x)
  const zoomToDisplay = (zoomValue) => {
    return (zoomValue * 4 + 1).toFixed(1);
  };

  // Update zoom from gesture scale
  const updateZoomFromScale = (newScale) => {
    const newZoom = scaleToZoom(newScale);
    setZoom(newZoom);
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

  // Trigger flash animation
  const triggerFlash = () => {
    flashOpacity.value = withTiming(0.3, { duration: 50 }, () => {
      flashOpacity.value = withTiming(0, { duration: 200 });
    });
  };

  // Flash animation style
  const flashAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: flashOpacity.value,
    };
  });

  // Enhanced photo capture with validation
  const capturePhoto = async () => {
    if (!cameraRef.current || isCapturing || isVirtualDevice) return;
    
    setIsCapturing(true);
    
    // Trigger soft flash animation
    triggerFlash();
    
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
        aspect: ASPECT_RATIO === 6/8 ? [6, 8] : ASPECT_RATIO === 4/5 ? [4, 5] : [5, 6],
        shutterSound: false, // This disables the shutter sound completely
      });

      if (!photo || !photo.uri) {
        throw new Error('Failed to capture photo');
      }

      // Additional validation: check image dimensions and file size
      const imageInfo = await fetch(photo.uri, { method: 'HEAD' });
      const contentLength = imageInfo.headers.get('content-length');
      
      if (contentLength && parseInt(contentLength) < 1000) {
        throw new Error('Captured image appears to be invalid');
      }

      setCapturedImage(photo.uri);
      
    } catch (error) {
      console.error('Photo capture error:', error);
      setCameraError('Failed to capture photo. Please try again.');
    }
    
    setIsCapturing(false);
  };

  const switchCamera = () => {
    if (!isVirtualDevice && !isSwitchingCamera) {
      setIsSwitchingCamera(true);
      setFacing(current => (current === 'back' ? 'front' : 'back'));
      // Reset zoom when switching cameras
      scale.value = 1;
      savedScale.value = 1;
      setZoom(0);
      // Reduce switch time
      setTimeout(() => {
        setIsSwitchingCamera(false);
      }, 200);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const postPhoto = () => {
    if (!capturedImage || isVirtualDevice) return;
    
    console.log(`Posting as ${postMode} to ${audienceMode} with image:`, capturedImage);
    retakePhoto();
    if (onBack) onBack();
  };

  // Error state for virtual device detection
  if (isVirtualDevice || cameraError) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <View style={styles.errorIconContainer}>
            <AlertTriangle size={40} color="#f87171" />
          </View>
          
          <View style={styles.errorTextContainer}>
            <Text style={styles.errorTitle}>
              {isVirtualDevice ? 'Virtual Device Detected' : 'Camera Access Issue'}
            </Text>
            <Text style={styles.errorMessage}>
              {cameraError || 'This feature only works on physical devices with real cameras.'}
            </Text>
          </View>
          
          <View style={styles.errorButtonContainer}>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                setIsVirtualDevice(false);
                setCameraError(null);
              }}
            >
              <Text style={styles.retryButtonText}>
                {isVirtualDevice ? 'Use Physical Device' : 'Retry Camera Access'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.backButton}
              onPress={onBack}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.noteText}>
            Note: Only physical device cameras are allowed.
          </Text>
        </View>
      </View>
    );
  }

  // Preview captured image
  if (capturedImage) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.previewHeader}>
          <TouchableOpacity onPress={retakePhoto}>
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.previewTitle}>Preview</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Preview Image */}
        <View style={styles.previewContainer}>
          <View style={styles.previewImageContainer}>
            <Image 
              source={{ uri: capturedImage }}
              style={styles.previewImage}
              resizeMode="cover"
            />
          </View>
        </View>
        
        {/* Post Controls */}
        <View style={styles.postControls}>
          {/* Post Type Toggle */}
          <View style={styles.controlSection}>
            <Text style={styles.controlLabel}>Post Type</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                onPress={() => setPostMode('post')}
                style={[
                  styles.toggleButton,
                  postMode === 'post' ? styles.toggleButtonActive : styles.toggleButtonInactive
                ]}
              >
                <ImageIcon size={16} color={postMode === 'post' ? '#000000' : '#9ca3af'} />
                <Text style={[
                  styles.toggleButtonText,
                  postMode === 'post' ? styles.toggleButtonTextActive : styles.toggleButtonTextInactive
                ]}>
                  Post
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPostMode('dailies')}
                style={[
                  styles.toggleButton,
                  postMode === 'dailies' ? styles.toggleButtonActive : styles.toggleButtonInactive
                ]}
              >
                <Calendar size={16} color={postMode === 'dailies' ? '#000000' : '#9ca3af'} />
                <Text style={[
                  styles.toggleButtonText,
                  postMode === 'dailies' ? styles.toggleButtonTextActive : styles.toggleButtonTextInactive
                ]}>
                  Dailies
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Audience Toggle (only show for dailies) */}
          {postMode === 'dailies' && (
            <View style={styles.controlSection}>
              <Text style={styles.controlLabel}>Audience</Text>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  onPress={() => setAudienceMode('public')}
                  style={[
                    styles.toggleButton,
                    audienceMode === 'public' ? styles.toggleButtonActive : styles.toggleButtonInactive
                  ]}
                >
                  <Globe size={16} color={audienceMode === 'public' ? '#000000' : '#9ca3af'} />
                  <Text style={[
                    styles.toggleButtonText,
                    audienceMode === 'public' ? styles.toggleButtonTextActive : styles.toggleButtonTextInactive
                  ]}>
                    Public
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setAudienceMode('followers')}
                  style={[
                    styles.toggleButton,
                    audienceMode === 'followers' ? styles.toggleButtonActive : styles.toggleButtonInactive
                  ]}
                >
                  <Users size={16} color={audienceMode === 'followers' ? '#000000' : '#9ca3af'} />
                  <Text style={[
                    styles.toggleButtonText,
                    audienceMode === 'followers' ? styles.toggleButtonTextActive : styles.toggleButtonTextInactive
                  ]}>
                    Followers
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Share Button */}
          <TouchableOpacity 
            onPress={postPhoto}
            style={styles.shareButton}
          >
            <Text style={styles.shareButtonText}>
              {postMode === 'post' ? 'Share Post' : `Share to ${audienceMode === 'public' ? 'Public' : 'Followers'} Dailies`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Camera view
  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        {/* Soft flash overlay */}
        <Animated.View 
          style={[styles.flashOverlay, flashAnimatedStyle]} 
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

          <TouchableOpacity style={styles.topControlButton}>
            <Settings2 size={28} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Zoom indicator - moved up slightly */}
        <View style={styles.zoomIndicator}>
          <Text style={styles.zoomText}>{zoomToDisplay(zoom)}x</Text>
        </View>

        {/* Camera viewfinder with pinch gesture */}
        <View style={styles.cameraContainer}>
          <View style={styles.cameraFrame}>
            <GestureDetector gesture={pinchGesture}>
              <View style={styles.cameraWrapper}>
                <CameraView
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
              onPress={capturePhoto}
              disabled={isCapturing || isVirtualDevice}
              activeOpacity={isCapturing ? 0.3 : 0.7}
            >
              <View style={[styles.captureButtonInner, isCapturing && styles.captureButtonCapturing]} />
            </TouchableOpacity>

            {/* Camera switch button */}
            <TouchableOpacity 
              onPress={switchCamera}
              style={[styles.switchButton, (isVirtualDevice || isSwitchingCamera) && styles.switchButtonDisabled]}
              disabled={isVirtualDevice || isSwitchingCamera}
            >
              <RefreshCcw size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
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
  errorContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorContent: {
    alignItems: 'center',
    maxWidth: 320,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorTextContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 14,
    color: '#d1d5db',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorButtonContainer: {
    width: '100%',
    gap: 12,
  },
  retryButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
  },
  backButton: {
    borderWidth: 1,
    borderColor: '#4b5563',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  noteText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 24,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#000000',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#ffffff',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 16,
  },
  previewImageContainer: {
    aspectRatio: ASPECT_RATIO,
    width: '100%',
    maxWidth: 400,
    maxHeight: height - 160,
    borderRadius: 24, // Match camera frame border radius
    overflow: 'hidden', // Ensure all corners are rounded
    backgroundColor: '#000000',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  postControls: {
    padding: 24,
    backgroundColor: '#000000',
    gap: 24,
  },
  controlSection: {
    gap: 5,
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#18181b',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#ffffff',
  },
  toggleButtonInactive: {
    backgroundColor: 'transparent',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  toggleButtonTextActive: {
    color: '#000000',
  },
  toggleButtonTextInactive: {
    color: '#9ca3af',
  },
  shareButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
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
  cameraContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 16,
    paddingTop: 85,
    backgroundColor: '#000000',
  },
  cameraFrame: {
    aspectRatio: ASPECT_RATIO,
    width: '100%',
    maxWidth: 400,
    maxHeight: height - 160,
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
  zoomIndicator: {
    position: 'absolute',
    top: 55, 
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 15,
  },
  zoomText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
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
});