import React from 'react';
import { View, Text, Image } from 'react-native';
import { Button, TextInput as PaperInput, SegmentedButtons, Card } from 'react-native-paper';
import { AuthContext } from '../AuthContext';

export default function AuthScreen() {
  const { login, register } = React.useContext(AuthContext);
  const [mode, setMode] = React.useState<'login' | 'register'>('login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [role, setRole] = React.useState<'admin' | 'user'>('user');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  async function onSubmit() {
    try {
      setLoading(true);
      setError('');
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, role);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 justify-center p-6 bg-white">
      <View className="items-center mb-6">
        <Image source={{ uri: 'https://dummyimage.com/120x120/2563eb/ffffff&text=FT' }} style={{ width: 96, height: 96, borderRadius: 20, marginBottom: 12 }} />
        <Text className="text-3xl font-extrabold text-gray-900">Family Tracking</Text>
        <Text className="text-gray-500 mt-1">Theo dõi và bảo vệ gia đình bạn</Text>
      </View>

      <Card mode="elevated" style={{ borderRadius: 16 }}>
        <Card.Content>
          <SegmentedButtons
            value={mode}
            onValueChange={(v) => setMode((v as 'login' | 'register') || 'login')}
            buttons={[
              { value: 'login', label: 'Đăng nhập' },
              { value: 'register', label: 'Đăng ký' },
            ]}
            style={{ marginBottom: 12 }}
          />

          {error ? <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text> : null}

          <PaperInput mode="outlined" label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" style={{ marginBottom: 12 }} />
          <PaperInput mode="outlined" label="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry style={{ marginBottom: 12 }} />
          {mode === 'register' ? (
            <PaperInput mode="outlined" label="Vai trò (admin/user)" value={role} onChangeText={(r) => setRole(r === 'admin' ? 'admin' : 'user')} style={{ marginBottom: 12 }} />
          ) : null}

          <Button mode="contained" onPress={onSubmit} loading={loading}>
            {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
          </Button>
        </Card.Content>
      </Card>

      <View className="items-center mt-4">
        <Text className="text-gray-500">{mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}</Text>
        <Button onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Chuyển sang Đăng ký' : 'Chuyển sang Đăng nhập'}
        </Button>
      </View>
    </View>
  );
}


