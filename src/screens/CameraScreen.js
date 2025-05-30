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
import * as Device from 'expo-device';
import { 
  ArrowLeft, 
  Zap, 
  ZapOff, 
  Settings, 
  RefreshCcw, 
  AlertTriangle,
  Image as ImageIcon,
  Calendar,
  Globe,
  Users
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

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
  const cameraRef = useRef(null);

  // Enhanced virtual device and emulator detection for mobile
  const detectVirtualDevice = async () => {
    try {
      let suspicionScore = 0;
      const detectionReasons = [];

      // 1. Check if running on physical device
      if (!Device.isDevice) {
        suspicionScore += 10;
        detectionReasons.push('Running on emulator/simulator');
      }

      // 2. Check device characteristics
      const deviceInfo = {
        brand: Device.brand,
        manufacturer: Device.manufacturer,
        modelName: Device.modelName,
        deviceName: Device.deviceName,
        osName: Device.osName,
        osVersion: Device.osVersion
      };

      // Common emulator/virtual device identifiers
      const suspiciousIdentifiers = [
        'generic', 'emulator', 'simulator', 'virtual', 'test',
        'android sdk', 'genymotion', 'bluestacks', 'nox', 'memu',
        'ldplayer', 'remix', 'andy', 'droid4x', 'koplayer',
        'x86', 'goldfish', 'ranchu', 'vbox', 'qemu'
      ];

      const deviceString = JSON.stringify(deviceInfo).toLowerCase();
      const matchedSuspicious = suspiciousIdentifiers.filter(identifier => 
        deviceString.includes(identifier)
      );

      if (matchedSuspicious.length > 0) {
        suspicionScore += matchedSuspicious.length * 2;
        detectionReasons.push(`Suspicious device identifiers: ${matchedSuspicious.join(', ')}`);
      }

      // 3. Platform-specific checks
      if (Platform.OS === 'android') {
        // Android-specific emulator detection
        if (deviceInfo.brand === 'generic' || deviceInfo.manufacturer === 'Genymotion') {
          suspicionScore += 5;
          detectionReasons.push('Android emulator detected');
        }

        // Check for common Android emulator model names
        const androidEmulatorModels = [
          'android sdk built for x86',
          'android sdk built for arm',
          'sdk_gphone',
          'emulator',
          'android_x86'
        ];

        const modelName = deviceInfo.modelName?.toLowerCase() || '';
        const matchedEmulatorModels = androidEmulatorModels.filter(model => 
          modelName.includes(model)
        );

        if (matchedEmulatorModels.length > 0) {
          suspicionScore += 3;
          detectionReasons.push('Android emulator model detected');
        }
      }

      if (Platform.OS === 'ios') {
        // iOS Simulator detection
        if (deviceInfo.modelName?.includes('Simulator')) {
          suspicionScore += 5;
          detectionReasons.push('iOS Simulator detected');
        }
      }

      // 4. Check for rooted/jailbroken devices (common in testing environments)
      // Note: This would require additional native modules for full detection
      
      return {
        isVirtual: suspicionScore >= 3,
        suspicionScore,
        reasons: detectionReasons,
        deviceInfo
      };

    } catch (error) {
      console.error('Error in virtual device detection:', error);
      return {
        isVirtual: false,
        suspicionScore: 0,
        reasons: ['Detection failed'],
        deviceInfo: null
      };
    }
  };

  // Camera permission and device validation
  useEffect(() => {
    const initializeCamera = async () => {
      try {
        setCameraError(null);
        
        // Step 1: Virtual device detection
        const detection = await detectVirtualDevice();
        
        if (detection.isVirtual) {
          setIsVirtualDevice(true);
          setCameraError(`Virtual device detected: ${detection.reasons.join(', ')}`);
          console.warn('Virtual device detection:', detection);
          return;
        }

        // Step 2: Check camera permissions
        if (!permission) {
          return; // Still loading
        }

        if (!permission.granted) {
          const response = await requestPermission();
          if (!response.granted) {
            setCameraError('Camera permission is required to use this feature.');
            return;
          }
        }

        // Step 3: Additional security checks
        if (!Device.isDevice) {
          setIsVirtualDevice(true);
          setCameraError('This feature only works on physical devices.');
          return;
        }

        // Log successful initialization
        console.log('Camera initialized successfully on device:', detection.deviceInfo);
        setIsVirtualDevice(false);

      } catch (error) {
        console.error('Camera initialization error:', error);
        setCameraError('Failed to initialize camera. Please try again.');
      }
    };

    initializeCamera();
  }, [permission]);

  // Enhanced photo capture with validation
  const capturePhoto = async () => {
    if (!cameraRef.current || isCapturing || isVirtualDevice) return;
    
    setIsCapturing(true);
    
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
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
    if (!isVirtualDevice) {
      setFacing(current => (current === 'back' ? 'front' : 'back'));
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
    <View style={styles.container}>
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
          <Settings size={28} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Camera viewfinder */}
      <View style={styles.cameraContainer}>
        <View style={styles.cameraFrame}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            flash={flashMode}
          />
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
          >
            <View style={[styles.captureButtonInner, isCapturing && styles.captureButtonCapturing]} />
          </TouchableOpacity>

          {/* Camera switch button */}
          <TouchableOpacity 
            onPress={switchCamera}
            style={[styles.switchButton, isVirtualDevice && styles.switchButtonDisabled]}
            disabled={isVirtualDevice}
          >
            <RefreshCcw size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
    width: '100%',
    maxWidth: 320,
    aspectRatio: 4/5,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  postControls: {
    padding: 24,
    backgroundColor: '#000000',
    gap: 24,
  },
  controlSection: {
    gap: 12,
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#000000',
  },
  cameraFrame: {
    aspectRatio: 4/5,
    width: '100%',
    maxWidth: 400,
    maxHeight: height - 160,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000000',
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
});