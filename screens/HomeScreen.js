import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [activeVehicles, setActiveVehicles] = useState([]);
  const [totalPartsUsed, setTotalPartsUsed] = useState(0);
  const [amountGenerated, setAmountGenerated] = useState(0);
  const [currentStockItems, setCurrentStockItems] = useState([]);
  const [totalVehiclesRepaired, setTotalVehiclesRepaired] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const stockData = JSON.parse(await AsyncStorage.getItem('stockData')) || [];
      const vehicleData = JSON.parse(await AsyncStorage.getItem('vehicleData')) || [];
      
      setLowStockItems(stockData.filter(item => item.quantity < 5));
      setActiveVehicles(vehicleData.filter(vehicle => !vehicle.isCompleted));
      setCurrentStockItems(stockData);

      // Calculate total parts used, amount generated, and total vehicles repaired
      let partsUsedCount = 0;
      let generatedAmount = 0;
      let vehiclesRepairedCount = 0;

      vehicleData.forEach(vehicle => {
        if (vehicle.isCompleted) {
          vehiclesRepairedCount += 1;
        }
        vehicle.partsUsed.forEach(part => {
          partsUsedCount += part.quantity;
          generatedAmount += part.quantity * part.price;
        });
      });

      setTotalPartsUsed(partsUsedCount);
      setAmountGenerated(generatedAmount);
      setTotalVehiclesRepaired(vehiclesRepairedCount);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Summary Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Summary</Title>
          <Paragraph>Total Parts Used: {totalPartsUsed}</Paragraph>
          <Paragraph>Total Amount Generated: ₹{amountGenerated.toFixed(2)}</Paragraph>
          <Paragraph>Total Stock Items: {lowStockItems.length}</Paragraph>
          <Paragraph>Total Vehicles Repaired: {totalVehiclesRepaired}</Paragraph>
        </Card.Content>
      </Card>

      {/* Low Stock Alert */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Low Stock Alert</Title>
          {lowStockItems.length > 0 ? (
            lowStockItems.map(item => (
              <Paragraph key={item.id}>
                {item.name}: {item.quantity} remaining
              </Paragraph>
            ))
          ) : (
            <Paragraph>No low stock items</Paragraph>
          )}
        </Card.Content>
      </Card>

      {/* Active Vehicles */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Active Vehicles</Title>
          {activeVehicles.length > 0 ? (
            activeVehicles.map(vehicle => (
              <Paragraph key={vehicle.id}>
                {vehicle.model} - {vehicle.registrationNumber}
              </Paragraph>
            ))
          ) : (
            <Paragraph>No active vehicles</Paragraph>
          )}
        </Card.Content>
      </Card>

      {/* Current Stock Items */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Current Stock Items</Title>
          {currentStockItems.length > 0 ? (
            currentStockItems.map(item => (
              <Paragraph key={item.id}>
                {item.name} - Quantity: {item.quantity} - Price: ₹{item.price}
              </Paragraph>
            ))
          ) : (
            <Paragraph>No stock items available</Paragraph>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 10,
  },
});
