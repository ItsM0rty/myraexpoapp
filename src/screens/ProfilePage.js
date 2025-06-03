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
  TouchableWithoutFeedback, // Added TouchableWithoutFeedback
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  MessageCircle,
  X,
  ArrowLeft,
  Blend,
} from 'lucide-react-native';
import PostCard from '../components/PostCard'; // Assuming PostCard.js is in ../components/

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ProfilePage() {
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostsFeed, setShowPostsFeed] = useState(false);
  const [selectedPostIndex, setSelectedPostIndex] = useState(0);
  const [pressTimer, setPressTimer] = useState(null);
  const [isScrolling, setIsScrolling] = useState(false);
  // const [feedReady, setFeedReady] = useState(false); // feedReady seems unused, can be removed if not needed elsewhere
  const [lastTapTime, setLastTapTime] = useState(0);

  const feedScrollRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const previewOpacity = useRef(new Animated.Value(0)).current;
  const previewScale = useRef(new Animated.Value(0.8)).current;

  // Ref to track if a hold action occurred in the current interaction
  const didHoldOccurRef = useRef(false);

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

  const sortedPosts = [...userPosts].sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));

  const POST_HEIGHT = 580; // Used for scrolling in feed
  const POST_GAP = 12; // Used for scrolling in feed
  // const HEADER_HEIGHT = 70; // Seems unused

  const handleScroll = useCallback(() => {
    setIsScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 100);
  }, []);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      // Clear pressTimer on unmount as well
      if (pressTimer) {
        clearTimeout(pressTimer);
      }
    };
  }, [pressTimer]); // Added pressTimer to dependency array for cleanup

  const handlePostPress = useCallback((post) => { // Index not needed here
    if (isScrolling) return;

    const timer = setTimeout(() => {
      // Check if the press is still active (e.g. selectedPost is still null or pressTimer hasn't been cleared by a release)
      // This check helps prevent setting state if the user released just before the timer fired.
      // However, with the current logic, if timer fires, it means a hold.
      setSelectedPost(post);
      didHoldOccurRef.current = true; // Mark that a hold action has completed

      previewOpacity.setValue(0);
      previewScale.setValue(0.8);

      Animated.parallel([
        Animated.timing(previewOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(previewScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 7,
        })
      ]).start();
    }, 400); 
    setPressTimer(timer);
  }, [isScrolling, previewOpacity, previewScale]); // Added previewOpacity, previewScale to deps

  const handlePostRelease = useCallback(() => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
    // didHoldOccurRef is reset at the beginning of a new onPressIn
  }, [pressTimer]);

  const handlePostClick = useCallback((post, index) => {
    // The check for didHoldOccurRef.current is now done in the onPress handler directly.
    // So, if handlePostClick is called, it means a tap (not a hold) is intended.

    if (isScrolling) return;

    const currentTime = Date.now();
    if (currentTime - lastTapTime < 300) return; // Debounce
    setLastTapTime(currentTime);

    // This clear is still important: if user taps very quickly *before* hold timer fires.
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }

    setSelectedPostIndex(index);
    setShowPostsFeed(true);
  }, [isScrolling, lastTapTime, pressTimer]);

  useEffect(() => {
    if (showPostsFeed && feedScrollRef.current) {
      const timer = setTimeout(() => {
        if (feedScrollRef.current) {
          const targetY = selectedPostIndex * (POST_HEIGHT + POST_GAP);
          feedScrollRef.current.scrollTo({
            y: targetY,
            animated: false
          });
          // setFeedReady(true); // feedReady seems unused
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showPostsFeed, selectedPostIndex]);

  const closeModal = useCallback(() => {
    if (!selectedPost) return; // Check if a post is actually selected

    Animated.parallel([
      Animated.timing(previewOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(previewScale, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start(() => {
      setSelectedPost(null);
    });
  }, [selectedPost, previewOpacity, previewScale]); // Added deps

  const closeFeed = useCallback(() => {
    setShowPostsFeed(false);
    // setFeedReady(false); // feedReady seems unused
  }, []);

  const renderGridPost = useCallback((post, index) => {
    const gridItemWidth = (screenWidth - 24) / 2; // 8 (paddingHorizontal) * 2 + 8 (gap) = 24
    const gridItemHeight = gridItemWidth * 1.33;

    return (
      <TouchableOpacity
        key={post.id}
        style={[styles.gridItem, { width: gridItemWidth, height: gridItemHeight }]}
        onPressIn={() => {
          didHoldOccurRef.current = false; // Reset for new press interaction
          handlePostPress(post); // Pass only post, index not used by handlePostPress
        }}
        onPressOut={handlePostRelease}
        onPress={() => {
          // If a hold action was already triggered and successfully showed the preview,
          // we don't want to also trigger the click action.
          if (didHoldOccurRef.current) {
            return;
          }
          handlePostClick(post, index);
        }}
        activeOpacity={0.7}
        delayPressIn={0} // Important for immediate onPressIn
        // delayPressOut={0} // Default is 0, not strictly needed
      >
        <Image
          source={{ uri: post.images[0] }}
          style={styles.gridImage}
          resizeMode="cover"
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
  }, [handlePostPress, handlePostRelease, handlePostClick]); // Dependencies for renderGridPost

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16} // Good for onScroll performance
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

      {/* Posts Feed Modal */}
      <Modal
        visible={showPostsFeed}
        animationType="slide"
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

      {/* Hold Preview Modal - Fixed to show full PostCard */}
      <Modal
        visible={selectedPost !== null}
        animationType="none" // Using custom Animated opacity/scale
        transparent={true}
        onRequestClose={closeModal}
        statusBarTranslucent={true}
      >
        <TouchableOpacity
          style={styles.previewModal} // This TouchableOpacity acts as the modal background
          activeOpacity={1} // To make the background fully opaque to touches
          onPress={closeModal} // Close modal if background is tapped
        >
          {/* Wrap content in a non-TouchableOpacity View to prevent press propagation if content is tapped */}
          <TouchableWithoutFeedback onPress={() => { /* Do nothing to prevent closing when tapping on card */}}>
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
          </TouchableWithoutFeedback>
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
    fontFamily: 'serif', // Ensure this font is available or use a default
  },
  profileSection: {
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  profilePictureContainer: {
    backgroundColor: '#000000', // Or a slightly different shade for depth
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  profilePictureBorder: {
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 80, // Should be half of width/height of inner image + padding
    padding: 6,
  },
  profilePicture: {
    width: 128,
    height: 128,
    borderRadius: 64, // Half of width/height
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
    paddingHorizontal: 8, // Matches profileSection for alignment
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8, // Gap between items
  },
  gridItem: {
    backgroundColor: '#3f3f46', // Placeholder color
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative', // For absolute positioning of indicators
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
    borderRadius: 12, // Half of width/height
    alignItems: 'center',
    justifyContent: 'center',
  },
  gestureContainer: { // For react-native-gesture-handler
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
    paddingVertical: 14, // Or adjust to match typical header height
    borderBottomWidth: 1,
    borderBottomColor: '#374151', // Darker border
    backgroundColor: '#000000', // Ensure header bg matches modal bg
    zIndex: 10, // Keep header above content
  },
  backButton: {
    padding: 4, // Easier to tap
  },
  feedHeaderText: {
    fontSize: 18,
    fontStyle: 'italic',
    color: 'white',
    fontFamily: 'serif', // Ensure this font is available
  },
  headerSpacer: { // To balance the back button for centering title
    width: 24 + 8, // Approx width of ArrowLeft (24) + padding (4*2)
  },
  feedScrollView: {
    flex: 1,
  },
  feedContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40, // Ensure space at the bottom
  },
  feedPostContainer: {
    marginBottom: 12, // Gap between posts in feed
  },
  previewModal: { // This is the TouchableOpacity acting as modal background
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20, // Padding around the content area
  },
  previewContainer: { // This is the Animated.View holding the PostCard
    position: 'relative', // For absolute positioning of close button
    width: '100%', // Takes full width of padded area from previewModal
    // maxWidth: 380, // REMOVED: This was causing the PostCard to be too constrained
    alignItems: 'center', // Center the PostCard if it's narrower than this container
  },
  closeButton: {
    position: 'absolute',
    top: -60, // Adjust as needed to position outside/above the card
    right: 0, // Align to the right of the previewContainer
    zIndex: 20, // Above the card
    padding: 8, // Larger tap area
  },
  closeButtonBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20, // Make it circular
    padding: 8,
  },
  previewPostContainer: { // Wrapper for the PostCard itself inside the animated view
    borderRadius: 16, // Match PostCard's border radius
    overflow: 'hidden', // Clip the PostCard if it somehow overflows this
    width: '100%', // Ensure it takes the width from previewContainer
    // Add shadow styles if PostCard itself doesn't have them or if you want an outer shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 24, // For Android shadow
  },
});
