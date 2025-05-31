import React, { useRef, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import PostCard from '../components/PostCard';

const { width: screenWidth } = Dimensions.get('window');

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView);

export default function HomeFeed() {
  const [tab, setTab] = useState('myfeed');
  const [pagerScrollEnabled, setPagerScrollEnabled] = useState(true);
  const pagerRef = useRef(null);
  
  // Animation values for pill
  const tabIndicatorX = useRef(new Animated.Value(0)).current;
  
  // Measurements
  const tabSelectorWidth = 180;
  const pillWidth = 84;
  const containerPadding = 4;
  const leftPillPosition = containerPadding;
  const rightPillPosition = tabSelectorWidth - pillWidth - containerPadding;

  const onPageScroll = (event) => {
    const { offset, position } = event.nativeEvent;
    
    // Only animate pill during continuous scroll between pages 0 and 1
    if (position === 0 && offset >= 0 && offset <= 1) {
      const progress = offset;
      const pillPosition = leftPillPosition + (rightPillPosition - leftPillPosition) * progress;
      tabIndicatorX.setValue(pillPosition);
    }
  };

  const onPageSelected = (e) => {
    const pageIndex = e.nativeEvent.position;
    const newTab = pageIndex === 0 ? 'myfeed' : 'dailies';
    setTab(newTab);
    
    // Smoothly animate pill to final position
    const finalPosition = pageIndex === 0 ? leftPillPosition : rightPillPosition;
    Animated.timing(tabIndicatorX, {
      toValue: finalPosition,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const switchTab = (newTab) => {
    if (newTab === tab) return;
    
    const pageIndex = newTab === 'myfeed' ? 0 : 1;
    const targetPosition = pageIndex === 0 ? leftPillPosition : rightPillPosition;
    
    // Animate pill smoothly to target position
    Animated.timing(tabIndicatorX, {
      toValue: targetPosition,
      duration: 250,
      useNativeDriver: false,
    }).start();
    
    // Change page with slight delay to sync with pill animation
    setTimeout(() => {
      pagerRef.current?.setPage(pageIndex);
      setTab(newTab);
    }, 50);
  };

  const myFeedPosts = [
    { 
      username: 'joshua_l', 
      profilePictureUrl: 'https://i.pravatar.cc/150?img=31',
      images: [
        'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=500&fit=crop'
      ],
      description: 'The game in Japan was amazing and I want to share some photos',
      likes: 1243,
      comments: 87
    },
    { 
      username: 'sarah_travels', 
      profilePictureUrl: 'https://i.pravatar.cc/150?img=32',
      images: [
        'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400&h=500&fit=crop'
      ],
      description: 'Sunset vibes in Bali 🌅 This place never gets old!',
      likes: 9821,
      comments: 432
    },
    { 
      username: 'alex_photography', 
      profilePictureUrl: 'https://i.pravatar.cc/150?img=33',
      images: [
        'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=400&h=500&fit=crop'
      ],
      description: 'Mountain adventure series. Which shot is your favorite?',
      likes: 543,
      comments: 32
    }
  ];

  const dailiesPosts = [
    { 
      username: 'fitness_mike', 
      profilePictureUrl: 'https://i.pravatar.cc/150?img=34',
      images: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=500&fit=crop'
      ],
      description: 'Morning workout 💪 #fitness #grind',
      likes: 125000,
      comments: 3200,
      isDaily: true
    },
    { 
      username: 'music_lover', 
      profilePictureUrl: 'https://i.pravatar.cc/150?img=35',
      images: [
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=500&fit=crop'
      ],
      description: 'Studio session 🎤 New music coming soon!',
      likes: 980000,
      comments: 12500,
      isDaily: true
    },
    { 
      username: 'soccer_pro', 
      profilePictureUrl: 'https://i.pravatar.cc/150?img=36',
      images: [
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=500&fit=crop'
      ],
      description: 'Game day! ⚽ #football #championsleague',
      likes: 3200000,
      comments: 45000,
      isDaily: true
    },
    { 
      username: 'concert_queen', 
      profilePictureUrl: 'https://i.pravatar.cc/150?img=37',
      images: [
        'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=400&h=500&fit=crop'
      ],
      description: 'On tour! 🎶 #concert #music',
      likes: 2100000,
      comments: 38000,
      isDaily: true
    }
  ];

  return (
    <View style={styles.container}>
      {/* Tab selector with properly positioned pill */}
      <View style={styles.tabContainer}>
        <View style={styles.tabSelector}>
          {/* Background pill */}
          <Animated.View 
            style={[
              styles.tabIndicator,
              {
                transform: [{ translateX: tabIndicatorX }]
              }
            ]} 
          />
          {/* Buttons on top */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => switchTab('myfeed')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.tabText,
                { color: tab === 'myfeed' ? '#000000' : '#9CA3AF' }
              ]}>
                my feed
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => switchTab('dailies')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.tabText,
                { color: tab === 'dailies' ? '#000000' : '#9CA3AF' }
              ]}>
                dailies
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Content area with PagerView - handles all swiping */}
      <AnimatedPagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageScroll={onPageScroll}
        onPageSelected={onPageSelected}
        overdrag={false}
        scrollEnabled={pagerScrollEnabled}
      >
        {/* My Feed Section */}
        <View key="myfeed" style={styles.feedSection}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            nestedScrollEnabled={true}
          >
            {myFeedPosts.map((post, i) => (
              <PostCard key={`feed-${i}`} {...post} />
            ))}
          </ScrollView>
        </View>

        {/* Dailies Section */}
        <View key="dailies" style={styles.feedSection}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            nestedScrollEnabled={true}
          >
            {dailiesPosts.map((post, i) => (
              <PostCard key={`dailies-${i}`} {...post} isDaily />
            ))}
          </ScrollView>
        </View>
      </AnimatedPagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  tabContainer: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 16,
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#374151',
    borderRadius: 24,
    padding: 4,
    width: 180,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    width: 84,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    position: 'relative',
    zIndex: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  pagerView: {
    flex: 1,
  },
  feedSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
});