import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StyleSheet,
  Animated,
  Modal,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  MessageCircle,
  X,
  ArrowLeft,
  Blend,
} from 'lucide-react-native';
import PostCard from '../components/PostCard';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ProfilePage() {
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostsFeed, setShowPostsFeed] = useState(false);
  const [selectedPostIndex, setSelectedPostIndex] = useState(0);
  const [pressTimer, setPressTimer] = useState(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [feedReady, setFeedReady] = useState(false);
  const [postsPrerendered, setPostsPrerendered] = useState(false);
  
  const feedScrollRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const previewOpacity = useRef(new Animated.Value(0)).current;
  const previewScale = useRef(new Animated.Value(0.8)).current;

  const userPosts = [
    {
      id: 1,
      username: 'suyashbhattarai',
      profilePictureUrl: 'https://i.pravatar.cc/150?img=33',
      images: [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=500&fit=crop',
        'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=400&h=500&fit=crop'
      ],
      description: 'Weekend hiking adventure in the mountains 🏔️',
      likes: 127,
      comments: 23,
      shares: 15,
      dateCreated: '2025-05-26T10:30:00Z'
    },
    {
      id: 2,
      username: 'suyashbhattarai',
      profilePictureUrl: 'https://i.pravatar.cc/150?img=33',
      images: [
        'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400&h=500&fit=crop'
      ],
      description: 'Coffee and code kind of morning ☕',
      likes: 89,
      comments: 12,
      shares: 8,
      dateCreated: '2025-05-25T08:15:00Z'
    },
    {
      id: 3,
      username: 'suyashbhattarai',
      profilePictureUrl: 'https://i.pravatar.cc/150?img=33',
      images: [
        'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=500&fit=crop'
      ],
      description: 'Late night city walks 🌃',
      likes: 156,
      comments: 18,
      shares: 22,
      dateCreated: '2025-05-23T22:20:00Z'
    },
    {
      id: 4,
      username: 'suyashbhattarai',
      profilePictureUrl: 'https://i.pravatar.cc/150?img=33',
      images: [
        'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=500&fit=crop'
      ],
      description: 'Golden hour vibes 🌅',
      likes: 234,
      comments: 45,
      shares: 31,
      dateCreated: '2025-05-24T18:45:00Z'
    },
    {
      id: 5,
      username: 'suyashbhattarai',
      profilePictureUrl: 'https://i.pravatar.cc/150?img=33',
      images: [
        'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400&h=500&fit=crop'
      ],
      description: 'Beach day memories 🏖️',
      likes: 98,
      comments: 7,
      shares: 5,
      dateCreated: '2025-05-22T14:30:00Z'
    },
    {
      id: 6,
      username: 'suyashbhattarai',
      profilePictureUrl: 'https://i.pravatar.cc/150?img=33',
      images: [
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=500&fit=crop'
      ],
      description: 'Game night with friends 🎮',
      likes: 76,
      comments: 15,
      shares: 12,
      dateCreated: '2025-05-21T19:15:00Z'
    }
  ];

  // Sort posts by dateCreated (newest first)
  const sortedPosts = [...userPosts].sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));

  // Optimized constants for better performance
  const POST_HEIGHT = 580; // Adjusted for 6:8 ratio consistency
  const POST_GAP = 12; // Reduced gap for tighter spacing
  const HEADER_HEIGHT = 70;
  const SAFE_PADDING = 8; // Minimal padding

  // Pre-render posts feed on component mount for instant switching
  useEffect(() => {
    // Preload all post images for better performance
    const preloadImages = async () => {
      const imagePromises = sortedPosts.flatMap(post => 
        post.images.map(img => Image.prefetch(img))
      );
      await Promise.all(imagePromises);
      setPostsPrerendered(true);
    };
    
    preloadImages();
  }, []);

  // Debounced scroll handler for better performance
  const handleScroll = useCallback(() => {
    setIsScrolling(true);
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 100); // Reduced timeout for snappier response
  }, []);

  const handlePostPressIn = useCallback((post, index) => {
    if (isScrolling || isHolding) return;
    
    const timer = setTimeout(() => {
      setSelectedPost(post);
      setIsHolding(true);
      
      // Reset and animate preview
      previewOpacity.setValue(0);
      previewScale.setValue(0.85);
      
      Animated.parallel([
        Animated.timing(previewOpacity, {
          toValue: 1,
          duration: 200, // Faster animation
          useNativeDriver: true,
        }),
        Animated.spring(previewScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 7,
        })
      ]).start();
    }, 150); // Reduced long press delay
    setPressTimer(timer);
  }, [isScrolling, isHolding]);

  const handlePostPressOut = useCallback(() => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
    
    if (!selectedPost) {
      setIsHolding(false);
    }
  }, [pressTimer, selectedPost]);

  const handlePostPress = useCallback((post, index) => {
    if (isScrolling || isHolding) return;
    
    // Clear any existing press timer
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
    
    setSelectedPostIndex(index);
    setShowPostsFeed(true);
    
    // Immediate slide in animation
    slideAnim.setValue(0);
    
    // Scroll to the correct position immediately after showing feed
    setTimeout(() => {
      if (feedScrollRef.current) {
        // Calculate exact position accounting for header height and safe area
        const statusBarHeight = StatusBar.currentHeight || 0;
        const safeAreaTop = 44; // Approximate safe area top for most devices
        const totalHeaderHeight = HEADER_HEIGHT + safeAreaTop + statusBarHeight;
        const targetY = index * (POST_HEIGHT + POST_GAP) + totalHeaderHeight;
        
        feedScrollRef.current.scrollTo({ 
          y: targetY, 
          animated: false 
        });
        setFeedReady(true);
      }
    }, 50);
  }, [isScrolling, isHolding, pressTimer]);

  const closeModal = useCallback(() => {
    if (!selectedPost) return;
    
    Animated.parallel([
      Animated.timing(previewOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(previewScale, {
        toValue: 0.85,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start(() => {
      setSelectedPost(null);
      setIsHolding(false);
    });
  }, [selectedPost]);

  const closeFeed = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: screenWidth,
      duration: 280,
      useNativeDriver: true,
    }).start(() => {
      setShowPostsFeed(false);
      setFeedReady(false);
    });
  }, []);

  const renderGridPost = useCallback((post, index) => {
    const gridItemWidth = (screenWidth - 24) / 2;
    const gridItemHeight = gridItemWidth * 1.33; // 6:8 ratio (4:3 for grid display)
    
    return (
      <TouchableOpacity
        key={post.id}
        style={[styles.gridItem, { width: gridItemWidth, height: gridItemHeight }]}
        onPressIn={() => handlePostPressIn(post, index)}
        onPressOut={handlePostPressOut}
        onPress={() => handlePostPress(post, index)}
        activeOpacity={0.9}
        delayPressIn={0}
      >
        <Image
          source={{ uri: post.images[0] }}
          style={styles.gridImage}
          resizeMode="cover"
          // Add cache policy for better performance
          cache="force-cache"
        />
        {post.images.length > 1 && (
          <View style={styles.multipleImagesIndicator}>
            <View style={styles.blendIconContainer}>
              <Blend size={12} color="white" />
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  }, [handlePostPressIn, handlePostPressOut, handlePostPress]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={32} // Optimized throttle
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>@suyashbhattarai</Text>
        </View>
        
        {/* Profile Info Section */}
        <View style={styles.profileSection}>
          {/* Profile Picture Area */}
          <View style={styles.profilePictureContainer}>
            <View style={styles.profilePictureBorder}>
              <Image
                source={{ uri: 'https://i.pravatar.cc/150?img=33' }}
                style={styles.profilePicture}
                cache="force-cache"
              />
            </View>
          </View>

          {/* Username and Bio */}
          <View style={styles.bioContainer}>
            <Text style={styles.userName}>Suyash Bhattarai</Text>
            <Text style={styles.bioText}>
              non-practicing intellectual;{'\n'}v wholesome individual;
            </Text>
          </View>

          {/* Stats and Actions */}
          <View style={styles.statsContainer}>
            <View style={styles.statsLeft}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>54</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>834</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>
            
            <View style={styles.actionsRight}>
              <TouchableOpacity style={styles.followButton}>
                <Text style={styles.followButtonText}>follow</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.chatButton}>
                <MessageCircle size={20} color="#000000" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Posts Grid */}
        <View style={styles.postsGrid}>
          <View style={styles.gridContainer}>
            {sortedPosts.map(renderGridPost)}
          </View>
        </View>
      </ScrollView>

      {/* Pre-rendered Posts Feed Modal - Always rendered but hidden */}
      <Modal
        visible={showPostsFeed}
        animationType="none"
        transparent={false}
        onRequestClose={closeFeed}
        statusBarTranslucent={true}
      >
        <GestureHandlerRootView style={styles.gestureContainer}>
          <SafeAreaView style={styles.feedModalSafeArea} edges={['top', 'left', 'right']}>
            <View style={styles.feedModal}>
              {/* Feed Header */}
              <View style={styles.feedHeader}>
                <TouchableOpacity onPress={closeFeed} style={styles.backButton}>
                  <ArrowLeft size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.feedHeaderText}>@suyashbhattarai</Text>
                <View style={styles.headerSpacer} />
              </View>

              {/* Scrollable Posts Feed */}
              <ScrollView
                ref={feedScrollRef}
                style={styles.feedScrollView}
                contentContainerStyle={styles.feedContent}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={true} // Performance optimization
                maxToRenderPerBatch={3} // Render optimization
                windowSize={5} // Memory optimization
              >
                {sortedPosts.map((post, index) => (
                  <View key={`feed-${post.id}-${index}`} style={styles.feedPostContainer}>
                    <PostCard {...post} />
                  </View>
                ))}
              </ScrollView>
            </View>
          </SafeAreaView>
        </GestureHandlerRootView>
      </Modal>

      {/* Simplified Hold Preview Modal - Just shows PostCard */}
      <Modal
        visible={selectedPost !== null}
        animationType="none"
        transparent={true}
        onRequestClose={closeModal}
        statusBarTranslucent={true}
      >
        <TouchableOpacity
          style={styles.previewModal}
          activeOpacity={1}
          onPress={closeModal}
        >
          <Animated.View 
            style={[
              styles.previewContainer,
              {
                opacity: previewOpacity,
                transform: [{ scale: previewScale }],
              }
            ]}
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeModal}
            >
              <View style={styles.closeButtonBackground}>
                <X size={24} color="white" />
              </View>
            </TouchableOpacity>
            
            {selectedPost && (
              <View style={styles.previewPostContainer}>
                <PostCard {...selectedPost} />
              </View>
            )}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 16,
    marginBottom: 16,
  },
  headerText: {
    fontSize: 18,
    fontStyle: 'italic',
    color: 'white',
    fontFamily: 'serif',
  },
  profileSection: {
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  profilePictureContainer: {
    backgroundColor: '#000000',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  profilePictureBorder: {
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 80,
    padding: 6,
  },
  profilePicture: {
    width: 128,
    height: 128,
    borderRadius: 64,
  },
  bioContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  bioText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  statsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsLeft: {
    flexDirection: 'row',
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  followButton: {
    backgroundColor: '#000000',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  followButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  chatButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postsGrid: {
    paddingHorizontal: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    backgroundColor: '#3f3f46',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  multipleImagesIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  blendIconContainer: {
    width: 24,
    height: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gestureContainer: {
    flex: 1,
  },
  feedModalSafeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  feedModal: {
    flex: 1,
    backgroundColor: '#000000',
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    backgroundColor: '#000000',
    zIndex: 10,
  },
  backButton: {
    padding: 4,
  },
  feedHeaderText: {
    fontSize: 18,
    fontStyle: 'italic',
    color: 'white',
    fontFamily: 'serif',
  },
  headerSpacer: {
    width: 32,
  },
  feedScrollView: {
    flex: 1,
  },
  feedContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  feedPostContainer: {
    marginBottom: 12,
  },
  previewModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  previewContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: 380,
  },
  closeButton: {
    position: 'absolute',
    top: -60,
    right: 0,
    zIndex: 20,
    padding: 8,
  },
  closeButtonBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    padding: 8,
  },
  previewPostContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 24,
  },
});