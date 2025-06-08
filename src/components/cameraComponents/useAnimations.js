import { useAnimatedStyle, withTiming, withDelay, runOnJS, Easing } from 'react-native-reanimated';

export const useAnimations = ({
  flashOpacity,
  zoomOpacity,
  settingsOpacity,
  settingsScale,
  dropdownOpacity,
  dropdownScale,
  showSettings,
  setShowSettings,
  showDurationDropdown,
  setShowDurationDropdown,
  setDailiesDuration,
}) => {
  // Animation styles
  const flashAnimatedStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const zoomAnimatedStyle = useAnimatedStyle(() => ({
    opacity: zoomOpacity.value,
  }));

  const settingsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: settingsOpacity.value,
    transform: [{ scale: settingsScale.value }],
  }));

  const dropdownAnimatedStyle = useAnimatedStyle(() => ({
    opacity: dropdownOpacity.value,
    transform: [{ scale: dropdownScale.value }],
  }));

  // Show zoom indicator temporarily
  const showZoomIndicator = () => {
    zoomOpacity.value = withTiming(1, { duration: 200 }, () => {
      zoomOpacity.value = withDelay(2000, withTiming(0, { duration: 500 }));
    });
  };

  // Hide zoom indicator initially
  const hideZoomIndicator = () => {
    zoomOpacity.value = withDelay(2000, withTiming(0, { duration: 500 }));
  };

  // Toggle settings dropdown
  const toggleSettings = () => {
    if (showSettings) {
      // Hide settings
      settingsOpacity.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.quad) });
      settingsScale.value = withTiming(0.8, { duration: 200, easing: Easing.out(Easing.quad) }, () => {
        runOnJS(setShowSettings)(false);
      });
    } else {
      // Show settings
      runOnJS(setShowSettings)(true);
      settingsOpacity.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) });
      settingsScale.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) });
    }
  };

  // Toggle duration dropdown
  const toggleDurationDropdown = () => {
    if (showDurationDropdown) {
      // Hide dropdown
      dropdownOpacity.value = withTiming(0, { duration: 150 });
      dropdownScale.value = withTiming(0.8, { duration: 150 }, () => {
        runOnJS(setShowDurationDropdown)(false);
      });
    } else {
      // Show dropdown
      runOnJS(setShowDurationDropdown)(true);
      dropdownOpacity.value = withTiming(1, { duration: 150 });
      dropdownScale.value = withTiming(1, { duration: 150 });
    }
  };

  // Select duration
  const selectDuration = (duration) => {
    runOnJS(setDailiesDuration)(duration);
    toggleDurationDropdown();
  };

  return {
    flashAnimatedStyle,
    zoomAnimatedStyle,
    settingsAnimatedStyle,
    dropdownAnimatedStyle,
    showZoomIndicator,
    hideZoomIndicator,
    toggleSettings,
    toggleDurationDropdown,
    selectDuration,
  };
};