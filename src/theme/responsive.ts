import { useEffect, useState } from 'react';
import {
  Dimensions,
  PixelRatio,
  Platform,
  ScaledSize,
} from 'react-native';
import {
  scale,
  verticalScale,
  moderateScale,
} from 'react-native-size-matters';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const wp = (percentage: number): number =>
  (SCREEN_WIDTH * percentage) / 100;

export const hp = (percentage: number): number =>
  (SCREEN_HEIGHT * percentage) / 100;

export const s = scale;
export const vs = verticalScale;
export const ms = moderateScale;

export const rf = (size: number): number => moderateScale(size, 0.3);

export const isTablet = (): boolean => {
  const pixelDensity = PixelRatio.get();
  const adjustedWidth = SCREEN_WIDTH * pixelDensity;
  const adjustedHeight = SCREEN_HEIGHT * pixelDensity;

  return Math.min(adjustedWidth, adjustedHeight) >= 600;
};

type DeviceInfo = {
  width: number;
  height: number;
  isTablet: boolean;
  isSmallPhone: boolean;
  isAndroid: boolean;
  isIOS: boolean;
};

export const deviceInfo: DeviceInfo = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isTablet: isTablet(),
  isSmallPhone: SCREEN_WIDTH < 375,
  isAndroid: Platform.OS === 'android',
  isIOS: Platform.OS === 'ios',
};

export const useResponsiveDimensions = (): ScaledSize => {
  const [dimensions, setDimensions] = useState<ScaledSize>(
    Dimensions.get('window'),
  );

  useEffect(() => {
    const onChange = ({
      window,
    }: {
      window: ScaledSize;
      screen: ScaledSize;
    }) => {
      setDimensions(window);
    };

    const subscription = Dimensions.addEventListener('change', onChange);

    return () => {
      subscription.remove();
    };
  }, []);

  return dimensions;
};
