import React from 'react';
import { View, Text } from 'react-native';
import { Button } from 'react-native-paper';
import { AuthContext } from '../AuthContext';

export default function UserHome() {
  const { user, logout } = React.useContext(AuthContext);
  return (
    <View className="flex-1 justify-center p-5 bg-white">
      <Text className="text-2xl font-bold mb-2">Welcome</Text>
      <Text>Signed in as {user?.email}</Text>
      <Button mode="outlined" onPress={logout}>Logout</Button>
    </View>
  );
}


