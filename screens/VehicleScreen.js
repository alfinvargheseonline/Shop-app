import React, { useState, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import { List, FAB } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function VehicleScreen({ navigation }) {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const data = await AsyncStorage.getItem('vehicleData');
      if (data) setVehicles(JSON.parse(data));
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={vehicles}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <List.Item
            title={`${item.model} - ${item.registrationNumber}`}
            description={item.isCompleted ? 'Completed' : 'In Progress'}
            onPress={() => navigation.navigate('VehicleDetails', { vehicleId: item.id })}
          />
        )}
      />
      
      <FAB
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
        }}
        icon="plus"
        onPress={() => navigation.navigate('AddVehicle')}
      />
    </View>
  );
}