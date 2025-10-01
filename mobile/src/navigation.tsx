import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthContext } from './AuthContext';
import AuthScreen from './screens/AuthScreen';
import AdminHome from './screens/AdminHome';
import UserHome from './screens/UserHome';

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthScreen} />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) {
    return (
      <View style={styles.container}><Text>Loading...</Text></View>
    );
  }
  if (!user) return <AuthStack />;
  return (
    <Stack.Navigator>
      {user.role === 'admin' ? (
        <Stack.Screen name="AdminHome" component={AdminHome} />
      ) : (
        <Stack.Screen name="UserHome" component={UserHome} />
      )}
    </Stack.Navigator>
  );
}

export default function RootNavigation() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 }
});


