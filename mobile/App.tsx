import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AuthProvider} from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import {startSyncListener} from './src/db/sync/SyncManager';

function App() {
  useEffect(() => {
    startSyncListener();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar barStyle="light-content" />
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;