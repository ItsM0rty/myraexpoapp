import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';

export default function NavIcon({ icon, onPress, active }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.icon, active && styles.active]}>
      {icon}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  icon: {
    padding: 10,
  },
  active: {
    opacity: 1,
  },
});
