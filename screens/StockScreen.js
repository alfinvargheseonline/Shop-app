import React, { useState, useEffect } from 'react';
import { View, FlatList, Alert } from 'react-native';
import { List, FAB, TextInput, Button, Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function StockScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await AsyncStorage.getItem('stockData');
      if (data) setProducts(JSON.parse(data));
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const updateStock = async (productId, change) => {
    const updatedProducts = products.map(product => {
      if (product.id === productId) {
        return { ...product, quantity: Math.max(0, product.quantity + change) };
      }
      return product;
    });
    
    setProducts(updatedProducts);
    await AsyncStorage.setItem('stockData', JSON.stringify(updatedProducts));
  };

  const confirmDeleteProduct = (productId) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteProduct(productId) }
      ],
      { cancelable: true }
    );
  };

  const deleteProduct = async (productId) => {
    const updatedProducts = products.filter(product => product.id !== productId);
    setProducts(updatedProducts);
    await AsyncStorage.setItem('stockData', JSON.stringify(updatedProducts));
  };

  const getTotalStock = () => {
    return products.reduce((total, product) => total + product.quantity, 0);
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <TextInput
        label="Search Products"
        value={searchQuery}
        onChangeText={query => setSearchQuery(query)}
        style={{ marginBottom: 10 }}
      />
      
      <Text>Total Stock: {getTotalStock()}</Text>
      
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <List.Item
            title={item.name}
            description={`Quantity: ${item.quantity}`}
            right={() => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Button onPress={() => updateStock(item.id, -1)}>-</Button>
                <Button onPress={() => updateStock(item.id, 1)}>+</Button>
                <Button onPress={() => confirmDeleteProduct(item.id)}>Delete</Button>
              </View>
            )}
          />
        )}
      />
      
      <FAB
        style={{ position: 'absolute', margin: 16, right: 0, bottom: 0 }}
        icon="plus"
        label="Add Product"
        onPress={() => navigation.navigate('AddProduct')}
      />
    </View>
  );
}
