import React, {useEffect, useState} from 'react'
import { View, Text, Button, StyleSheet,TouchableOpacity } from 'react-native';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from '@firebase/auth'; 
import {useRoute} from "@react-navigation/native";
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';



export default function HomeScreen() {
  const route = useRoute();

  const navigation = useNavigation();
  const handleLogout = async () => {
    const auth = getAuth()
   signOut(auth)
    .then(() => {
      console.log("User signed out");
      navigation.navigate('Login',)
    })
    .catch((error) => {
      console.error("Sign out error:", error);
    });
  };

  const booking =()=>{
    navigation.navigate('StudentHome',{
      dati: datiUtente,
      tipo: tipoUtente
  })



  }

  const datiUtente = route.params?.dati;
  const tipoUtente = route.params?.tipo;

  const [user, setUser] = useState();

  // Handle user state changes

  const auth = getAuth();
  useEffect(() => {
    

    // Set up the auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user); // User is signed in
        console.log("User is signed in:", user);
      } else {
        setUser(null); // No user is signed in
        console.log("No user is signed in");
      }
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, [auth]);


  if (!user) {
    console.log("user" ,user)
    navigation.navigate('Login')
    return(
        <Text style={styles.greeting}>Hi ! </Text> )
    
  }
else{
  console.log("userssss" ,user)
  return (
    <View style={styles.container}>
    <View style={styles.navbar}>
        <Text style={styles.greeting}>Hi {user.email}!</Text>
        <Button title="Logout" onPress={handleLogout} />
      </View>
<View style={styles.agenda}>
        <Text style={styles.agendaTitle}>Today's Agenda</Text>
        <View style={styles.iconsContainer}>
          <TouchableOpacity style={styles.iconItem} onPress={booking} >
            <Icon name="calendar-outline" size={50} color="#4CAF50" />
            <Text>booking</Text>
            </TouchableOpacity>
          <View style={styles.iconItem}>
            <Icon name="document-text-outline" size={50} color="#FF5722" />
            <Text>Documents</Text>
          </View>
          <View style={styles.iconItem}>
            <Icon name="checkmark-done-outline" size={50} color="#2196F3" />
            <Text>Tasks</Text>
          </View>
        </View>
      </View>
      </View>
    
  );}
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        backgroundColor: '#f0f0f0',
      },
      navbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#6200EE',
        paddingVertical: 15,
        paddingHorizontal: 20,
      },
      greeting: {
        fontSize: 20,
        color: '#FFF',
      },
      agenda: {
        padding: 20,
        marginTop: 10,
      },
      agendaTitle: {
        fontSize: 24,
        marginBottom: 15,
        color: '#333',
      },
      iconsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
      },
      iconItem: {
        alignItems: 'center',
      },
    });