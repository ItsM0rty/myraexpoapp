import { Platform } from 'react-native';
import * as Device from 'expo-device';

/**
 * Enhanced virtual device and emulator detection for mobile
 * @returns {Promise<Object>} Detection result with isVirtual flag, suspicion score, reasons, and device info
 */
export const detectVirtualDevice = async () => {
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

/**
 * Initialize camera with virtual device detection and permission checks
 * @param {Object} permission - Camera permission object from useCameraPermissions
 * @param {Function} requestPermission - Function to request camera permission
 * @returns {Promise<Object>} Initialization result with error and virtual device status
 */
export const initializeCameraWithDetection = async (permission, requestPermission) => {
  try {
    // Step 1: Virtual device detection
    const detection = await detectVirtualDevice();
    
    if (detection.isVirtual) {
      const errorMessage = `Virtual device detected: ${detection.reasons.join(', ')}`;
      console.warn('Virtual device detection:', detection);
      return {
        isVirtualDevice: true,
        error: errorMessage,
        detection
      };
    }

    // Step 2: Check camera permissions
    if (!permission) {
      return {
        isVirtualDevice: false,
        error: null,
        detection
      }; // Still loading
    }

    if (!permission.granted) {
      const response = await requestPermission();
      if (!response.granted) {
        return {
          isVirtualDevice: false,
          error: 'Camera permission is required to use this feature.',
          detection
        };
      }
    }

    // Step 3: Additional security checks
    if (!Device.isDevice) {
      return {
        isVirtualDevice: true,
        error: 'This feature only works on physical devices.',
        detection
      };
    }

    // Log successful initialization
    console.log('Camera initialized successfully on device:', detection.deviceInfo);
    
    return {
      isVirtualDevice: false,
      error: null,
      detection
    };

  } catch (error) {
    console.error('Camera initialization error:', error);
    return {
      isVirtualDevice: false,
      error: 'Failed to initialize camera. Please try again.',
      detection: null
    };
  }
};