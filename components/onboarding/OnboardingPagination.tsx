import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface OnboardingPaginationProps {
  data: any[];
  scrollX: Animated.Value;
  currentIndex: number;
}

export default function OnboardingPagination({
  data,
  scrollX,
  currentIndex,
}: OnboardingPaginationProps) {
  return (
    <View style={styles.container}>
      {data.map((_, index) => {
        const inputRange = [
          (index - 1) * 1,
          index * 1,
          (index + 1) * 1,
        ];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: dotWidth,
                opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginHorizontal: 4,
  },
});
