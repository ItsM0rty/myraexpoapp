import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { styles } from './CameraStyles';

export const ErrorScreen = ({ 
  isVirtualDevice, 
  cameraError, 
  onRetry, 
  onBack 
}) => {
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
            onPress={onRetry}
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
};