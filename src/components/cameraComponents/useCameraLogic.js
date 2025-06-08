import { withTiming } from 'react-native-reanimated'; // ADD THIS IMPORT
import { ASPECT_RATIO } from './CameraConstants';

export const useCameraLogic = ({
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
  setIsSwitchingCamera,
  isSwitchingCamera,
}) => {
  // Convert scale to zoom value (0-1 range for expo-camera)
  const scaleToZoom = (scaleValue) => {
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

  // Trigger flash animation
  const triggerFlash = () => {
    flashOpacity.value = withTiming(0.3, { duration: 50 }, () => {
      flashOpacity.value = withTiming(0, { duration: 200 });
    });
  };

  // Enhanced photo capture with validation
  const capturePhoto = async () => {
    console.log('capturePhoto called');
    
    if (!cameraRef.current || isCapturing || isVirtualDevice) {
      console.log('Capture blocked:', { 
        hasCamera: !!cameraRef.current, 
        isCapturing, 
        isVirtualDevice 
      });
      return;
    }
    
    console.log('Starting capture process...');
    setIsCapturing(true);
    
    // Trigger soft flash animation
    try {
      triggerFlash();
    } catch (flashError) {
      console.log('Flash animation error (non-critical):', flashError);
    }
    
    try {
      console.log('Taking picture...');
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
        aspect: ASPECT_RATIO === 6/8 ? [6, 8] : ASPECT_RATIO === 4/5 ? [4, 5] : [5, 6],
        shutterSound: false,
      });

      console.log('Photo taken:', photo);

      if (!photo || !photo.uri) {
        throw new Error('Failed to capture photo - no URI returned');
      }

      // Simplified validation - just check if URI exists and looks valid
      if (!photo.uri.startsWith('file://') && !photo.uri.startsWith('content://')) {
        console.warn('Photo URI looks suspicious:', photo.uri);
      }

      console.log('Setting captured image:', photo.uri);
      setCapturedImage(photo.uri);
      
    } catch (error) {
      console.error('Photo capture error:', error);
      setCameraError(`Failed to capture photo: ${error.message}`);
    } finally {
      console.log('Capture process finished');
      setIsCapturing(false);
    }
  };

  const switchCamera = () => {
    if (!isVirtualDevice && !isSwitchingCamera) {
      setIsSwitchingCamera(true);
      setFacing(current => (current === 'back' ? 'front' : 'back'));
      // Reset zoom when switching cameras
      scale.value = 1;
      savedScale.value = 1;
      setZoom(0);
      setTimeout(() => {
        setIsSwitchingCamera(false);
      }, 200);
    }
  };

  return {
    scaleToZoom,
    zoomToDisplay,
    updateZoomFromScale,
    triggerFlash,
    capturePhoto,
    switchCamera,
  };
};