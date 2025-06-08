import { useAnimatedStyle, withTiming, withDelay, runOnJS, Easing } from 'react-native-reanimated';

export const useAnimations = ({
  flashOpacity,
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

  const settingsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: settingsOpacity.value,
    transform: [{ scale: settingsScale.value }],
  }));

  const dropdownAnimatedStyle = useAnimatedStyle(() => ({
    opacity: dropdownOpacity.value,
    transform: [{ scale: dropdownScale.value }],
  }));

  // Show zoom indicator temporarily (kept for compatibility but not used since zoom is always visible)
  const showZoomIndicator = () => {
    // No-op since zoom indicator is always visible
  };

  // Hide zoom indicator initially (kept for compatibility but not used)
  const hideZoomIndicator = () => {
    // No-op since zoom indicator is always visible
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
    settingsAnimatedStyle,
    dropdownAnimatedStyle,
    showZoomIndicator,
    hideZoomIndicator,
    toggleSettings,
    toggleDurationDropdown,
    selectDuration,
  };
};