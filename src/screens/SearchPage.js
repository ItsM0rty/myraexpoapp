import React from 'react';
import { View, Text, TextInput, ScrollView, Image, Dimensions } from 'react-native';
import { Search } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const columnWidth = (width - 24) / 2; // 2 columns with padding

export default function SearchPage() {
  // Generate staggered heights for masonry effect
  const getItemHeight = (index) => {
    const heights = [200, 250, 180, 220, 190, 240, 170, 260, 210, 185];
    return heights[index % heights.length];
  };

  // Split items into two columns for masonry layout
  const leftColumn = [];
  const rightColumn = [];
  
  [...Array(15)].forEach((_, i) => {
    const item = (
      <View 
        key={i} 
        style={{
          width: columnWidth - 4,
          height: getItemHeight(i),
          backgroundColor: '#3f3f46', // zinc-700
          borderRadius: 12,
          overflow: 'hidden',
          marginBottom: 8,
        }}
      >
        <Image
          source={{ uri: `https://picsum.photos/300/375?random=${i}` }}
          style={{
            width: '100%',
            height: '100%',
          }}
          resizeMode="cover"
        />
      </View>
    );
    
    if (i % 2 === 0) {
      leftColumn.push(item);
    } else {
      rightColumn.push(item);
    }
  });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000' }}>
      <View style={{ padding: 16 }}>
        {/* Search Input */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#27272a', // zinc-800
          borderRadius: 16,
          marginBottom: 16,
          paddingHorizontal: 12,
          borderWidth: 1,
          borderColor: '#4b5563', // gray-600
        }}>
          <Search size={20} color="#9ca3af" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search users or posts"
            placeholderTextColor="#9ca3af"
            style={{
              flex: 1,
              paddingVertical: 12,
              color: '#fff',
              fontSize: 16,
            }}
          />
        </View>

        {/* Masonry Grid */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
          <View style={{ flex: 1, marginRight: 4 }}>
            {leftColumn}
          </View>
          <View style={{ flex: 1, marginLeft: 4 }}>
            {rightColumn}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}