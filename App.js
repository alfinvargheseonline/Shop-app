import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import HomeScreen from './screens/HomeScreen';
import StockScreen from './screens/StockScreen';
import VehicleScreen from './screens/VehicleScreen';
import AddProductScreen from './screens/AddProductScreen';
import AddVehicleScreen from './screens/AddVehicleScreen';
import VehicleDetailsScreen from './screens/VehicleDetailsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const StockStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="StockMain" component={StockScreen} options={{ title: 'Stock Management' }} />
    <Stack.Screen name="AddProduct" component={AddProductScreen} options={{ title: 'Add New Product' }} />
  </Stack.Navigator>
);

const VehicleStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="VehicleMain" component={VehicleScreen} options={{ title: 'Vehicle Management' }} />
    <Stack.Screen name="AddVehicle" component={AddVehicleScreen} options={{ title: 'Add New Vehicle' }} />
    <Stack.Screen name="VehicleDetails" component={VehicleDetailsScreen} options={{ title: 'Vehicle Details' }} />
  </Stack.Navigator>
);

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Stock" component={StockStack} />
          <Tab.Screen name="Vehicles" component={VehicleStack} />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}