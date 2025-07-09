import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type SwipeScreenProps = NativeStackScreenProps<any, 'Swipe'>;

const SwipeScreen: React.FC<SwipeScreenProps> = ({ navigation, route }) => {
  return (
    <View style={styles.container}>
      {/* Swipe functionality will be implemented here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default SwipeScreen;
