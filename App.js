import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, Platform, Text, TextInput } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Home, Search, MessageCircle, User, ScanFace } from 'lucide-react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as SecureStore from 'expo-secure-store'; // Added for session storage

import NavIcon from './src/components/NavIcon';
import HomeFeed from './src/screens/HomeFeed';
import SearchPage from './src/screens/SearchPage';
import CameraScreen from './src/screens/CameraScreen';
import ChatPage from './src/screens/ChatPage';
import ProfilePage from './src/screens/ProfilePage';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/components/loginComponents/SignupScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { account, client } from './lib/constants/appwrite'; // Updated to include client

// Keep splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

// Set default font family for Text and TextInput components
const defaultTextProps = Text.defaultProps || {};
defaultTextProps.style = { fontFamily: 'SF-Pro-Display-Regular' };
Text.defaultProps = defaultTextProps;

const defaultTextInputProps = TextInput.defaultProps || {};
defaultTextInputProps.style = { fontFamily: 'SF-Pro-Display-Regular' };
TextInput.defaultProps = defaultTextInputProps;

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showNavbar, setShowNavbar] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authScreen, setAuthScreen] = useState('login'); // 'login' or 'signup'

  // Load SF Pro Display fonts
  const [fontsLoaded] = useFonts({
    'SF-Pro-Display-Black': require('./assets/fonts/sf/SF-Pro-Display-Black.otf'),
    'SF-Pro-Display-Bold': require('./assets/fonts/sf/SF-Pro-Display-Bold.otf'),
    'SF-Pro-Display-Heavy': require('./assets/fonts/sf/SF-Pro-Display-Heavy.otf'),
    'SF-Pro-Display-Light': require('./assets/fonts/sf/SF-Pro-Display-Light.otf'),
    'SF-Pro-Display-Medium': require('./assets/fonts/sf/SF-Pro-Display-Medium.otf'),
    'SF-Pro-Display-MediumItalic': require('./assets/fonts/sf/SF-Pro-Display-MediumItalic.otf'),
    'SF-Pro-Display-Regular': require('./assets/fonts/sf/SF-Pro-Display-Regular.otf'),
    'SF-Pro-Display-Semibold': require('./assets/fonts/sf/SF-Pro-Display-Semibold.otf'),
    'SF-Pro-Display-Thin': require('./assets/fonts/sf/SF-Pro-Display-Thin.otf'),
    'SF-Pro-Display-Ultralight': require('./assets/fonts/sf/SF-Pro-Display-Ultralight.otf'),
  });

  // Restore session and check authentication status



  useEffect(() => {
  const restoreSessionAndCheckAuth = async () => {
    try {
      if (!client) {
        throw new Error('Appwrite client is not initialized');
      }
      // Restore session from secure store
      const sessionId = await SecureStore.getItemAsync('appwrite-session');
      if (!sessionId) {
        console.log('No session found, user is unauthenticated');
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      client.setSession(sessionId);
      // Check authentication status
      const user = await account.get();
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Authentication check error:', error.message);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };
  restoreSessionAndCheckAuth();
}, []);




  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setAuthScreen('login'); // Reset to login screen for next time
  };

  const handleSignupSuccess = () => {
    setIsAuthenticated(true);
    setAuthScreen('login'); // Reset to login screen for next time
  };

  const handleNavigateToSignup = () => {
    setAuthScreen('signup');
  };

  const handleNavigateToLogin = () => {
    setAuthScreen('login');
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      await SecureStore.deleteItemAsync('appwrite-session'); // Clear stored session
      setIsAuthenticated(false);
      setActiveTab('home'); // Reset to home tab
      setAuthScreen('login'); // Reset to login screen
    } catch (error) {
      console.log('Logout error:', error.message);
    }
  };

  if (!fontsLoaded || isLoading) {
    return null; // Keep splash screen visible while fonts load or checking auth
  }

  // Show authentication screens if not authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          {authScreen === 'login' ? (
            <LoginScreen 
              onLoginSuccess={handleLoginSuccess}
              onNavigateToSignup={handleNavigateToSignup}
            />
          ) : (
            <SignupScreen 
              onSignupSuccess={handleSignupSuccess}
              onNavigateToLogin={handleNavigateToLogin}
            />
          )}
        </GestureHandlerRootView>
      </SafeAreaProvider>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeFeed />;
      case 'search': return <SearchPage />;
      case 'create': return <CameraScreen onNavbarToggle={setShowNavbar}/>;
      case 'chat': return <ChatPage onNavbarToggle={setShowNavbar} />;
      case 'profile': return <ProfilePage onLogout={handleLogout} />; // Pass logout function
      default: return null;
    }
  };

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.container} edges={['top']}>
          <StatusBar barStyle="light-content" backgroundColor="black" translucent />
          <View style={styles.content}>
            {renderContent()}
          </View>
          
          {showNavbar && (
            <SafeAreaView style={styles.navbar} edges={['bottom']}>
              <View style={styles.navbarContent}>
                <NavIcon 
                  icon={<Home size={24} color={activeTab === 'home' ? 'white' : '#666'} />} 
                  onPress={() => setActiveTab('home')} 
                  active={activeTab === 'home'} 
                />
                <NavIcon 
                  icon={<Search size={24} color={activeTab === 'search' ? 'white' : '#666'} />} 
                  onPress={() => setActiveTab('search')} 
                  active={activeTab === 'search'} 
                />
                <NavIcon 
                  icon={<ScanFace size={24} color={activeTab === 'create' ? 'white' : '#666'} />} 
                  onPress={() => setActiveTab('create')} 
                  active={activeTab === 'create'} 
                />
                <NavIcon 
                  icon={<MessageCircle size={24} color={activeTab === 'chat' ? 'white' : '#666'} />} 
                  onPress={() => setActiveTab('chat')} 
                  active={activeTab === 'chat'} 
                />
                <NavIcon 
                  icon={<User size={24} color={activeTab === 'profile' ? 'white' : '#666'} />} 
                  onPress={() => setActiveTab('profile')} 
                  active={activeTab === 'profile'} 
                />
              </View>
            </SafeAreaView>
          )}
        </SafeAreaView>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  content: {
    flex: 1,
  },
  navbar: {
    backgroundColor: 'black',
    borderTopWidth: 1,
    borderTopColor: '#2d2d2d',
  },
  navbarContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 64,
  },
});