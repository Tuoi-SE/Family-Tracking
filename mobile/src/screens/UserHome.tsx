import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, StatusBar, StyleSheet, Text, FlatList, ActivityIndicator } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { Appbar, Button, PaperProvider, Portal, Modal } from 'react-native-paper';
import { io, Socket } from 'socket.io-client';
import { AuthContext } from '../AuthContext';
import { api } from '../api';
import { User } from '../types/user';

// Derive socket base URL from API URL by stripping trailing "/api" if present
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';
const SOCKET_URL = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL;

// A custom hook for managing socket connection
// A custom hook for managing socket connection
const useSocket = (trackingUserIds: string[] | undefined) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!trackingUserIds || trackingUserIds.length === 0) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket'], // Important for React Native
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to socket server');
      // Join room for each person the user is tracking
      // This part needs a list of trackable users
      // For now, let's assume we are tracking one user
      trackingUserIds.forEach(id => {
        socket.emit('join_room', id);
        console.log(`Joined room for user ${id}`);
      }); 
    });

    return () => {
      socket.disconnect();
    };
  }, [trackingUserIds]);

  return socketRef.current;
};

export default function UserHomeScreen() {
  const { user, logout, refreshUser } = useContext(AuthContext);
  const socket = useSocket(user?.tracking);
  const mapRef = useRef<MapView>(null);

  const [trackedUsers, setTrackedUsers] = useState<Record<string, { latitude: number; longitude: number }>>({});
  const [isModalVisible, setModalVisible] = useState(false);
  const [trackableUsers, setTrackableUsers] = useState<User[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.on('new_location', (data: { userId: string; latitude: number; longitude: number }) => {
      setTrackedUsers(prev => ({
        ...prev,
        [data.userId]: { latitude: data.latitude, longitude: data.longitude },
      }));
    });

    // TODO: Fetch initial locations of tracked users via API

    return () => {
      socket.off('new_location');
    };
  }, [socket]);

  const showModal = async () => {
    setModalLoading(true);
    try {
      const users = await api.getTrackableUsers();
      setTrackableUsers(users);
    } catch (error) {
      console.error('Failed to fetch trackable users', error);
    }
    setModalLoading(false);
    setModalVisible(true);
  };
  const hideModal = () => setModalVisible(false);

  return (
    <PaperProvider>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Appbar.Header>
          <Appbar.Content title="Bản đồ theo dõi" />
          <Appbar.Action icon="account-multiple" onPress={showModal} />
          <Appbar.Action icon="logout" onPress={logout} />
        </Appbar.Header>

        <MapView
          ref={mapRef}
                    style={styles.map}
          initialRegion={{
            latitude: 10.762622,
            longitude: 106.660172,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <UrlTile
            urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
          />
          {Object.entries(trackedUsers).map(([userId, coords]) => (
            <Marker key={userId} coordinate={coords} title={`User ${userId}`} />
          ))}
        </MapView>

        {/* Floating logout button for clearer visibility */}
        <Button
          mode="contained"
          onPress={logout}
          style={styles.logoutButton}
        >
          Đăng xuất
        </Button>

        <Portal>
          <Modal visible={isModalVisible} onDismiss={hideModal} contentContainerStyle={styles.modalContainer}>
            <Text className="text-xl font-bold mb-4">Danh sách theo dõi</Text>
            {modalLoading ? (
              <ActivityIndicator animating={true} />
            ) : (
              <FlatList
                data={trackableUsers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const isTracking = user?.tracking?.includes(item.id);
                  return (
                    <View className="flex-row items-center justify-between p-2 border-b border-gray-200">
                      <Text>{item.fullName} (@{item.username})</Text>
                      <Button 
                        mode={isTracking ? 'contained-tonal' : 'contained'}
                        onPress={async () => {
                          await api.updateTrackingList({ 
                            trackableUserId: item.id, 
                            action: isTracking ? 'remove' : 'add' 
                          });
                          await refreshUser(); // Refresh user state to update UI and socket rooms
                        }}
                      >
                        {isTracking ? 'Bỏ theo dõi' : 'Theo dõi'}
                      </Button>
                    </View>
                  );
                }}
              />
            )}
            <Button onPress={hideModal} className="mt-4">Đóng</Button>
          </Modal>
        </Portal>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    top: 60, // Adjust based on Appbar height
  },
  logoutButton: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    zIndex: 10,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
});

