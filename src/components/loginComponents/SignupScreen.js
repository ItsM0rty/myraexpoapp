import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { account, databases } from '../../../lib/constants/appwrite';
import { ID, Query } from 'appwrite';
import { LinearGradient } from 'expo-linear-gradient';
import { countries } from './country_codes.js';
import { Animated } from 'react-native';

const SignupScreen = ({ onSignupSuccess, onNavigateToLogin }) => {
  const [currentScreen, setCurrentScreen] = useState('signup'); // 'signup', 'otp', 'userDetails'
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    username: '',
    name: '',
    otp: '',
    userId: '',
    secret: '',
    countryCode: '+1',
    countryFlag: '🇺🇸',
  });
  const [loading, setLoading] = useState(false);
  const [signupType, setSignupType] = useState('email'); // 'email' or 'phone'
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  // Optimize country filtering with useMemo
  const filteredCountries = useMemo(() => {
    if (!countrySearch) return countries;
    const search = countrySearch.toLowerCase();
    return countries.filter(
      (country) =>
        country.name.toLowerCase().includes(search) ||
        country.dial_code.includes(search)
    );
  }, [countrySearch]);

  // Test database connection
  const testDatabaseConnection = async () => {
    try {
      console.log('Testing database connection...');
      const databaseId = '684ed11000071b8df1d6';
      const collectionId = '684ed196003dd068d0a0';
      
      // First, try to get the database
      const database = await databases.get(databaseId);
      console.log('Database found:', database);
      
      // Then try to get the collection
      const collection = await databases.getCollection(databaseId, collectionId);
      console.log('Collection found:', collection);
      
      // Finally, try to list documents (should work even if empty)
      const documents = await databases.listDocuments(databaseId, collectionId);
      console.log('Documents in collection:', documents);
      
      return true;
    } catch (error) {
      console.log('Database connection test failed:', error);
      console.log('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response
      });
      return false;
    }
  };

  // Test connection on component mount
  useEffect(() => {
    testDatabaseConnection();
  }, []);

  // Create anonymous session for database access
  const createAnonymousSession = async () => {
    try {
      console.log('Creating anonymous session...');
      const session = await account.createAnonymousSession();
      console.log('Anonymous session created:', session);
      return true;
    } catch (error) {
      console.log('Error creating anonymous session:', error);
      return false;
    }
  };

  const checkUsernameAvailability = async (username) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      console.log('Checking username availability for:', username);
      
      // Call Cloud Function to check username availability
      const response = await fetch('https://fra.cloud.appwrite.io/v1/functions/YOUR_USERNAME_CHECK_FUNCTION_ID/executions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': '6847aae80036323aa42a',
        },
        body: JSON.stringify({
          username: username
        }),
      });

      const result = await response.json();
      
      if (result.response) {
        const data = JSON.parse(result.response);
        if (data.success && data.available) {
          setUsernameAvailable(true);
        } else {
          setUsernameAvailable(false);
        }
      } else {
        setUsernameAvailable(null);
      }
    } catch (error) {
      console.log('Error checking username:', error);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentScreen]);

  // Debounce username checking
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.username) {
        // Temporarily skip username check due to permission issues
        console.log('Skipping username check - setting as available');
        setUsernameAvailable(true);
        // checkUsernameAvailability(formData.username);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username]);

  const handleSignupStart = async () => {
    const identifier = signupType === 'email' ? formData.email : `${formData.countryCode}${formData.phone}`;

    if (!identifier || (signupType === 'phone' && !formData.phone)) {
      Alert.alert('Error', `Please enter your ${signupType}`);
      return;
    }

    setLoading(true);
    try {
      if (signupType === 'email') {
        const token = await account.createEmailToken(ID.unique(), identifier);
        setFormData((prev) => ({
          ...prev,
          secret: token.secret,
          userId: token.userId,
        }));
      } else {
        const token = await account.createPhoneToken(ID.unique(), identifier);
        setFormData((prev) => ({
          ...prev,
          secret: token.secret,
          userId: token.userId,
        }));
      }

      setCurrentScreen('otp');
    } catch (error) {
      if (
        error.message.includes('user_already_exists') ||
        error.message.includes('already exists') ||
        error.code === 409
      ) {
        Alert.alert('Error', `An account with this ${signupType} already exists`);
      } else {
        Alert.alert('Error', error.message || 'Failed to send verification code');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerification = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      // Create session using the OTP
      const session = await account.createSession(formData.userId, formData.otp);
      console.log('Session created:', session);
      setCurrentScreen('userDetails');
    } catch (error) {
      console.log('OTP Verification Error:', error);
      Alert.alert('Invalid Code', 'Please check your code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderUserDetailsScreen = () => (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.welcomeTitle}>Almost Done</Text>
          <Text style={styles.welcomeSubtitle}>Create your username and add your name</Text>
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
            <Text style={styles.inputLabel}>Full Name *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#666"
                value={formData.name}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!formData.name || !formData.username || usernameAvailable !== true || loading) && styles.buttonDisabled
            ]}
            onPress={handleCompleteSignup}
            disabled={!formData.name || !formData.username || usernameAvailable !== true || loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.primaryButtonText}>Complete Setup</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setCurrentScreen('otp')}
          >
            <Text style={styles.secondaryButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const validateUsername = (username) => {
    if (!username) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (username.length > 20) return 'Username must be less than 20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores';
    if (usernameAvailable === false) return 'Username is already taken';
    return null;
  };

  const handleCompleteSignup = async () => {
    if (!formData.name || !formData.username) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const usernameError = validateUsername(formData.username);
    if (usernameError) {
      Alert.alert('Invalid Username', usernameError);
      return;
    }

    if (usernameAvailable !== true) {
      Alert.alert('Error', 'Please wait for username availability check to complete');
      return;
    }

    setLoading(true);
    try {
      // Update account name first
      await account.updateName(formData.name);
      console.log('Account name updated successfully');

      // Call Cloud Function to create user document
      const response = await fetch('https://fra.cloud.appwrite.io/v1/functions/YOUR_FUNCTION_ID/executions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': '6847aae80036323aa42a',
        },
        body: JSON.stringify({
          userId: formData.userId,
          username: formData.username,
          name: formData.name,
          email: signupType === 'email' ? formData.email : null,
          phone: signupType === 'phone' ? `${formData.countryCode}${formData.phone}` : null,
        }),
      });

      const result = await response.json();
      
      if (!result.response) {
        throw new Error('No response from server');
      }

      const data = JSON.parse(result.response);
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create user profile');
      }

      console.log('User document created successfully:', data.user);
      
      // Call success callback
      if (onSignupSuccess) {
        onSignupSuccess();
      }
    } catch (error) {
      console.log('Signup completion error:', error);
      Alert.alert('Error', error.message || 'Failed to complete setup');
    } finally {
      setLoading(false);
    }
  };

  const selectCountry = (country) => {
    setFormData((prev) => ({ 
      ...prev, 
      countryCode: country.dial_code,
      countryFlag: country.flag 
    }));
    setShowCountryPicker(false);
    setCountrySearch('');
  };

  const renderCountryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.countryItem}
      onPress={() => selectCountry(item)}
    >
      <Text style={styles.countryFlag}>{item.flag}</Text>
      <Text style={styles.countryName}>{item.name}</Text>
      <Text style={styles.countryDialCode}>{item.dial_code}</Text>
    </TouchableOpacity>
  );

  const renderCountryPicker = () => (
    <Modal
      visible={showCountryPicker}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCountryPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCountryPicker(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Search country or code..."
            placeholderTextColor="#666"
            value={countrySearch}
            onChangeText={setCountrySearch}
          />

          <FlatList
            data={filteredCountries}
            renderItem={renderCountryItem}
            keyExtractor={(item) => item.code}
            style={styles.countryList}
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            windowSize={10}
            getItemLayout={(data, index) => ({
              length: 60,
              offset: 60 * index,
              index,
            })}
          />
        </View>
      </View>
    </Modal>
  );

  const renderSignupScreen = () => (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.welcomeTitle}>Create Account</Text>
          <Text style={styles.welcomeSubtitle}>Sign up to continue</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.signupTypeContainer}>
            <TouchableOpacity
              style={[styles.typeButton, signupType === 'email' && styles.typeButtonActive]}
              onPress={() => setSignupType('email')}
            >
              <Text style={[styles.typeButtonText, signupType === 'email' && styles.typeButtonTextActive]}>
                Email
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, signupType === 'phone' && styles.typeButtonActive]}
              onPress={() => setSignupType('phone')}
            >
              <Text style={[styles.typeButtonText, signupType === 'phone' && styles.typeButtonTextActive]}>
                Phone
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {signupType === 'email' ? 'Email Address' : 'Phone Number'}
            </Text>
            <View style={styles.inputContainer}>
              {signupType === 'phone' ? (
                <View style={styles.phoneInputContainer}>
                  <TouchableOpacity style={styles.countrySelector} onPress={() => setShowCountryPicker(true)}>
                    <Text style={styles.flagText}>{formData.countryFlag}</Text>
                    <Text style={styles.countryCode}>{formData.countryCode}</Text>
                    <Text style={styles.dropdownArrow}>▼</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.input, styles.phoneInput]}
                    placeholder="Enter phone number"
                    placeholderTextColor="#666"
                    value={formData.phone}
                    onChangeText={(text) => setFormData((prev) => ({ ...prev, phone: text }))}
                    keyboardType="phone-pad"
                  />
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email address"
                  placeholderTextColor="#666"
                  value={formData.email}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, email: text }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSignupStart}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.primaryButtonText}>Continue</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onNavigateToLogin}
          >
            <Text style={styles.secondaryButtonText}>Have an account? Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderOTPScreen = () => (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.welcomeTitle}>Enter Code</Text>
          <Text style={styles.welcomeSubtitle}>
            Check your {signupType} for the 6-digit code
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Verification Code</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.otpInput]}
                placeholder="000000"
                placeholderTextColor="#666"
                value={formData.otp}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, otp: text }))}
                keyboardType="number-pad"
                maxLength={6}
                textAlign="center"
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleOTPVerification}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.primaryButtonText}>Verify</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setCurrentScreen('signup')}
          >
            <Text style={styles.secondaryButtonText}>← Back</Text>
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
        {currentScreen === 'signup' && renderSignupScreen()}
        {currentScreen === 'otp' && renderOTPScreen()}
        {currentScreen === 'userDetails' && renderUserDetailsScreen()}
        {renderCountryPicker()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#000000',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  welcomeTitle: {
    fontSize: 28,
    fontFamily: 'SF-Pro-Display-Bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontFamily: 'SF-Pro-Display-Regular',
    color: '#888888',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  inputGroup: {
    marginBottom: 28,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'SF-Pro-Display-Medium',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 20,
    fontSize: 17,
    color: '#FFFFFF',
    fontFamily: 'SF-Pro-Display-Regular',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  usernameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingLeft: 20,
    height: 56,
  },
  atSymbol: {
    color: '#888888',
    fontSize: 17,
    fontFamily: 'SF-Pro-Display-Regular',
    marginRight: 2,
  },
  usernameInput: {
    flex: 1,
    height: '100%',
    fontSize: 17,
    color: '#FFFFFF',
    fontFamily: 'SF-Pro-Display-Regular',
    paddingRight: 20,
  },
  otpInput: {
    fontFamily: 'SF-Pro-Display-Bold',
    fontSize: 28,
    letterSpacing: 12,
    textAlign: 'center',
    height: 72,
  },
  signupTypeContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  typeButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  typeButtonText: {
    color: '#888888',
    fontFamily: 'SF-Pro-Display-Medium',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  typeButtonTextActive: {
    color: '#000000',
    fontFamily: 'SF-Pro-Display-Semibold',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    minWidth: 100,
  },
  flagText: {
    fontSize: 20,
    marginRight: 8,
  },
  countryCode: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'SF-Pro-Display-Medium',
    marginRight: 6,
  },
  dropdownArrow: {
    color: '#888888',
    fontSize: 10,
  },
  phoneInput: {
    flex: 1,
    marginLeft: 0,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 14,
    marginBottom: 24,
    marginTop: 8,
    backgroundColor: '#FFFFFF', // Fixed background for animation
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 17,
    fontFamily: 'SF-Pro-Display-Semibold',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    width: '100%',
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
  },
  secondaryButtonText: {
    color: '#888888',
    fontSize: 16,
    fontFamily: 'SF-Pro-Display-Medium',
    letterSpacing: 0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#111111',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    paddingVertical: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'SF-Pro-Display-Bold',
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'SF-Pro-Display-Medium',
  },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  countryList: {
    maxHeight: 400,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  countryFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  countryName: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'SF-Pro-Display-Regular',
  },
  countryDialCode: {
    color: '#888888',
    fontSize: 16,
    fontFamily: 'SF-Pro-Display-Medium',
  },
  inputSuccess: {
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  inputError: {
    borderColor: '#F44336',
    borderWidth: 1,
  },
  inputIndicator: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  successIcon: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorIcon: {
    color: '#F44336',
    fontSize: 18,
    fontWeight: 'bold',
  },
  usernameStatus: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  successText: {
    color: '#4CAF50',
  },
  errorText: {
    color: '#F44336',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default SignupScreen;