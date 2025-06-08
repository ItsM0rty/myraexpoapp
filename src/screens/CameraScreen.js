import React, { useState, useRef, useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useCameraPermissions } from 'expo-camera';
import { useSharedValue } from 'react-native-reanimated';

import { CameraView } from '../components/cameraComponents/CameraView';
import { PreviewScreen } from '../components/cameraComponents/PreviewScreen';
import { ErrorScreen } from '../components/cameraComponents/ErrorScreen';
import { useCameraLogic } from '../components/cameraComponents/useCameraLogic';
import { useAnimations } from '../components/cameraComponents/useAnimations';
import { styles } from '../components/cameraComponents/CameraStyles';
import { initializeCameraWithDetection } from '../components/cameraComponents/VirtualDeviceDetector';

const { height } = Dimensions.get('window');

export default function CameraScreen({ onBack }) {
  // Basic state
  const [facing, setFacing] = useState('back');
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [postMode, setPostMode] = useState('dailies');
  const [audienceMode, setAudienceMode] = useState('public');
  const [flashMode, setFlashMode] = useState('off');
  const [isVirtualDevice, setIsVirtualDevice] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [zoom, setZoom] = useState(0);
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);
  
  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [dailiesDuration, setDailiesDuration] = useState('12h');
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);
  
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  
  // Shared values for animations
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const flashOpacity = useSharedValue(0);
  const zoomOpacity = useSharedValue(1);
  const settingsOpacity = useSharedValue(0);
  const settingsScale = useSharedValue(0.8);
  const dropdownOpacity = useSharedValue(0);
  const dropdownScale = useSharedValue(0.8);

  // Custom hooks - Make sure all required props are passed
  const cameraLogic = useCameraLogic({
    cameraRef,
    isCapturing,
    setIsCapturing,
    isVirtualDevice,
    setCapturedImage,
    setCameraError,
    flashOpacity,
    facing,
    setFacing,
    scale,
    savedScale,
    setZoom,
    isSwitchingCamera, // Make sure this is passed, not just setIsSwitchingCamera
    setIsSwitchingCamera,
  });

  const animations = useAnimations({
    flashOpacity,
    zoomOpacity,
    settingsOpacity,
    settingsScale,
    dropdownOpacity,
    dropdownScale,
    showSettings,
    setShowSettings,
    showDurationDropdown,
    setShowDurationDropdown,
    setDailiesDuration,
  });

  // Camera permission and device validation
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
      
      setIsVirtualDevice(false);
    };

    initializeCamera();
  }, [permission]);

  // Initial zoom indicator fade out
  useEffect(() => {
    animations.hideZoomIndicator();
  }, []);

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const postPhoto = () => {
    if (!capturedImage || isVirtualDevice) return;
    
    console.log(`Posting as ${postMode} to ${audienceMode} with image:`, capturedImage);
    console.log(`Dailies duration: ${dailiesDuration}`);
    retakePhoto();
    if (onBack) onBack();
  };

  // Debug function to test capture
  const handleCapturePress = () => {
    console.log('Shutter button pressed!');
    console.log('Current states:', {
      isCapturing,
      isVirtualDevice,
      cameraRef: !!cameraRef.current,
      facing
    });
    
    if (cameraLogic.capturePhoto) {
      console.log('Calling capturePhoto...');
      cameraLogic.capturePhoto();
    } else {
      console.log('ERROR: capturePhoto function not found!');
    }
  };

  // Error state
  if (isVirtualDevice || cameraError) {
    return (
      <ErrorScreen 
        isVirtualDevice={isVirtualDevice}
        cameraError={cameraError}
        onRetry={() => {
          setIsVirtualDevice(false);
          setCameraError(null);
        }}
        onBack={onBack}
      />
    );
  }

  // Preview captured image
  if (capturedImage) {
    return (
      <PreviewScreen
        capturedImage={capturedImage}
        postMode={postMode}
        setPostMode={setPostMode}
        audienceMode={audienceMode}
        setAudienceMode={setAudienceMode}
        onRetake={retakePhoto}
        onPost={postPhoto}
      />
    );
  }

  // Camera view
  return (
    <GestureHandlerRootView style={styles.container}>
      <CameraView
        cameraRef={cameraRef}
        facing={facing}
        flashMode={flashMode}
        setFlashMode={setFlashMode}
        zoom={zoom}
        isVirtualDevice={isVirtualDevice}
        isSwitchingCamera={isSwitchingCamera}
        postMode={postMode}
        setPostMode={setPostMode}
        showSettings={showSettings}
        dailiesDuration={dailiesDuration}
        showDurationDropdown={showDurationDropdown}
        scale={scale}
        savedScale={savedScale}
        setZoom={setZoom}
        onCapture={handleCapturePress}
        onSwitchCamera={cameraLogic.switchCamera}
        onToggleSettings={animations.toggleSettings}
        onToggleDurationDropdown={animations.toggleDurationDropdown}
        onSelectDuration={animations.selectDuration}
        animations={animations}
        isCapturing={isCapturing}
      />
    </GestureHandlerRootView>
  );
}