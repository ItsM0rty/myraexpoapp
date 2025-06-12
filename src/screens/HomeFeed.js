import React, { useRef, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import PostCard from '../components/PostCard';

const { width: screenWidth } = Dimensions.get('window');

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView);

export default function HomeFeed() {
  const [tab, setTab] = useState('myfeed');
  const pagerRef = useRef(null);
  
  // Reanimated shared values
  const scrollOffset = useSharedValue(0);
  const currentPage = useSharedValue(0);
  const isTransitioning = useSharedValue(false);
  const isDirectTabSwitch = useSharedValue(false); // Flag for direct tab switches
  
  // Measurements
  const tabSelectorWidth = 180;
  const pillWidth = 84;
  const containerPadding = 4;
  const leftPillPosition = containerPadding;
  const rightPillPosition = tabSelectorWidth - pillWidth - containerPadding;

  const onPageScroll = (event) => {
    const { offset, position } = event.nativeEvent;
    
    // Only update if not transitioning from tab press
    if (!isTransitioning.value) {
      scrollOffset.value = offset;
      currentPage.value = position;
      isDirectTabSwitch.value = false; // Reset flag during swipe
    }
  };

  const onPageSelected = (e) => {
    const pageIndex = e.nativeEvent.position;
    const newTab = pageIndex === 0 ? 'myfeed' : 'dailies';
    
    // Update values smoothly when page selection completes
    currentPage.value = pageIndex;
    scrollOffset.value = pageIndex;
    isTransitioning.value = false;
    isDirectTabSwitch.value = false; // Reset flag after transition
    
    setTab(newTab);
  };

  // Spring configurations for different interaction types
  const springConfigs = {
    pill: {
      direct: { damping: 25, stiffness: 160, mass: 0.9 }, // Faster but smooth for direct switch
      swipe: { damping: 32, stiffness: 350, mass: 0.9 } // Slightly faster for swipe, matching page transition
    },
    text: {
      direct: { damping: 25, stiffness: 160, mass: 0.9 }, // Faster text fade for direct switch
      swipe: { damping: 32, stiffness: 29, mass: 9 } // Slightly faster for swipe, matching page transition
    },
    page: {
      damping: 22, stiffness: 160, mass: 0.9 // Adjusted to sync with pill animation
    }
  };

  const switchTab = (newTab) => {
    if (newTab === tab) return;
    
    const pageIndex = newTab === 'myfeed' ? 0 : 1;
    
    // Set transitioning and direct tab switch flags
    isTransitioning.value = true;
    isDirectTabSwitch.value = true;
    
    // Smoothly animate to target position with faster but fluid spring
    const targetPosition = pageIndex;
    
    currentPage.value = withSpring(targetPosition, springConfigs.page);
    scrollOffset.value = withSpring(targetPosition, springConfigs.page);
    
    // Update tab state immediately for text color changes
    setTab(newTab);
    
    // Trigger page change after a longer delay to sync with animation
    setTimeout(() => {
      pagerRef.current?.setPage(pageIndex);
    }, 150); // Increased to 150ms for slower, deliberate tab switch
  };

  // Animated style for the pill indicator with conditional spring parameters
  const animatedPillStyle = useAnimatedStyle(() => {
    let pillPosition;
    
    // Calculate position based on current page and scroll offset
    const totalProgress = currentPage.value + scrollOffset.value;
    pillPosition = interpolate(
      totalProgress,
      [0, 1],
      [leftPillPosition, rightPillPosition],
      'clamp'
    );
    
    // Use different spring configs based on interaction type
    const springConfig = isDirectTabSwitch.value 
      ? springConfigs.pill.direct
      : springConfigs.pill.swipe;
    
    return {
      transform: [
        {
          translateX: withSpring(pillPosition, springConfig),
        },
      ],
    };
  });

  // Animated styles for text colors with faster fade for direct tab switch
  const myFeedTextStyle = useAnimatedStyle(() => {
    const totalProgress = currentPage.value + scrollOffset.value;
    const progress = interpolate(totalProgress, [0, 1], [1, 0], 'clamp');
    const opacity = interpolate(progress, [0, 1], [0.6, 1], 'clamp');
    
    const springConfig = isDirectTabSwitch.value
      ? springConfigs.text.direct
      : springConfigs.text.swipe;
    
    return {
      opacity: withSpring(opacity, springConfig),
    };
  });

  const dailiesTextStyle = useAnimatedStyle(() => {
    const totalProgress = currentPage.value + scrollOffset.value;
    const progress = interpolate(totalProgress, [0, 1], [0, 1], 'clamp');
    const opacity = interpolate(progress, [0, 1], [0.6, 1], 'clamp');
    
    const springConfig = isDirectTabSwitch.value
      ? springConfigs.text.direct
      : springConfigs.text.swipe;
    
    return {
      opacity: withSpring(opacity, springConfig),
    };
  });

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
          {/* Background pill with smooth animation */}
          <Animated.View 
            style={[
              styles.tabIndicator,
              animatedPillStyle
            ]} 
          />
          {/* Buttons on top */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => switchTab('myfeed')}
              activeOpacity={0.7}
            >
              <Animated.Text style={[
                styles.tabText,
                { color: tab === 'myfeed' ? '#000000' : '#9CA3AF' },
                myFeedTextStyle
              ]}>
                my feed
              </Animated.Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => switchTab('dailies')}
              activeOpacity={0.7}
            >
              <Animated.Text style={[
                styles.tabText,
                { color: tab === 'dailies' ? '#000000' : '#9CA3AF' },
                dailiesTextStyle
              ]}>
                dailies
              </Animated.Text>
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
        scrollEnabled={true}
      >
        {/* My Feed Section */}
        <View key="myfeed" style={styles.feedSection}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
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
    paddingTop: 10,
    paddingBottom: 10,
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
    fontSize: 15,
    fontFamily: 'SF-Pro-Display-Semibold',
    
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