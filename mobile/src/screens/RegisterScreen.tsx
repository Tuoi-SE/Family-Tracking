import React from 'react';
import { View, Text } from 'react-native';
import { Button, TextInput as PaperInput } from 'react-native-paper';
import { AuthContext } from '../AuthContext';

export default function RegisterScreen() {
  const { register } = React.useContext(AuthContext);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [role, setRole] = React.useState<'admin' | 'user'>('user');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  return (
    <View className="flex-1 justify-center p-5 bg-white">
      <Text className="text-2xl font-bold mb-4">Register</Text>
      {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
      <PaperInput mode="outlined" value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" style={{ marginBottom: 12 }} />
      <PaperInput mode="outlined" value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry style={{ marginBottom: 12 }} />
      <PaperInput mode="outlined" value={role} onChangeText={(r) => setRole(r === 'admin' ? 'admin' : 'user')} placeholder="Role (admin/user)" style={{ marginBottom: 12 }} />
      <Button mode="contained" onPress={async () => {
        try {
          setLoading(true);
          await register(email, password, role);
        } catch (e: any) {
          setError(e.message);
        } finally {
          setLoading(false);
        }
      }} loading={loading}>Create account</Button>
    </View>
  );
}


