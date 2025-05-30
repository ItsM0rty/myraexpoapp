import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

export const Button = ({ 
  children, 
  onPress, 
  variant = 'default', 
  size = 'default',
  disabled = false,
  style,
  textStyle,
  ...props 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return {
          backgroundColor: disabled ? '#fca5a5' : '#ef4444',
          borderColor: disabled ? '#fca5a5' : '#ef4444',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: '#d1d5db',
          borderWidth: 1,
        };
      case 'secondary':
        return {
          backgroundColor: disabled ? '#f3f4f6' : '#f9fafb',
          borderColor: disabled ? '#f3f4f6' : '#f9fafb',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
        };
      case 'link':
        return {
          backgroundColor: 'transparent',
        };
      default:
        return {
          backgroundColor: disabled ? '#9ca3af' : '#3b82f6',
          borderColor: disabled ? '#9ca3af' : '#3b82f6',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 4,
        };
      case 'lg':
        return {
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 8,
        };
      case 'icon':
        return {
          width: 40,
          height: 40,
          borderRadius: 6,
          justifyContent: 'center',
          alignItems: 'center',
        };
      default:
        return {
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 6,
        };
    }
  };

  const getTextColor = () => {
    if (variant === 'outline' || variant === 'ghost' || variant === 'link') {
      return disabled ? '#9ca3af' : '#374151';
    }
    if (variant === 'secondary') {
      return disabled ? '#9ca3af' : '#374151';
    }
    return '#ffffff';
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 14;
      case 'lg':
        return 18;
      default:
        return 16;
    }
  };

  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={[
        {
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
        },
        getVariantStyles(),
        getSizeStyles(),
        style,
      ]}
      activeOpacity={0.7}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text
          style={[
            {
              color: getTextColor(),
              fontSize: getTextSize(),
              fontWeight: '500',
              textAlign: 'center',
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};
