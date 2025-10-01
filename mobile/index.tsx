import React from 'react';
import { registerRootComponent } from 'expo';
import { AuthProvider } from './src/AuthContext';
import RootNavigation from './src/navigation';

function App() {
  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}

registerRootComponent(App);

export default App;


