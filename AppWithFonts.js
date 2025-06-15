import React, { useEffect } from 'react';
import { Text, TextInput } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

import App from './App';

SplashScreen.preventAutoHideAsync();

export default function AppWithFonts() {
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

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  // Set default font styles globally
  Text.defaultProps = Text.defaultProps || {};
  Text.defaultProps.style = { fontFamily: 'SF-Pro-Display-Regular' };

  TextInput.defaultProps = TextInput.defaultProps || {};
  TextInput.defaultProps.style = { fontFamily: 'SF-Pro-Display-Regular' };

  return <App />;
}
