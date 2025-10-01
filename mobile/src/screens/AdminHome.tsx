import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { Button } from 'react-native-paper';
import { AuthContext } from '../AuthContext';
import { api } from '../api';

type User = { id: number; email: string; role: 'admin' | 'user' };

export default function AdminHome() {
  const { user, logout } = React.useContext(AuthContext);
  const [users, setUsers] = React.useState<User[]>([]);
  const [error, setError] = React.useState('');
  React.useEffect(() => {
    (async () => {
      try {
        const res = await api.listUsers();
        setUsers(res.users || []);
      } catch (e: any) {
        setError(e.message);
      }
    })();
  }, []);
  return (
    <View className="flex-1 p-5 bg-white">
      <Text className="text-2xl font-bold mb-2">Admin Dashboard</Text>
      <Text>Signed in as {user?.email}</Text>
      {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
      <FlatList data={users} keyExtractor={(u) => String(u.id)} renderItem={({ item }) => (
        <View style={{ paddingVertical: 8 }}>
          <Text>{item.email} - {item.role}</Text>
        </View>
      )} />
      <Button mode="outlined" onPress={logout}>Logout</Button>
    </View>
  );
}


