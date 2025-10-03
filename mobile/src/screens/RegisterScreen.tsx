import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { Button, TextInput, HelperText, SegmentedButtons } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../AuthContext';
import { UserRole } from '../types/user';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { register } = useContext(AuthContext);
  
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!username || !password || !fullName) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(username, password, fullName, role);
    } catch (e: any) {
      setError(e.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <View className="flex-1 justify-center p-8 bg-gray-50">
        <StatusBar barStyle="dark-content" />
        <View className="mb-10">
          <Text className="text-4xl font-bold text-gray-800">Tạo tài khoản</Text>
          <Text className="text-lg text-gray-500 mt-2">Bắt đầu theo dõi người thân của bạn</Text>
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
          label="Họ và tên"
          value={fullName}
          onChangeText={setFullName}
          className="mb-4"
          left={<TextInput.Icon icon="account-circle" />}
        />
        <TextInput
          mode="outlined"
          label="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="mb-4"
          left={<TextInput.Icon icon="lock" />}
        />

        <View className="mb-4">
          <Text className="text-gray-600 mb-2 ml-1">Bạn là:</Text>
          <SegmentedButtons
            value={role}
            onValueChange={(value) => setRole(value as UserRole)}
            buttons={[
              { value: 'user', label: 'Người theo dõi' },
              { value: 'trackable', label: 'Người được theo dõi' },
            ]}
          />
        </View>

        <HelperText type="error" visible={!!error} className="mb-4">
          {error}
        </HelperText>

        <Button 
          mode="contained" 
          onPress={handleRegister} 
          loading={loading}
          disabled={loading}
          className="py-2 bg-blue-600"
          labelStyle={{ fontSize: 18, fontWeight: 'bold' }}
        >
          Đăng ký
        </Button>

        <View className="flex-row justify-center mt-8">
          <Text className="text-gray-500">Đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="font-bold text-blue-600">Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}


