import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import LoginScreen from '../screens/LoginScreen.js';
import SignUpScreen from "../screens/SignUpScreen";
import SelectionSubjectScreen from "../screens/SelectionSubjectScreen";
import TeacherHomeScreen from "../screens/TeacherHomeScreen";
import StudentHomeScreen from "../screens/StudentHomeScreen";
import addDisponibility from "../screens/AddDisponibility";
import PlanningWeek from "../screens/PlanningWeek";
import HomeScreen from '../screens/Home';
const Stack = createStackNavigator();

const Navigation = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator>
            <Stack.Screen name='Home' component={HomeScreen}  options={{headerShown: false}}/>
                <Stack.Screen name='Login' component={LoginScreen}  options={{headerShown: false}}/>
                
                <Stack.Screen name='Register' component={SignUpScreen} options={{headerShown: false}}/>
                <Stack.Screen name='SelectionSubject' component={SelectionSubjectScreen} options={{headerShown: false}}/>
                <Stack.Screen name='StudentHome' component={StudentHomeScreen} options={{headerShown: false}}/>
                <Stack.Screen name='TeacherHome' component={TeacherHomeScreen} options={{headerShown: false}}/>
                <Stack.Screen name='Disponibilita' component={addDisponibility} options={{headerShown: false}}/>
                <Stack.Screen name='Pianificazione' component={PlanningWeek} options={{headerShown: false}}/>

            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default Navigation;
