import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {FeedScreen} from '../screens/FeedScreen';

/**
 * Single-screen stack. The AI chat lives in a bottom-sheet overlay,
 * so it does not need its own route.
 */
export type RootStackParamList = {
  Feed: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Feed"
          component={FeedScreen}
          options={{title: 'Explore Trips'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
