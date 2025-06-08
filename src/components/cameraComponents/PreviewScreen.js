import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { ArrowLeft, Calendar, Globe, Users } from 'lucide-react-native';
import { Image as ImageIcon } from 'lucide-react-native';
import { styles } from './CameraStyles';

export const PreviewScreen = ({
  capturedImage,
  postMode,
  setPostMode,
  audienceMode,
  setAudienceMode,
  onRetake,
  onPost,
}) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.previewHeader}>
        <TouchableOpacity onPress={onRetake}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.previewTitle}>Preview</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Preview Image */}
      <View style={styles.previewContainer}>
        <View style={styles.previewImageContainer}>
          <Image 
            source={{ uri: capturedImage }}
            style={styles.previewImage}
            resizeMode="cover"
          />
        </View>
      </View>
      
      {/* Post Controls */}
      <View style={styles.postControls}>
        {/* Post Type Toggle */}
        <View style={styles.controlSection}>
          <Text style={styles.controlLabel}>Post Type</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              onPress={() => setPostMode('post')}
              style={[
                styles.toggleButton,
                postMode === 'post' ? styles.toggleButtonActive : styles.toggleButtonInactive
              ]}
            >
              <ImageIcon size={16} color={postMode === 'post' ? '#000000' : '#9ca3af'} />
              <Text style={[
                styles.toggleButtonText,
                postMode === 'post' ? styles.toggleButtonTextActive : styles.toggleButtonTextInactive
              ]}>
                Post
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setPostMode('dailies')}
              style={[
                styles.toggleButton,
                postMode === 'dailies' ? styles.toggleButtonActive : styles.toggleButtonInactive
              ]}
            >
              <Calendar size={16} color={postMode === 'dailies' ? '#000000' : '#9ca3af'} />
              <Text style={[
                styles.toggleButtonText,
                postMode === 'dailies' ? styles.toggleButtonTextActive : styles.toggleButtonTextInactive
              ]}>
                Dailies
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Audience Toggle (only show for dailies) */}
        {postMode === 'dailies' && (
          <View style={styles.controlSection}>
            <Text style={styles.controlLabel}>Audience</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                onPress={() => setAudienceMode('public')}
                style={[
                  styles.toggleButton,
                  audienceMode === 'public' ? styles.toggleButtonActive : styles.toggleButtonInactive
                ]}
              >
                <Globe size={16} color={audienceMode === 'public' ? '#000000' : '#9ca3af'} />
                <Text style={[
                  styles.toggleButtonText,
                  audienceMode === 'public' ? styles.toggleButtonTextActive : styles.toggleButtonTextInactive
                ]}>
                  Public
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setAudienceMode('followers')}
                style={[
                  styles.toggleButton,
                  audienceMode === 'followers' ? styles.toggleButtonActive : styles.toggleButtonInactive
                ]}
              >
                <Users size={16} color={audienceMode === 'followers' ? '#000000' : '#9ca3af'} />
                <Text style={[
                  styles.toggleButtonText,
                  audienceMode === 'followers' ? styles.toggleButtonTextActive : styles.toggleButtonTextInactive
                ]}>
                  Followers
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Share Button */}
        <TouchableOpacity 
          onPress={onPost}
          style={styles.shareButton}
        >
          <Text style={styles.shareButtonText}>
            {postMode === 'post' ? 'Share Post' : `Share to ${audienceMode === 'public' ? 'Public' : 'Followers'} Dailies`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};