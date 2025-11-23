import React from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ArrowFillProps {
  fillProgress?: any;
  shootingStarTranslateY?: any;
  shootingStarOpacity?: any;
}

export const ArrowFill: React.FC<ArrowFillProps> = () => {
  return (
    <View style={{ position: 'relative', width: 56, height: 56, justifyContent: 'center', alignItems: 'center' }}>
      {/* Static Golden Growth Arrow */}
      <MaterialIcons name="trending-up" size={32} color="#D4AF37" />
    </View>
  );
};
