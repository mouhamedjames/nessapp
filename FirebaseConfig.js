import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// Configurazione dell'app Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAO4DMndvtOoDwJd33zEs7mLWVkl067Cf0",
    authDomain: "tapigrecodata.firebaseapp.com",
    databaseURL: "https://tapigrecodata-default-rtdb.firebaseio.com",
    projectId: "tapigrecodata",
    storageBucket: "tapigrecodata.appspot.com",
    messagingSenderId: "842448114294",
    appId: "1:842448114294:web:7cdef1200d63cbb2be4557"
};

// Inizializzazione dell'app Firebase
const app = initializeApp(firebaseConfig);

// Inizializzazione dell'Auth con persistenza
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Esportazione di app e auth
export { app, auth };
