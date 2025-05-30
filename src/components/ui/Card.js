import React from 'react';
import { View } from 'react-native';

export const Card = ({ children, style, ...props }) => {
  return (
    <View
      style={[
        {
          backgroundColor: '#fff',
          borderRadius: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3.84,
          elevation: 5,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

export const CardContent = ({ children, style, ...props }) => {
  return (
    <View
      style={[
        {
          padding: 16,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};
