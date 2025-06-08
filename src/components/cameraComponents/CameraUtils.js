import { CAMERA_CONSTANTS } from './CameraConstants';

export class CameraUtils {
  /**
   * Convert scale value to zoom value for expo-camera
   * @param {number} scaleValue - Scale from gesture (1-5)
   * @returns {number} - Zoom value (0-1)
   */
  static scaleToZoom(scaleValue) {
    const clampedScale = Math.max(
      CAMERA_CONSTANTS.ZOOM.SCALE_MIN, 
      Math.min(CAMERA_CONSTANTS.ZOOM.SCALE_MAX, scaleValue)
    );
    return (clampedScale - 1) / 4; // Map 1-5 to 0-1
  }

  /**
   * Convert zoom value to display string
   * @param {number} zoomValue - Zoom value (0-1)
   * @returns {string} - Display string (e.g., "2.5x")
   */
  static zoomToDisplay(zoomValue) {
    return (zoomValue * 4 + 1).toFixed(1);
  }

  /**
   * Validate photo capture result
   * @param {Object} photo - Photo object from camera
   * @returns {boolean} - Whether photo is valid
   */
  static async validatePhoto(photo) {
    if (!photo || !photo.uri) {
      return false;
    }

    try {
      // Additional validation: check image file size
      const imageInfo = await fetch(photo.uri, { method: 'HEAD' });
      const contentLength = imageInfo.headers.get('content-length');
      
      if (contentLength && parseInt(contentLength) < 1000) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Photo validation error:', error);
      return false;
    }
  }

  /**
   * Get aspect ratio configuration
   * @param {string} ratioType - Type of aspect ratio
   * @returns {Array} - Aspect ratio array for camera
   */
  static getAspectRatio(ratioType = 'PORTRAIT') {
    const ratio = CAMERA_CONSTANTS.ASPECT_RATIOS[ratioType] || CAMERA_CONSTANTS.ASPECT_RATIOS.PORTRAIT;
    
    switch (ratioType) {
      case 'PORTRAIT':
        return [6, 8];
      case 'SQUARE':
        return [1, 1];
      case 'LANDSCAPE':
        return [5, 6];
      default:
        return [6, 8];
    }
  }

  /**
   * Toggle between camera facing modes
   * @param {string} currentFacing - Current camera facing
   * @returns {string} - New camera facing
   */
  static toggleCameraFacing(currentFacing) {
    return currentFacing === CAMERA_CONSTANTS.CAMERA_FACING.BACK 
      ? CAMERA_CONSTANTS.CAMERA_FACING.FRONT 
      : CAMERA_CONSTANTS.CAMERA_FACING.BACK;
  }

  /**
   * Toggle flash mode
   * @param {string} currentFlash - Current flash mode
   * @returns {string} - New flash mode
   */
  static toggleFlashMode(currentFlash) {
    return currentFlash === CAMERA_CONSTANTS.FLASH_MODES.OFF 
      ? CAMERA_CONSTANTS.FLASH_MODES.ON 
      : CAMERA_CONSTANTS.FLASH_MODES.OFF;
  }

  /**
   * Get photo capture options
   * @param {string} aspectRatioType - Type of aspect ratio
   * @returns {Object} - Photo capture options
   */
  static getPhotoCaptureOptions(aspectRatioType = 'PORTRAIT') {
    return {
      quality: CAMERA_CONSTANTS.PHOTO_QUALITY,
      base64: false,
      skipProcessing: false,
      aspect: this.getAspectRatio(aspectRatioType),
      shutterSound: false,
    };
  }

  /**
   * Clamp zoom scale within bounds
   * @param {number} scale - Scale value to clamp
   * @returns {number} - Clamped scale value
   */
  static clampZoomScale(scale) {
    return Math.max(
      CAMERA_CONSTANTS.ZOOM.SCALE_MIN,
      Math.min(CAMERA_CONSTANTS.ZOOM.SCALE_MAX, scale)
    );
  }

  /**
   * Check if device supports camera features
   * @param {Object} permission - Camera permission object
   * @returns {Object} - Feature support information
   */
  static checkCameraFeatures(permission) {
    return {
      hasPermission: permission?.granted === true,
      canRequestPermission: permission?.canAskAgain !== false,
      isUndetermined: permission?.status === 'undetermined',
    };
  }

  /**
   * Generate error messages for camera issues
   * @param {string} errorType - Type of error
   * @param {string} customMessage - Custom error message
   * @returns {Object} - Error information
   */
  static generateErrorInfo(errorType, customMessage = null) {
    const errorMap = {
      PERMISSION_DENIED: {
        title: 'Camera Permission Required',
        message: 'Please allow camera access to use this feature.',
      },
      VIRTUAL_DEVICE: {
        title: 'Virtual Device Detected',
        message: 'This feature only works on physical devices with real cameras.',
      },
      CAPTURE_FAILED: {
        title: 'Capture Failed',
        message: 'Failed to capture photo. Please try again.',
      },
      CAMERA_UNAVAILABLE: {
        title: 'Camera Unavailable',
        message: 'Camera is not available on this device.',
      },
    };

    const errorInfo = errorMap[errorType] || {
      title: 'Camera Error',
      message: 'An unexpected error occurred.',
    };

    if (customMessage) {
      errorInfo.message = customMessage;
    }

    return errorInfo;
  }
}