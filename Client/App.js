import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './screens/Login';
import Signup from './screens/Signup';
import ForgotPassword from './screens/ForgotPassword';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#4CAF50',
          headerBackTitle: ' ',
          headerLeftContainerStyle: {
            paddingLeft: 10,
          },
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={Login} 
          options={{ 
            headerShown: false 
          }}
        />
        <Stack.Screen 
          name="Signup" 
          component={Signup}
          options={{ 
            title: 'Create Account',
          }}
        />
        <Stack.Screen 
          name="ForgotPassword" 
          component={ForgotPassword}
          options={{ 
            title: 'Reset Password',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
