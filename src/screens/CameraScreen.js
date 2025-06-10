import React, { useState, useRef, useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useCameraPermissions } from 'expo-camera';
import { useSharedValue } from 'react-native-reanimated';

import { CameraView } from '../components/cameraComponents/CameraView';
import { PostCaptureScreen } from '../components/cameraComponents/PostCaptureScreen';
import { ErrorScreen } from '../components/cameraComponents/ErrorScreen';
import { useCameraLogic } from '../components/cameraComponents/useCameraLogic';
import { useAnimations } from '../components/cameraComponents/useAnimations';
import { styles } from '../components/cameraComponents/CameraStyles';
import { initializeCameraWithDetection } from '../components/cameraComponents/VirtualDeviceDetector';

const { height } = Dimensions.get('window');

export default function CameraScreen({ onBack, onNavbarToggle }) {
  // Basic state
  const [facing, setFacing] = useState('back');
  const [capturedImages, setCapturedImages] = useState([]); // Changed to array
  const [showPostCapture, setShowPostCapture] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [postMode, setPostMode] = useState('dailies');
  const [audienceMode, setAudienceMode] = useState('public');
  const [flashMode, setFlashMode] = useState('off');
  const [isVirtualDevice, setIsVirtualDevice] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [zoom, setZoom] = useState(0);
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);
  
  // Settings state - removed dailiesDuration since it's now handled in CameraView
  const [showSettings, setShowSettings] = useState(false);
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);
  
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  
  // Shared values for animations
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const flashOpacity = useSharedValue(0);
  const settingsOpacity = useSharedValue(0);
  const settingsScale = useSharedValue(0.8);
  const dropdownOpacity = useSharedValue(0);
  const dropdownScale = useSharedValue(0.8);

  // Track if we're currently adding more images
  const [isAddingMore, setIsAddingMore] = useState(false);

  // Control navbar visibility based on current screen
  useEffect(() => {
    if (onNavbarToggle) {
      if (showPostCapture) {
        onNavbarToggle(false); // Hide navbar in PostCaptureScreen
      } else {
        onNavbarToggle(true); // Show navbar in CameraView
      }
    }
  }, [showPostCapture, onNavbarToggle]);

  // Cleanup function to show navbar when component unmounts
  useEffect(() => {
    return () => {
      if (onNavbarToggle) {
        onNavbarToggle(true); // Show navbar when leaving camera screen entirely
      }
    };
  }, [onNavbarToggle]);

  // Custom hooks - modified to work with array
  const cameraLogic = useCameraLogic({
    cameraRef,
    isCapturing,
    setIsCapturing,
    isVirtualDevice,
    setCapturedImage: (imageUri) => {
      if (imageUri) {
        const newImage = { uri: imageUri, timestamp: Date.now() };
        setCapturedImages(prev => {
          const newImages = [...prev, newImage];
          console.log('New image captured, total images:', newImages.length);
          
          // If we were adding more, we need to trigger the post-capture screen
          if (isAddingMore) {
            console.log('Was adding more, will show post-capture screen');
            // Use setTimeout to ensure state updates happen in the right order
            setTimeout(() => {
              setIsAddingMore(false);
              setShowPostCapture(true);
            }, 0);
          }
          
          return newImages;
        });
      }
    },
    setCameraError,
    flashOpacity,
    facing,
    setFacing,
    scale,
    savedScale,
    setZoom,
    isSwitchingCamera,
    setIsSwitchingCamera,
  });

  const animations = useAnimations({
    flashOpacity,
    settingsOpacity,
    settingsScale,
    dropdownOpacity,
    dropdownScale,
    showSettings,
    setShowSettings,
    showDurationDropdown,
    setShowDurationDropdown,
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

  // Watch for captured images changes and show post-capture screen
  useEffect(() => {
    console.log('capturedImages changed:', capturedImages.length);
    
    // Only show post-capture screen for the FIRST capture (not when adding more)
    if (capturedImages.length === 1 && !showPostCapture && !isAddingMore) {
      console.log('First image captured, showing post-capture screen');
      setShowPostCapture(true);
    }
  }, [capturedImages.length]);

  // Handle successful photo capture
  const handleCapture = async () => {
    console.log('Shutter button pressed!');
    console.log('Current states:', {
      isCapturing,
      isVirtualDevice,
      cameraRef: !!cameraRef.current,
      facing
    });
    
    if (cameraLogic.capturePhoto) {
      console.log('Calling capturePhoto...');
      await cameraLogic.capturePhoto();
      // No need to check result - useEffect will handle showing PostCaptureScreen
    } else {
      console.log('ERROR: capturePhoto function not found!');
    }
  };

  // Handle adding more images
  const handleAddMore = () => {
    if (capturedImages.length < 3) {
      // Set flag to indicate we're adding more images
      setIsAddingMore(true);
      setShowPostCapture(false);
      console.log('Adding more photos, current images:', capturedImages.length);
    }
  };

  // Handle adding new image (called from PostCaptureScreen when new image is captured)
  const handleAddNewImage = (imageUri) => {
    if (capturedImages.length < 3 && imageUri) {
      const newImage = { uri: imageUri, timestamp: Date.now() };
      setCapturedImages(prev => [...prev, newImage]);
      setShowPostCapture(true); // Show post capture screen with updated images
    }
  };

  const handlePostToDailies = () => {
    if (capturedImages.length === 0 || isVirtualDevice) return;
    
    console.log(`Posting ${capturedImages.length} images to dailies:`, capturedImages);
    console.log(`Audience: ${audienceMode}`);
    
    // Reset states and go back
    setCapturedImages([]);
    setShowPostCapture(false);
    setIsAddingMore(false); // Reset the adding more flag
    if (onBack) onBack();
  };

  const handlePostToFeed = () => {
    if (capturedImages.length === 0 || isVirtualDevice) return;
    
    console.log(`Posting ${capturedImages.length} images to feed with audience ${audienceMode}:`, capturedImages);
    
    // Reset states and go back
    setCapturedImages([]);
    setShowPostCapture(false);
    setIsAddingMore(false); // Reset the adding more flag
    if (onBack) onBack();
  };

  const handleRetake = () => {
    setCapturedImages([]);
    setShowPostCapture(false);
    setIsAddingMore(false); // Reset the adding more flag
  };

  // Handle image removal from PostCaptureScreen
  const handleRemoveImage = (imageToRemove) => {
    setCapturedImages(prev => prev.filter(img => img.timestamp !== imageToRemove.timestamp));
    
    // If no images left, go back to camera
    if (capturedImages.length <= 1) {
      setShowPostCapture(false);
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

  // Post-capture screen
  if (showPostCapture && capturedImages.length > 0) {
    return (
      <PostCaptureScreen
        capturedImages={capturedImages} // Pass array instead of single image
        postMode={postMode}
        setPostMode={setPostMode}
        audienceMode={audienceMode}
        setAudienceMode={setAudienceMode}
        onAddMore={handleAddMore}
        onAddNewImage={handleAddNewImage} // New prop for adding images
        onRemoveImage={handleRemoveImage} // New prop for removing images
        onPostToDailies={handlePostToDailies}
        onPostToFeed={handlePostToFeed}
        onRetake={handleRetake}
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
        showDurationDropdown={showDurationDropdown}
        scale={scale}
        savedScale={savedScale}
        setZoom={setZoom}
        onCapture={handleCapture}
        onSwitchCamera={cameraLogic.switchCamera}
        onToggleSettings={animations.toggleSettings}
        onToggleDurationDropdown={animations.toggleDurationDropdown}
        animations={animations}
        isCapturing={isCapturing}
      />
    </GestureHandlerRootView>
  );
}