import React, { useState } from 'react';
import { View } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddProductScreen({ navigation }) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmit = async () => {
    try {
      const newProduct = {
        id: Date.now().toString(),
        name,
        quantity: parseInt(quantity),
        price: parseFloat(price)
      };

      const existingProducts = JSON.parse(await AsyncStorage.getItem('stockData')) || [];
      await AsyncStorage.setItem('stockData', JSON.stringify([...existingProducts, newProduct]));
      
      navigation.goBack();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        label="Product Name"
        value={name}
        onChangeText={setName}
        style={{ marginBottom: 10 }}
      />
      <TextInput
        label="Quantity"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
        style={{ marginBottom: 10 }}
      />
      <TextInput
        label="Price"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={{ marginBottom: 20 }}
      />
      <Button mode="contained" onPress={handleSubmit}>
        Add Product
      </Button>
    </View>
  );
}