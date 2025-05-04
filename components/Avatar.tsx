import React from 'react';
import { Image, StyleSheet, View, ImageSourcePropType } from 'react-native';

interface AvatarProps {
  source?: string | ImageSourcePropType;
  size?: number;
  style?: any;
}

const Avatar: React.FC<AvatarProps> = ({ source, size = 40, style }) => {
  // Default fallback image
  const fallbackImage = 'https://randomuser.me/api/portraits/lego/1.jpg';
  
  // Process the source to ensure it's in the right format
  let imageSource: ImageSourcePropType;
  if (!source) {
    imageSource = { uri: fallbackImage };
  } else if (typeof source === 'string') {
    imageSource = { uri: source };
  } else {
    imageSource = source;
  }

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }, style]}>
      <Image
        source={imageSource}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#EFEFEF',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default Avatar; 