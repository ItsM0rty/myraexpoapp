import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { account, databases, functions, config } from '../../../lib/constants/appwrite';
import { ID, Query } from 'appwrite';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import styles from './signup_styles';

// Utility for retrying API calls with exponential backoff
const withRetry = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.code === 429 && i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
        continue;
      }
      throw error;
    }
  }
};

const SignupScreen = ({ onSignupSuccess, onNavigateToLogin }) => {
  const [currentScreen, setCurrentScreen] = useState('credentials');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    userId: null,
    verificationCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const resendTimerRef = useRef(null);
  const usernameTimeoutRef = useRef(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentScreen]);

  useEffect(() => {
    if (resendCooldown > 0) {
      resendTimerRef.current = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
    }
    return () => {
      if (resendTimerRef.current) clearTimeout(resendTimerRef.current);
    };
  }, [resendCooldown]);

  useEffect(() => {
    if (usernameTimeoutRef.current) clearTimeout(usernameTimeoutRef.current);
    usernameTimeoutRef.current = setTimeout(() => {
      if (formData.username) checkUsernameAvailability(formData.username);
    }, 500);
    return () => {
      if (usernameTimeoutRef.current) clearTimeout(usernameTimeoutRef.current);
    };
  }, [formData.username]);

  const checkUsernameAvailability = async (username) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    
    setCheckingUsername(true);
    try {
      const cleanUsername = username.replace(/^@/, '').toLowerCase();
      const cacheKey = `username_${cleanUsername}`;
      const cachedResult = await SecureStore.getItemAsync(cacheKey);
      if (cachedResult !== null) {
        setUsernameAvailable(cachedResult === 'true');
        setCheckingUsername(false);
        return;
      }

      const res = await withRetry(() =>
        databases.listDocuments(
          config.databaseId,
          config.userCollectionId,
          [Query.equal('username', cleanUsername)]
        )
      );
      const isAvailable = res.total === 0;
      setUsernameAvailable(isAvailable);
      await withRetry(() => SecureStore.setItemAsync(cacheKey, isAvailable.toString()));
    } catch (error) {
      console.error('Error checking username:', {
        code: error.code,
        message: error.message,
        type: error.type,
      });
      setUsernameAvailable(null);
      if (!error.message.includes('permission') && !error.message.includes('unauthorized')) {
        Alert.alert('Error', 'Unable to check username availability. Please try again later.');
      }
    } finally {
      setCheckingUsername(false);
    }
  };

  const validateUsername = (username) => {
    if (!username) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (username.length > 20) return 'Username must be less than 20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores';
    if (usernameAvailable === false) return 'Username is already taken';
    return null;
  };

  const validateCredentials = () => {
    if (!formData.username) {
      Alert.alert('Error', 'Please enter a username');
      return false;
    }
    const usernameError = validateUsername(formData.username);
    if (usernameError) {
      Alert.alert('Invalid Username', usernameError);
      return false;
    }
    if (!formData.password) {
      Alert.alert('Error', 'Please enter a password');
      return false;
    }
    if (formData.password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    return true;
  };

  const validateEmail = () => {
    if (!formData.email) {
      Alert.alert('Error', 'Please enter your email address');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleNextToEmail = () => {
    if (validateCredentials()) {
      setCurrentScreen('email');
    }
  };

  const handleSendOTP = async () => {
    if (!validateEmail()) return;
    setLoading(true);
    try {
      const cleanUsername = formData.username.replace(/^@/, '').toLowerCase();
      const newAccount = await withRetry(() =>
        account.create(
          ID.unique(),
          formData.email,
          formData.password,
          cleanUsername
        )
      );
      setFormData((prev) => ({ ...prev, userId: newAccount.$id }));
      const token = await withRetry(() =>
        account.createEmailToken(newAccount.$id, formData.email)
      );
      console.log('OTP sent successfully:', token);
      setCurrentScreen('verification');
      setResendCooldown(60);
    } catch (error) {
      console.error('OTP sending error:', error);
      if (error.code === 409 || error.message.includes('user_already_exists')) {
        Alert.alert(
          'Account Exists',
          'An account with this email already exists. Please try logging in instead.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Go to Login', onPress: onNavigateToLogin },
          ]
        );
      } else if (error.code === 429) {
        Alert.alert('Rate Limit Exceeded', 'Too many requests. Please wait a moment and try again.');
      } else {
        Alert.alert('Error', error.message || 'Failed to send verification code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!formData.verificationCode || formData.verificationCode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit verification code');
      return;
    }
    
    setLoading(true);
    try {
      const session = await withRetry(() =>
        account.createSession(formData.userId, formData.verificationCode)
      );
      await SecureStore.setItemAsync('appwrite-session', session.$id);
      await createUsernameDocument(formData.userId);
      Alert.alert(
        'Success!',
        'Your account has been created and verified successfully!',
        [{ text: 'Continue', onPress: onSignupSuccess }]
      );
    } catch (error) {
      console.error('Verification error:', {
        code: error.code,
        message: error.message,
        type: error.type,
      });
      if (error.message.includes('Username was just taken')) {
        Alert.alert(
          'Error',
          'The username was just taken. Please choose a different username.',
          [
            { text: 'OK', onPress: () => setCurrentScreen('credentials') },
          ]
        );
      } else if (error.code === 401 || error.message.includes('invalid') || error.message.includes('token')) {
        Alert.alert('Invalid Code', 'The verification code is incorrect or has expired. Please try again.');
      } else if (error.code === 429) {
        Alert.alert('Rate Limit Exceeded', 'Too many requests. Please wait a moment and try again.');
      } else {
        Alert.alert('Verification Failed', error.message || 'Failed to verify code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const createUsernameDocument = async (userId) => {
    try {
      const response = await withRetry(() =>
        functions.createExecution(
          config.functionId,
          JSON.stringify({
            userId,
            username: formData.username,
            email: formData.email,
          })
        )
      );
      const result = JSON.parse(response.responseBody);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create username document');
      }
      console.log('Username document created successfully:', result.documentId);
    } catch (error) {
      console.error('Function execution error:', error);
      if (error.message.includes('unique') || error.message.includes('duplicate')) {
        throw new Error('Username was just taken. Please choose another.');
      }
      console.warn('Failed to create username document, but account is created:', error.message);
      throw error;
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    
    setLoading(true);
    try {
      const token = await withRetry(() =>
        account.createEmailToken(formData.userId, formData.email)
      );
      console.log('OTP resent successfully:', token);
      setFormData((prev) => ({ ...prev, userId: token.userId }));
      setResendCooldown(60);
      Alert.alert('Success', 'Verification code sent successfully!');
    } catch (error) {
      console.error('Resend OTP error:', error);
      if (error.code === 429) {
        Alert.alert('Rate Limit Exceeded', 'Too many requests. Please wait a moment and try again.');
      } else {
        Alert.alert('Error', error.message || 'Failed to send verification code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCredentials = () => setCurrentScreen('credentials');
  const handleBackToEmail = () => setCurrentScreen('email');

  // Render functions remain unchanged
  const renderCredentialsScreen = () => (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.welcomeTitle}>Create Account</Text>
          <Text style={styles.welcomeSubtitle}>Choose your username and password</Text>
        </View>
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Username *</Text>
            <View style={styles.inputContainer}>
              <View style={[
                styles.usernameInputContainer,
                usernameAvailable === true && styles.inputSuccess,
                usernameAvailable === false && styles.inputError
              ]}>
                <Text style={styles.atSymbol}>@</Text>
                <TextInput
                  style={styles.usernameInput}
                  placeholder="username"
                  placeholderTextColor="#666"
                  value={formData.username}
                  onChangeText={(text) => setFormData((prev) => ({ 
                    ...prev, 
                    username: text.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '') 
                  }))}
                  autoCapitalize="none"
                />
                {checkingUsername && (
                  <View style={styles.inputIndicator}>
                    <ActivityIndicator size="small" color="#666" />
                  </View>
                )}
                {!checkingUsername && usernameAvailable === true && (
                  <View style={styles.inputIndicator}>
                    <Text style={styles.successIcon}>✓</Text>
                  </View>
                )}
                {!checkingUsername && usernameAvailable === false && (
                  <View style={styles.inputIndicator}>
                    <Text style={styles.errorIcon}>✗</Text>
                  </View>
                )}
              </View>
            </View>
            {formData.username && (
              <Text style={[
                styles.usernameStatus,
                usernameAvailable === true && styles.successText,
                usernameAvailable === false && styles.errorText
              ]}>
                {checkingUsername 
                  ? 'Checking availability...' 
                  : usernameAvailable === true 
                    ? 'Username is available!' 
                    : usernameAvailable === false 
                      ? 'Username is already taken'
                      : 'Username must be 3-20 characters, letters, numbers, and underscores only'
                }
              </Text>
            )}
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password *</Text>
            <View style={styles.inputContainer}>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#666"
                  value={formData.password}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, password: text }))}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm Password *</Text>
            <View style={styles.inputContainer}>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm your password"
                  placeholderTextColor="#666"
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, confirmPassword: text }))}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text style={styles.eyeIcon}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!formData.username || !formData.password || !formData.confirmPassword || !usernameAvailable) && styles.buttonDisabled
            ]}
            onPress={handleNextToEmail}
            disabled={!formData.username || !formData.password || !formData.confirmPassword || !usernameAvailable}
          >
            <Text style={styles.primaryButtonText}>Next</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={onNavigateToLogin}>
            <Text style={styles.secondaryButtonText}>Have an account? Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderEmailScreen = () => (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.welcomeTitle}>Enter Your Email</Text>
          <Text style={styles.welcomeSubtitle}>We'll send you a 6-digit verification code</Text>
        </View>
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your email address"
                placeholderTextColor="#666"
                value={formData.email}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, email: text.toLowerCase().trim() }))}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus={true}
              />
            </View>
          </View>
          <TouchableOpacity
            style={[styles.primaryButton, (!formData.email || loading) && styles.buttonDisabled]}
            onPress={handleSendOTP}
            disabled={!formData.email || loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.primaryButtonText}>Send Verification Code</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleBackToCredentials}>
            <Text style={styles.secondaryButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderVerificationScreen = () => (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.welcomeTitle}>Enter Verification Code</Text>
          <Text style={styles.welcomeSubtitle}>We've sent a 6-digit code to</Text>
          <Text style={styles.emailText}>{formData.email}</Text>
        </View>
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Verification Code *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.otpInput]}
                placeholder="000000"
                placeholderTextColor="#666"
                value={formData.verificationCode}
                onChangeText={(text) => setFormData((prev) => ({ 
                  ...prev, 
                  verificationCode: text.replace(/[^0-9]/g, '').slice(0, 6)
                }))}
                keyboardType="numeric"
                maxLength={6}
                autoFocus={true}
              />
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!formData.verificationCode || formData.verificationCode.length !== 6 || loading) && styles.buttonDisabled
            ]}
            onPress={handleVerifyOTP}
            disabled={!formData.verificationCode || formData.verificationCode.length !== 6 || loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.primaryButtonText}>Verify & Create Account</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              (resendCooldown > 0 || loading) && styles.buttonDisabled
            ]}
            onPress={handleResendOTP}
            disabled={resendCooldown > 0 || loading}
          >
            <Text style={styles.secondaryButtonText}>
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tertiaryButton} onPress={handleBackToEmail}>
            <Text style={styles.tertiaryButtonText}>← Change Email</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          {currentScreen === 'credentials' && renderCredentialsScreen()}
          {currentScreen === 'email' && renderEmailScreen()}
          {currentScreen === 'verification' && renderVerificationScreen()}
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignupScreen;