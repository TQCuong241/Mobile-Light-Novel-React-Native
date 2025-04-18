import { getImageUrl } from '@/services/dataAppwrite';
import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';

type Props = {
    avatarSource: string,
    frameSource: string,
    size: number,
    avatarSizeRatio: number;
    style?: ViewStyle;
}

const BorderAvatar = ({avatarSource, frameSource, size, avatarSizeRatio, style} : Props) => {
  const avatarSize = size * avatarSizeRatio;
  const frameSize = size;

  return (
    <View style={[styles.container, { width: frameSize, height: frameSize }, style]}>
      {/* Avatar ở dưới */}
      <Image
        source={{ uri : getImageUrl(avatarSource)}}
        style={{
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
          position: 'absolute',
          top: (frameSize - avatarSize) / 2,
          left: (frameSize - avatarSize) / 2,
        }}
        resizeMode="cover"
      />
      
      {/* Frame ở trên (nên dùng PNG có trong suốt) */}
      <Image
        source={{ uri : getImageUrl(frameSource)}}
        style={{
          width: frameSize,
          height: frameSize,
          position: 'absolute',
        }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BorderAvatar;