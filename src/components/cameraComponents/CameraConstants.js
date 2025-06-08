import { Dimensions } from 'react-native';

export const CAMERA_CONSTANTS = {
  ASPECT_RATIOS: {
    PORTRAIT: 6/8,
    SQUARE: 1,
    LANDSCAPE: 5/6,
  },
  
  ZOOM: {
    MIN: 0,
    MAX: 1,
    SCALE_MIN: 1,
    SCALE_MAX: 5,
  },
  
  FLASH_MODES: {
    OFF: 'off',
    ON: 'on',
    AUTO: 'auto',
  },
  
  POST_MODES: {
    POST: 'post',
    DAILIES: 'dailies',
  },
  
  AUDIENCE_MODES: {
    PUBLIC: 'public',
    FOLLOWERS: 'followers',
  },
  
  DURATION_OPTIONS: {
    TWELVE_HOURS: '12h',
    TWENTY_FOUR_HOURS: '24h',
  },
  
  CAMERA_FACING: {
    BACK: 'back',
    FRONT: 'front',
  },
  
  ANIMATION_DURATIONS: {
    FLASH: 250,
    ZOOM_FADE: 500,
    ZOOM_DELAY: 2000,
    SETTINGS: 200,
    DROPDOWN: 150,
    CAMERA_SWITCH: 200,
  },
  
  PHOTO_QUALITY: 0.8,
  
  TIMING: {
    ZOOM_INDICATOR_DELAY: 2000,
    ZOOM_INDICATOR_FADE: 500,
    FLASH_SHOW: 50,
    FLASH_HIDE: 200,
  }
};

export const SCREEN_DIMENSIONS = Dimensions.get('window');

export const CAMERA_PERMISSIONS = {
  GRANTED: 'granted',
  DENIED: 'denied',
  UNDETERMINED: 'undetermined',
};