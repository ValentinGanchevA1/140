import React from 'react';
import { View, StyleSheet } from 'react-native';
import { User } from '../../types/index';

interface UserDotProps {
  user: User;
}

const UserDot: React.FC<UserDotProps> = ({ user }) => {
  return (
    <View style={styles.dot}>
      {/* Add your user dot visualization here */}
    </View>
  );
};

const styles = StyleSheet.create({
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

export default UserDot;
