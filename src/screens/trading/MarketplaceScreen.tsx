import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MarketplaceScreenProps {
  // Add navigation props when needed
}

const MarketplaceScreen: React.FC<MarketplaceScreenProps> = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Marketplace</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default MarketplaceScreen;
