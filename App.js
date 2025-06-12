import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, Platform, Text, TextInput } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Home, Search, MessageCircle, User, ScanFace } from 'lucide-react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import NavIcon from './src/components/NavIcon';
import HomeFeed from './src/screens/HomeFeed';
import SearchPage from './src/screens/SearchPage';
import CameraScreen from './src/screens/CameraScreen';
import ChatPage from './src/screens/ChatPage';
import ProfilePage from './src/screens/ProfilePage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
// myraExpoApp\assets\fonts\sf\SF-Pro-Display-Black.otf
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

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Keep splash screen visible while fonts load
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeFeed />;
      case 'search': return <SearchPage />;
      case 'create': return <CameraScreen onNavbarToggle={setShowNavbar}/>;
      case 'chat': return <ChatPage onNavbarToggle={setShowNavbar} />;
      case 'profile': return <ProfilePage />;
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