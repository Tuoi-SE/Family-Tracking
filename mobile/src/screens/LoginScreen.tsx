import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { Button, TextInput, HelperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../AuthContext';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Vui lòng nhập tên đăng nhập và mật khẩu.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(username, password);
    } catch (e: any) {
      setError(e.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center p-8 bg-gray-50">
      <StatusBar barStyle="dark-content" />
      <View className="mb-10">
        <Text className="text-4xl font-bold text-gray-800">Chào mừng trở lại!</Text>
        <Text className="text-lg text-gray-500 mt-2">Đăng nhập để tiếp tục</Text>
      </View>

      <TextInput
        mode="outlined"
        label="Tên đăng nhập"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        className="mb-4"
        left={<TextInput.Icon icon="account" />}
      />
      <TextInput
        mode="outlined"
        label="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="mb-2"
        left={<TextInput.Icon icon="lock" />}
      />

      <HelperText type="error" visible={!!error} className="mb-4">
        {error}
      </HelperText>

      <Button 
        mode="contained" 
        onPress={handleLogin} 
        loading={loading}
        disabled={loading}
        className="py-2 bg-blue-600"
        labelStyle={{ fontSize: 18, fontWeight: 'bold' }}
      >
        Đăng nhập
      </Button>

      <View className="flex-row justify-center mt-8">
        <Text className="text-gray-500">Chưa có tài khoản? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text className="font-bold text-blue-600">Đăng ký ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


