import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button, Portal, Modal, TextInput, List, Searchbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function VehicleDetailsScreen({ route, navigation }) {
  const { vehicleId } = route.params;
  const [vehicle, setVehicle] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  const [quantity, setQuantity] = useState('1');
  const [availableParts, setAvailableParts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const vehicleData = JSON.parse(await AsyncStorage.getItem('vehicleData'));
      const currentVehicle = vehicleData.find(v => v.id === vehicleId);
      setVehicle(currentVehicle);
      const stockData = JSON.parse(await AsyncStorage.getItem('stockData')) || [];
      setAvailableParts(stockData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const addPart = async () => {
    if (!selectedPart) {
      alert('Please select a part first');
      return;
    }

    if (parseInt(quantity) <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    if (parseInt(quantity) > selectedPart.quantity) {
      alert('Not enough stock available');
      return;
    }

    try {
      const vehicleData = JSON.parse(await AsyncStorage.getItem('vehicleData'));
      const stockData = JSON.parse(await AsyncStorage.getItem('stockData'));

      // Update vehicle data
      const updatedVehicleData = vehicleData.map(v => {
        if (v.id === vehicleId) {
          return {
            ...v,
            partsUsed: [...v.partsUsed, {
              id: selectedPart.id,
              name: selectedPart.name,
              quantity: parseInt(quantity),
              price: selectedPart.price
            }]
          };
        }
        return v;
      });

      // Update stock data
      const updatedStockData = stockData.map(item => {
        if (item.id === selectedPart.id) {
          return {
            ...item,
            quantity: item.quantity - parseInt(quantity)
          };
        }
        return item;
      });

      await AsyncStorage.setItem('vehicleData', JSON.stringify(updatedVehicleData));
      await AsyncStorage.setItem('stockData', JSON.stringify(updatedStockData));
      setModalVisible(false);
      setSelectedPart(null);
      setQuantity('1');
      setSearchQuery('');
      loadData();
    } catch (error) {
      console.error('Error adding part:', error);
    }
  };

  const completeRepair = async () => {
    try {
      const vehicleData = JSON.parse(await AsyncStorage.getItem('vehicleData'));
      const updatedVehicleData = vehicleData.map(v => {
        if (v.id === vehicleId) {
          return { ...v, isCompleted: true };
        }
        return v;
      });
      await AsyncStorage.setItem('vehicleData', JSON.stringify(updatedVehicleData));
      navigation.goBack();
    } catch (error) {
      console.error('Error completing repair:', error);
    }
  };

  const deletePart = async (partId) => {
    try {
      const vehicleData = JSON.parse(await AsyncStorage.getItem('vehicleData'));
      const stockData = JSON.parse(await AsyncStorage.getItem('stockData'));

      // Update vehicle data by removing the part
      const updatedVehicleData = vehicleData.map(v => {
        if (v.id === vehicleId) {
          const filteredPartsUsed = v.partsUsed.filter(part => part.id !== partId);
          return { ...v, partsUsed: filteredPartsUsed };
        }
        return v;
      });

      // Update stock data by increasing the stock of the deleted part
      const partToDelete = vehicle.partsUsed.find(part => part.id === partId);
      const updatedStockData = stockData.map(item => {
        if (item.id === partId) {
          return { ...item, quantity: item.quantity + partToDelete.quantity };
        }
        return item;
      });

      await AsyncStorage.setItem('vehicleData', JSON.stringify(updatedVehicleData));
      await AsyncStorage.setItem('stockData', JSON.stringify(updatedStockData));

      setVehicle(updatedVehicleData.find(v => v.id === vehicleId)); // Update local vehicle state
    } catch (error) {
      console.error('Error deleting part:', error);
    }
  };

  const deleteVehicle = async () => {
    try {
      const vehicleData = JSON.parse(await AsyncStorage.getItem('vehicleData'));

      // Remove the vehicle from the data
      const updatedVehicleData = vehicleData.filter(v => v.id !== vehicleId);

      await AsyncStorage.setItem('vehicleData', JSON.stringify(updatedVehicleData));
      navigation.goBack();  // Navigate back to the previous screen after deletion
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    }
  };

  const filteredParts = availableParts.filter(part =>
    part.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    part.quantity > 0
  );

  if (!vehicle) return null;

  const totalCost = vehicle.partsUsed.reduce((sum, part) => 
    sum + (part.price * part.quantity), 0
  );

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Vehicle Details</Title>
          <Paragraph>Make: {vehicle.make}</Paragraph>
          <Paragraph>Model: {vehicle.model}</Paragraph>
          <Paragraph>Year: {vehicle.year}</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Parts Used</Title>
          {vehicle.partsUsed.map((part, index) => (
            <View key={index} style={styles.partItem}>
              <Paragraph>{part.name}</Paragraph>
              <Paragraph>Quantity: {part.quantity}</Paragraph>
              <Paragraph>Price: ₹{part.price * part.quantity}</Paragraph>
              <Button
                mode="outlined"
                onPress={() => deletePart(part.id)}
                style={styles.deleteButton}
              >
                Delete
              </Button>
            </View>
          ))}
          <Title style={styles.totalCost}>Total Cost: ₹{totalCost}</Title>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={() => setModalVisible(true)}
        style={styles.button}
        disabled={vehicle.isCompleted}
      >
        Add Part
      </Button>

      <Button
        mode="contained"
        onPress={completeRepair}
        style={[styles.button, styles.completeButton]}
        disabled={vehicle.isCompleted}
      >
        {vehicle.isCompleted ? 'Repair Completed' : 'Complete Repair'}
      </Button>

      <Button
        mode="contained"
        onPress={deleteVehicle}
        style={[styles.button, styles.deleteVehicleButton]}
      >
        Delete Vehicle
      </Button>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => {
            setModalVisible(false);
            setSelectedPart(null);
            setQuantity('1');
            setSearchQuery('');
          }}
          contentContainerStyle={styles.modal}
        >
          <Title>Add Part</Title>
          
          <Searchbar
            placeholder="Search parts"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />

          <ScrollView style={styles.partsList}>
            <List.Section>
              {filteredParts.map((part) => (
                <List.Item
                  key={part.id}
                  title={part.name}
                  description={`Stock: ${part.quantity} | Price: ₹${part.price}`}
                  onPress={() => setSelectedPart(part)}
                  style={[styles.partListItem, selectedPart?.id === part.id && styles.selectedPart]}
                  left={props => <List.Icon {...props} icon="package" />}
                />
              ))}
            </List.Section>
          </ScrollView>

          {selectedPart && (
            <TextInput
              label="Quantity"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />
          )}

          <Button 
            mode="contained" 
            onPress={addPart} 
            style={styles.button}
            disabled={!selectedPart}
          >
            Add Part
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => {
              setModalVisible(false);
              setSelectedPart(null);
              setQuantity('1');
              setSearchQuery('');
            }}
            style={styles.button}
          >
            Cancel
          </Button>
        </Modal>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  partItem: {
    marginVertical: 8,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  totalCost: {
    marginTop: 16,
    fontWeight: 'bold',
  },
  button: {
    marginVertical: 8,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  input: {
    marginBottom: 16,
  },
  searchBar: {
    marginBottom: 10,
  },
  partsList: {
    maxHeight: 300,
    marginBottom: 10,
  },
  partListItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedPart: {
    backgroundColor: '#e3f2fd',
  },
  deleteButton: {
    marginTop: 8,
    backgroundColor: '#FF6347',
  },
  deleteVehicleButton: {
    backgroundColor: '#FF6347',
  },
});
