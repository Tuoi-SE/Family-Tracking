import React from 'react';
import { View, Text, Image, StatusBar } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

// A simple component for the logo and app name
const AppHeader = () => (
  <View className="items-center mb-12">
    <Image 
      source={require('../assets/logo.png')} // Make sure you have a logo.png in assets
      className="mb-4 w-24 h-24 rounded-3xl"
      resizeMode="contain"
    />
    <Text className="text-4xl font-bold text-gray-800">Family GPS</Text>
    <Text className="mt-2 text-lg text-gray-500">An toàn cho người thân, an tâm cho bạn</Text>
  </View>
);

export default function AuthScreen() {
  const navigation = useNavigation();

  return (
    <View className="flex-1 justify-center items-center p-8 bg-gray-50">
      <StatusBar barStyle="dark-content" />
      
      <AppHeader />

      <View className="w-full">
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('Login')}
          className="py-2 mb-4 bg-blue-600"
          labelStyle={{ fontSize: 18, fontWeight: 'bold' }}
        >
          Đăng nhập
        </Button>
        <Button 
          mode="outlined" 
          onPress={() => navigation.navigate('Register')}
          className="py-2 border-blue-600"
          textColor="#2563eb" // Tailwind: text-blue-600
          labelStyle={{ fontSize: 18, fontWeight: 'bold' }}
        >
          Đăng ký
        </Button>
      </View>

      <View className="absolute bottom-8 items-center">
        <Text className="text-center text-gray-400">
          Bằng việc tiếp tục, bạn đồng ý với Điều khoản dịch vụ & Chính sách bảo mật của chúng tôi.
        </Text>
      </View>
    </View>
  );
}


