import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { PanGestureHandler, State, TapGestureHandler } from 'react-native-gesture-handler';
import { MessageCircle, Send } from 'lucide-react-native';
import LottieView from 'lottie-react-native';

// Import SVG icons
import LikeIcon from '../../assets/like-icon.svg';
import LikedIcon from '../../assets/liked-icon.svg';

const { width: screenWidth } = Dimensions.get('window');

export default function PostCard(props) {
  const { 
    username, 
    profilePictureUrl, 
    images, 
    description, 
    isDaily = false,
    likes = 0,
    comments = 0,
    shares = 0
  } = props;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDoubleTapAnimating, setIsDoubleTapAnimating] = useState(false);
  
  const slideAnim = useRef(new Animated.Value(0)).current;
  const lottieRef = useRef();
  const doubleTapLottieRef = useRef();
  const doubleTapOpacity = useRef(new Animated.Value(0)).current;

  // Function to format counter numbers (only show first 2 digits, don't round up)
  const formatCounter = (count) => {
    if (count === 0) {
      return '';
    } else if (count < 1000) {
      return count.toString();
    } else if (count < 1000000) {
      // Get first two digits for thousands (floor division to avoid rounding up)
      const thousands = Math.floor(count / 100) / 10;
      return `${thousands}K`;
    } else {
      // Get first two digits for millions (floor division to avoid rounding up)
      const millions = Math.floor(count / 100000) / 10;
      return `${millions}M`;
    }
  };

  const imageWidth = screenWidth - 32; // Account for horizontal padding
  const imageHeight = imageWidth * (8/6); // 6:8 aspect ratio (width:height)

  const onSwipeGesture = (event) => {
    const { translationX, state, velocityX } = event.nativeEvent;
    
    if (state === State.ACTIVE) {
      // During active swipe, move the carousel based on gesture
      const newTranslateX = -currentImageIndex * imageWidth + translationX;
      
      // Apply rubber band effect at boundaries
      let boundedTranslateX = newTranslateX;
      const minTranslate = -(images.length - 1) * imageWidth;
      const maxTranslate = 0;
      
      if (newTranslateX > maxTranslate) {
        // Rubber band effect on the left (first image)
        const overscroll = newTranslateX - maxTranslate;
        boundedTranslateX = maxTranslate + overscroll * 0.3;
      } else if (newTranslateX < minTranslate) {
        // Rubber band effect on the right (last image)
        const overscroll = minTranslate - newTranslateX;
        boundedTranslateX = minTranslate - overscroll * 0.3;
      }
      
      slideAnim.setValue(boundedTranslateX);
    } else if (state === State.END) {
      const threshold = imageWidth * 0.5; // 50% threshold
      const swipeDistance = Math.abs(translationX);
      const swipeVelocity = Math.abs(velocityX);
      
      let nextIndex = currentImageIndex;
      
      // Determine if we should change image based on distance or velocity
      if (swipeDistance > threshold || swipeVelocity > 1000) {
        if (translationX < 0 && currentImageIndex < images.length - 1) {
          // Swiping left (next image)
          nextIndex = currentImageIndex + 1;
        } else if (translationX > 0 && currentImageIndex > 0) {
          // Swiping right (previous image)
          nextIndex = currentImageIndex - 1;
        }
      }
      
      // Animate to the target position
      setCurrentImageIndex(nextIndex);
      Animated.timing(slideAnim, {
        toValue: -nextIndex * imageWidth,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleLikePress = () => {
    if (!liked) {
      // Liking the post
      setIsAnimating(true);
      
      // Reset and play animation
      if (lottieRef.current) {
        lottieRef.current?.reset();
        lottieRef.current?.play();
      }
      
      // Set liked state after a brief delay to ensure animation starts
      setTimeout(() => {
        setLiked(true);
      }, 50);
      
      // Stop animation after it completes
      setTimeout(() => {
        setIsAnimating(false);
      }, 1200);
    } else {
      // Unliking the post - reset everything immediately
      setIsAnimating(false);
      setLiked(false);
      
      // Ensure lottie animation is reset when unliking
      if (lottieRef.current) {
        lottieRef.current?.reset();
      }
    }
  };

  const handleDoubleTap = () => {
    if (!liked) {
      // Like the post
      setLiked(true);
      setIsDoubleTapAnimating(true);
      
      // Show and animate the double tap heart
      doubleTapOpacity.setValue(1);
      
      if (doubleTapLottieRef.current) {
        doubleTapLottieRef.current?.reset();
        doubleTapLottieRef.current?.play();
      }
      
      // Fade out the animation after completion
      setTimeout(() => {
        Animated.timing(doubleTapOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setIsDoubleTapAnimating(false);
        });
      }, 800);
    }
  };


  return (
    <View style={styles.container}>
      {/* Image section */}
      <PanGestureHandler 
        onGestureEvent={onSwipeGesture} 
        onHandlerStateChange={onSwipeGesture}
        activeOffsetX={[-5, 5]} // More sensitive to horizontal movement
        failOffsetY={[-10, 10]} // Less sensitive to vertical movement
        shouldCancelWhenOutside={false} // Don't cancel when moving outside
        enabled={images.length > 1}
        simultaneousHandlers={[]} // Don't allow simultaneous handlers
      >
        <Animated.View 
          style={[styles.imageContainer, { height: imageHeight }]}
        >
          <TapGestureHandler numberOfTaps={2} onActivated={handleDoubleTap}>
            <Animated.View style={styles.imageContainer}>
              {/* Profile picture overlay */}
              <View style={styles.profileContainer}>
                <View style={styles.profileImageContainer}>
                  <Image 
                    source={{ uri: profilePictureUrl }} 
                    style={styles.profileImage}
                  />
                </View>
              </View>

              {/* Image carousel */}
              <View style={styles.carouselContainer}>
                <Animated.View
                  style={[
                    styles.imageRow,
                    {
                      width: images.length * imageWidth,
                      transform: [{ translateX: slideAnim }]
                    }
                  ]}
                >
                  {images.map((image, index) => (
                    <View key={index} style={[styles.imageWrapper, { width: imageWidth }]}>
                      <Image 
                        source={{ uri: image }} 
                        style={styles.postImage}
                        resizeMode="cover"
                      />
                    </View>
                  ))}
                </Animated.View>
              </View>

              {/* Double tap heart animation */}
              {isDoubleTapAnimating && (
                <Animated.View 
                  style={[
                    styles.doubleTapHeartContainer,
                    { opacity: doubleTapOpacity }
                  ]}
                >
                  <LottieView
                    ref={doubleTapLottieRef}
                    source={require('../../assets/like-animation.json')}
                    autoPlay={false}
                    loop={false}
                    style={styles.doubleTapHeart}
                  />
                </Animated.View>
              )}

              {/* Paginator dots */}
              {images.length > 1 && (
                <View style={styles.paginatorContainer}>
                  {images.map((_, index) => (
                    <View
                      key={`dot-${index}`}
                      style={[
                        styles.dot,
                        index === currentImageIndex 
                          ? styles.activeDot 
                          : styles.inactiveDot
                      ]}
                    />
                  ))}
                </View>
              )}
            </Animated.View>
          </TapGestureHandler>
        </Animated.View>
      </PanGestureHandler>

      {/* Bottom section with description */}
      <View style={styles.bottomSection}>
        {/* Action Buttons with Counters */}
        <View style={styles.actionsContainer}>
          {/* Like Button with Counter */}
          <View style={styles.actionItem}>
            <TouchableWithoutFeedback onPress={handleLikePress}>
              <View style={styles.actionButton}>
                {/* Static like icon - hidden when animating or liked */}
                {!isAnimating && !liked && (
                  <LikeIcon
                    width={28}
                    height={28}
                  />
                )}
                
                {/* Animation layer - always present but only visible when animating */}
                <View style={[styles.animationContainer, { opacity: isAnimating ? 1 : 0 }]}>
                  <LottieView
                    ref={lottieRef}
                    source={require('../../assets/like-animation.json')}
                    autoPlay={false}
                    loop={false}
                    style={styles.lottieAnimation}
                  />
                </View>
                
                {/* Liked icon - only show when liked and not animating */}
                {liked && !isAnimating && (
                  <LikedIcon
                    width={28}
                    height={28}
                  />
                )}
              </View>
            </TouchableWithoutFeedback>
            {formatCounter(likes) !== '' && (
              <Text style={styles.counterText}>{formatCounter(likes)}</Text>
            )}
          </View>

          {/* Comment Button with Counter */}
          <View style={styles.actionItem}>
            <TouchableWithoutFeedback>
              <View style={styles.actionButton}>
                <MessageCircle size={28} color="#121330" strokeWidth={1} />
              </View>
            </TouchableWithoutFeedback>
            {formatCounter(comments) !== '' && (
              <Text style={styles.counterText}>{formatCounter(comments)}</Text>
            )}
          </View>

          {/* Share Button with Counter */}
          <View style={styles.actionItem}>
            <TouchableWithoutFeedback>
              <View style={styles.actionButton}>
                <Send size={28} color="#121330" strokeWidth={1} />
              </View>
            </TouchableWithoutFeedback>
            {formatCounter(shares) !== '' && (
              <Text style={styles.counterText}>{formatCounter(shares)}</Text>
            )}
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>
            <Text style={styles.usernameText}>{username}</Text> {description}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  imageContainer: {
    backgroundColor: '#000000',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    position: 'relative',
    flex: 1,
  },
  profileContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 20,
  },
  profileImageContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  carouselContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  imageRow: {
    flexDirection: 'row',
    height: '100%',
  },
  imageWrapper: {
    height: '100%',
    overflow: 'hidden',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  doubleTapHeartContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -40 }, { translateY: -40 }],
    zIndex: 30,
    pointerEvents: 'none',
  },
  doubleTapHeart: {
    width: 80,
    height: 80,
  },
  paginatorContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 20,
  },
  dot: {
    borderRadius: 8,
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  activeDot: {
    width: 8,
    height: 8,
    backgroundColor: '#FFFFFF',
  },
  inactiveDot: {
    width: 6,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  bottomSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: -5, // Adjust this value to change gap above username/description
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  animationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 28,
    height: 28,
    pointerEvents: 'none',
  },
  lottieAnimation: {
    width: '100%',
    height: '100%',
  },
  counterText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: 'bold',
    marginLeft: 4,
    fontFamily: 'Montserrat',
  },
  descriptionContainer: {
    marginTop: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  usernameText: {
    fontWeight: '600',
  },
});