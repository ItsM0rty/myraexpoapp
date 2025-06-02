import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { Home, Search, MessageCircle, User, ScanFace } from 'lucide-react-native';

import NavIcon from './src/components/NavIcon';
import HomeFeed from './src/screens/HomeFeed';
import SearchPage from './src/screens/SearchPage';
import CameraScreen from './src/screens/CameraScreen';
import ChatPage from './src/screens/ChatPage';
import ProfilePage from './src/screens/ProfilePage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showNavbar, setShowNavbar] = useState(true);

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeFeed />;
      case 'search': return <SearchPage />;
      case 'create': return <CameraScreen />;
      case 'chat': return <ChatPage onNavbarToggle={setShowNavbar} />;
      case 'profile': return <ProfilePage />;
      default: return null;
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="black" translucent />
        <View style={styles.content}>
          {renderContent()}
        </View>
        
        {showNavbar && (
          <View style={styles.navbar}>
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
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0,
  },
  content: {
    flex: 1,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 64,
    borderTopWidth: 1,
    borderTopColor: '#2d2d2d',
    backgroundColor: 'black',
  },
});