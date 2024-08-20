import {StyleSheet, Text, View, Image, useWindowDimensions, TextInput, TouchableOpacity, Alert} from 'react-native'
import React, {useEffect, useState} from 'react'
import Logo from '../assets/logo.png'
import Input from '../components/CustomInput.js';
import ButtonComp from '../components/CustomButton.js';
import { useNavigation } from '@react-navigation/native';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from '@firebase/auth';

import { getDatabase, ref, query, equalTo, orderByChild, get, child} from "firebase/database";
import app from "../FirebaseConfig";
const LoginScreen = () => {
    const {height} = useWindowDimensions();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();
    const [tipo, setTipo] = useState('');
    const [user, setUser] = useState(null);

    const auth = getAuth(app);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });

        return () => unsubscribe();
    }, [auth]);


    const handleLogin = async () => {
        try {
            //console.log("dentro " + email + " " + password);

            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            //const userCredential = await signInWithEmailAndPassword(email, password);
            // Accesso riuscito, puoi navigare alla schermata successiva o eseguire altre azioni

            console.log('Accesso riuscito:', userCredential.user.uid);
            await userData(email);

        } catch (error) {
            // Gestione degli errori durante il login
            Alert.alert('Errore', 'Credenziali di accesso non valide. Controlla e riprova.');
            console.error('Errore durante il login:', error);
        }
    };

    const userData = async (email) =>{
        //console.log("dentro con: " + email);
        const teachersRef = ref(getDatabase(), 'teachers');

        // Esegui una lettura dei dati di tutti gli insegnanti
        get(teachersRef)
            .then(snapshot => {
                // Controlla se esistono dati per gli insegnanti
                if (snapshot.exists()) {
                    // Estrai i dati di tutti gli insegnanti dallo snapshot
                    const teachersData = snapshot.val();

                    const teachersArray = Object.entries(teachersData).map(([teacherId, teacher]) => {
                        return { id: teacherId, ...teacher };
                    });

                    // Cerca l'insegnante con l'email specificata
                    const teacherFound = teachersArray.find(teacher => teacher.email === email);
                    // Cerca l'insegnante con l'email specificata
                    //const teacherFound = Object.values(teachersData).find(teacher => teacher.email === email);

                    if (teacherFound) {
                        setUser(teacherFound);
                        console.log("insegnante trovato: " + JSON.stringify(teacherFound));
                        navigation.navigate('TeacherHome', {
                            dati: teacherFound,
                            tipo: 'insegnante'
                        })
                    } else {
                        console.log('Nessun insegnante trovato con l\'email specificata.');

                        const studentsRef = ref(getDatabase(), 'students');
                        get(studentsRef)
                            .then(snapshot => {
                                if (snapshot.exists()) {
                                    // Estrai i dati di tutti gli insegnanti dallo snapshot
                                    const studentsData = snapshot.val();

                                    const studentArray = Object.entries(studentsData).map(([studentId, student]) => {
                                        return { id: studentId, ...student };
                                    });

                                    const studentsFound = studentArray.find(student => student.email === email);


                                    // Cerca l'insegnante con l'email specificata

                                   //------------------------- const studentsFound = Object.values(studentsData).find(student => student.email === email);

                                    if (studentsFound) {
                                        setUser("student");
                                        navigation.navigate('Home', {
                                            dati: studentsFound,
                                            tipo: 'studente'
                                        })
                                    } else {
                                        console.log('Nessun studente trovato con l\'email specificata.');
                                    }
                                }else{
                                        console.log('Il percorso "students" nel database è vuoto o non esiste.');

                                }
                            })

                    }
                } else {
                    console.log('Il percorso "teachers" nel database è vuoto o non esiste.');
                }
            })
           .catch(error => {
                console.error('Errore durante la ricerca degli insegnanti:', error);
            });

    }






    return(
        <View style={styles.container}>
            <Image source={Logo} style={[styles.logo, {height: height * 0.3}]} />
            <Input
                placeholder={'Email'}
                value={email}
                setValue={setEmail}
                secValue={false}
            />

            <Input
                placeholder={'Password'}
                value={password}
                setValue={setPassword}
                secValue={true}
            />

            <View style={styles.button}>
                <ButtonComp
                    text='Login' onPress={handleLogin}
                />
            </View>

            <Text style={styles.link}>Non hai un account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.text} >Registrati</Text>
            </TouchableOpacity>
        </View>
    )
}

export default LoginScreen

const styles = StyleSheet.create({
    container:{
        alignItems: 'center',
        padding: 20,
    },
    logo:{
        width: '70%',
        maxWidth: 300,
        maxHeight: 200,
        marginBottom: 100,
    },

    button:{
        width: '50%',
        marginTop: 20,
    },

    text:{
        color: 'grey',
        textAlign: 'center',
    },

    link:{
        color: 'grey',
        marginTop: 10,
    }

})
