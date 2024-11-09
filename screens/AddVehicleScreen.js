import React, { useState } from 'react';
import { View } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddVehicleScreen({ navigation }) {
  const [model, setModel] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const handleSubmit = async () => {
    try {
      const newVehicle = {
        id: Date.now().toString(),
        model,
        registrationNumber,
        customerName,
        customerPhone,
        partsUsed: [],
        isCompleted: false,
        dateAdded: new Date().toISOString()
      };

      const existingVehicles = JSON.parse(await AsyncStorage.getItem('vehicleData')) || [];
      await AsyncStorage.setItem('vehicleData', JSON.stringify([...existingVehicles, newVehicle]));
      
      navigation.goBack();
    } catch (error) {
      console.error('Error adding vehicle:', error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        label="Vehicle Model"
        value={model}
        onChangeText={setModel}
        style={{ marginBottom: 10 }}
      />
      <TextInput
        label="Registration Number"
        value={registrationNumber}
        onChangeText={setRegistrationNumber}
        style={{ marginBottom: 10 }}
      />
      <TextInput
        label="Customer Name"
        value={customerName}
        onChangeText={setCustomerName}
        style={{ marginBottom: 10 }}
      />
      <TextInput
        label="Customer Phone"
        value={customerPhone}
        onChangeText={setCustomerPhone}
        keyboardType="phone-pad"
        style={{ marginBottom: 20 }}
      />
      <Button mode="contained" onPress={handleSubmit}>
        Add Vehicle
      </Button>
    </View>
  );
}