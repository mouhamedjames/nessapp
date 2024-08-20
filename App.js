import Navigation from "./components/Navigation.js";
import { initializeApp } from 'firebase/app';
import 'react-native-gesture-handler';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native'
const firebaseConfig = {
  apiKey: "AIzaSyAO4DMndvtOoDwJd33zEs7mLWVkl067Cf0",
  authDomain: "tapigrecodata.firebaseapp.com",
  databaseURL: "https://tapigrecodata-default-rtdb.firebaseio.com",
  projectId: "tapigrecodata",
  storageBucket: "tapigrecodata.appspot.com",
  messagingSenderId: "842448114294",
  appId: "1:842448114294:web:7cdef1200d63cbb2be4557"
};
initializeApp(firebaseConfig);
const App = () => {
  return(
      <SafeAreaView style={styles.root}>
        <Navigation />
      </SafeAreaView>
  )
}

export default App

const styles = StyleSheet.create({
  root:{
    flex: 1,
    backgroundColor: '#F9FBFC'
  }
})

