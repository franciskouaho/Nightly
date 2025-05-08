import React, { useState } from 'react';
import { Image, StyleSheet, View, ImageSourcePropType, Text } from 'react-native';

interface AvatarProps {
  source?: string | ImageSourcePropType;
  size?: number;
  style?: any;
  username?: string;
}

const Avatar: React.FC<AvatarProps> = ({ source, size = 40, style, username }) => {
  const [hasError, setHasError] = useState(false);
  
  // Process the source to ensure it's in the right format
  let imageSource: ImageSourcePropType | null = null;
  if (source && !hasError) {
    if (typeof source === 'string') {
      imageSource = { uri: source };
    } else {
      imageSource = source;
    }
  }

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }, style]}>
      {imageSource ? (
        <Image
          source={imageSource}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
          resizeMode="cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <View style={[styles.fallbackContainer, { width: size, height: size, borderRadius: size / 2 }]}>
          <Text style={[styles.fallbackText, { fontSize: size * 0.4 }]}>
            {username ? username.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
      )}
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
  fallbackContainer: {
    backgroundColor: '#694ED6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default Avatar; 