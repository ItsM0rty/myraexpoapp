import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, Image, Dimensions, ScrollView, TextInput } from 'react-native';
import { Plus, ChevronLeft, Minus } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = 6/8;

export const PostCaptureScreen = ({
  capturedImages, // Now receives array of images
  onAddMore,
  onAddNewImage, // New prop for adding images
  onRemoveImage, // New prop for removing images
  onPostToDailies,
  onPostToFeed,
  onRetake, // We'll use this for the back/retake functionality
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [postDescription, setPostDescription] = useState('');
  const [postDestination, setPostDestination] = useState('dailies'); // 'dailies' or 'feed'
  const [postAudience, setPostAudience] = useState('everyone'); // 'everyone' or 'followers'

  // Update current index when images array changes
  useEffect(() => {
    if (capturedImages && capturedImages.length > 0) {
      // Set to last image when new images are added
      setCurrentImageIndex(capturedImages.length - 1);
    }
  }, [capturedImages]);

  const handleAddMore = () => {
    if (capturedImages && capturedImages.length < 3) {
      onAddMore();
    }
  };

  const selectImage = (index) => {
    setCurrentImageIndex(index);
  };

  const removeCurrentImage = () => {
    if (capturedImages && capturedImages.length > 1) {
      const imageToRemove = capturedImages[currentImageIndex];
      onRemoveImage(imageToRemove);
      
      // Adjust current index if needed
      const newIndex = currentImageIndex >= capturedImages.length - 1 ? 
        Math.max(0, capturedImages.length - 2) : currentImageIndex;
      setCurrentImageIndex(newIndex);
    }
  };

  const currentImage = capturedImages && capturedImages[currentImageIndex] ? 
    capturedImages[currentImageIndex].uri : null;

  return (
    <View style={styles.container}>
      {/* Fixed Header with back button */}
      <View style={styles.fixedHeader}>
        <TouchableOpacity style={styles.backButton} onPress={onRetake}>
          <ChevronLeft size={24} color="#ffffff"/>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Preview */}
        <View style={styles.imageContainer}>
          <View style={styles.imageFrame}>
            <Image 
              source={{ uri: currentImage }}
              style={styles.capturedImage}
              resizeMode="cover"
            />
          </View>
          {/* Remove current image button - moved outside imageFrame */}
          {capturedImages && capturedImages.length > 1 && (
            <TouchableOpacity style={styles.removeButton} onPress={removeCurrentImage}>
              <Minus size={16} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {/* Image thumbnails and Add More Button Row */}
          <View style={styles.thumbnailsContainer}>
            {/* Thumbnail images */}
            {capturedImages && capturedImages.map((image, index) => (
              <TouchableOpacity 
                key={`${image.timestamp}-${index}`}
                style={[
                  styles.thumbnailButton,
                  currentImageIndex === index && styles.selectedThumbnail
                ]}
                onPress={() => selectImage(index)}
              >
                <Image 
                  source={{ uri: image.uri }}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
            
            {/* Add More Button */}
            {capturedImages && capturedImages.length < 3 && (
              <TouchableOpacity style={styles.addMoreButton} onPress={handleAddMore}>
                <Plus size={24} color="#ffffff" />
              </TouchableOpacity>
            )}
          </View>

          {/* Post Description Input */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Add a description</Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Whaddya think?"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={postDescription}
              onChangeText={setPostDescription}
              maxLength={80}
            />
            <Text style={styles.characterCount}>
              {postDescription.length}/80
            </Text>
          </View>

          {/* Post Options */}
          <View style={styles.postOptionsContainer}>
            <Text style={styles.postOptionsTitle}>Post Settings</Text>
            
            {/* Post to row */}
            <View style={styles.dropdownRow}>
              <Text style={styles.dropdownLabel}>Post to</Text>
              <View style={styles.dropdownGroup}>
                <TouchableOpacity 
                  style={[
                    styles.dropdownOption, 
                    postDestination === 'dailies' && styles.dropdownOptionSelected
                  ]}
                  onPress={() => setPostDestination('dailies')}
                >
                  <Text style={[
                    styles.dropdownOptionText,
                    postDestination === 'dailies' && styles.dropdownOptionTextSelected
                  ]}>Dailies</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.dropdownOption,
                    postDestination === 'feed' && styles.dropdownOptionSelected
                  ]}
                  onPress={() => setPostDestination('feed')}
                >
                  <Text style={[
                    styles.dropdownOptionText,
                    postDestination === 'feed' && styles.dropdownOptionTextSelected
                  ]}>Feed</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Visible to row */}
            <View style={styles.dropdownRow}>
              <Text style={styles.dropdownLabel}>Visible to</Text>
              <View style={styles.dropdownGroup}>
                <TouchableOpacity 
                  style={[
                    styles.dropdownOption, 
                    postAudience === 'everyone' && styles.dropdownOptionSelected
                  ]}
                  onPress={() => setPostAudience('everyone')}
                >
                  <Text style={[
                    styles.dropdownOptionText,
                    postAudience === 'everyone' && styles.dropdownOptionTextSelected
                  ]}>Everyone</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.dropdownOption,
                    postAudience === 'followers' && styles.dropdownOptionSelected
                  ]}
                  onPress={() => setPostAudience('followers')}
                >
                  <Text style={[
                    styles.dropdownOptionText,
                    postAudience === 'followers' && styles.dropdownOptionTextSelected
                  ]}>Followers</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Single Post Button */}
          <TouchableOpacity 
            style={styles.singlePostButton} 
            onPress={() => {
              if (postDestination === 'dailies') {
                onPostToDailies();
              } else {
                onPostToFeed();
              }
            }}
          >
            <Text style={styles.singlePostButtonText}>
              Post to {postDestination === 'dailies' ? 'Dailies' : 'Feed'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  fixedHeader: {
    position: 'absolute',
    top: 15,
    left: 5,
    zIndex: 1000,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#000000',
    position: 'relative',
  },
  imageFrame: {
    aspectRatio: ASPECT_RATIO,
    width: '100%',
    maxWidth: 400,
    maxHeight: height - 300, // Reduced to accommodate description box
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  capturedImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 50, // Adjusted to be outside the image frame but still relative to imageContainer
    right: 25,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF0000',
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  actionsContainer: {
    padding: 24,
    paddingTop: 8, // Small gap after imageContainer
    paddingBottom: 40,
    gap: 20,
  },
  thumbnailsContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center', // Center horizontally
  },
  thumbnailButton: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedThumbnail: {
    borderColor: '#ffffff',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  addMoreButton: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',

  },
  descriptionContainer: {
    gap: 8,
    marginTop: 12,

  },
  descriptionLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  descriptionInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 16,
    height: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  characterCount: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  shareOptionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  shareOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  shareOptionSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#ffffff',
  },
  shareOptionText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  shareOptionTextSelected: {
    color: '#ffffff',
  },
  postOptionsContainer: {
    gap: 12,
  },
  postOptionsTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  dropdownContainer: {
    gap: 8,
  },
  dropdownLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
    minWidth: 70,
    flex: 0,
  },
  dropdownGroup: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
    maxWidth: width * 0.55, // Limit width to prevent overflow
  },
  dropdownOption: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20, // More rounded
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    minWidth: 0, // Allow shrinking
  },
  dropdownOptionSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#ffffff',
  },
  dropdownOptionText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12, // Slightly smaller text
    fontWeight: '500',
  },
  dropdownOptionTextSelected: {
    color: '#ffffff',
  },
  singlePostButton: {
    backgroundColor: '#ffffff',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  singlePostButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
};