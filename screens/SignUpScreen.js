import {
    StyleSheet,
    Text,
    View,
    Image,
    useWindowDimensions,
    TextInput,
    Alert,
    TouchableOpacity,
} from 'react-native'
import { ScrollView} from 'react-native';
import React, {useEffect, useState} from 'react'
import Logo from '../assets/logo.png';
import Input from '../components/CustomInput.js';
import Button from '../components/CustomButton.js';
import CustomRadioButton from "../components/CustomRadioButton.js";

import { useNavigation } from '@react-navigation/native';
import { getDatabase, ref, query, equalTo, orderByChild, get, child, push, set } from "firebase/database";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from '@firebase/auth';

import app from "../FirebaseConfig";


const SignUpScreen = () => {
    const {height} = useWindowDimensions();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nome, setNome] = useState('');
    const [cognome, setCognome] = useState('');
    const navigation = useNavigation();
    const [selectedValue, setSelectedValue] = useState('student');
    const [user, setUser] = useState(null);

    const auth = getAuth(app);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });

        return () => unsubscribe();
    }, [auth]);


    const handleRegister = async () => {
        try {
            console.log("dentro");
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('User registered:', userCredential.user);

            if(selectedValue === 'student') {

                const studentRef = ref(getDatabase(), 'students');
                const newStudentRef = push(studentRef);

                const newStudentData = {
                    nome: nome,
                    cognome: cognome,
                    email: email,
                    lessons: [''],
                };

                return set(newStudentRef, newStudentData)
                    .then(() => {
                        console.log('Nuovo studente aggiunto con successo:', newStudentData);
                        navigation.navigate('Login');

                    })
                    .catch(error => {
                        console.error('Errore durante l aggiunta del nuovo studente:', error);
                    });


            }else if(selectedValue === 'teacher'){

                const teachersRef = ref(getDatabase(), 'teachers');
                const newTeacherRef = push(teachersRef); // Genera un nuovo ID univoco per l'insegnante

                const newTeacherData = {
                    email: email,
                    nome: nome,
                    materia: [''],
                    lessons: [''],
                };

                return set(newTeacherRef, newTeacherData) // Aggiunge i dati del nuovo insegnante al database
                    .then(() => {
                        console.log('Nuovo insegnante aggiunto con successo:', newTeacherData);
                        // Effettua eventuali azioni aggiuntive dopo l'aggiunta dell'insegnante
                        navigation.navigate('SelectionSubject', {dati: newTeacherRef});
                    })
                    .catch(error => {
                        console.error('Errore durante l aggiunta del nuovo insegnante:', error);
                    });

            }

        } catch (error) {
            console.error('Registration error:', error);
            Alert.alert('Error', 'Failed to register user');
        }
    };



    return(
        <View style={styles.container}>
            <Image source={Logo} style={[styles.logo, {height: height * 0.3}]} />

            <ScrollView style={{width: '100%', height: '40%'}}>
                <Input
                    placeholder={'Nome'}
                    value={nome}
                    setValue={setNome}
                    secValue={false}
                />

                <Input
                    placeholder={'Cognome'}
                    value={cognome}
                    setValue={setCognome}
                    secValue={false}
                />

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

                <View style={styles.selection}>
                    <CustomRadioButton
                        label="Studente"
                        selected={selectedValue === 'student'}
                        onSelect={() => setSelectedValue('student')}
                    />

                    <CustomRadioButton
                        label="Insegnante"
                        selected={selectedValue === 'teacher'}
                        onSelect={() => setSelectedValue('teacher')}
                    />

                </View>
            </ScrollView>


            <View style={styles.button}>
                <Button
                    text='Registrati' onPress={handleRegister}
                />
            </View>

            <View style={styles.link}>
                <Text style={styles.text}>Hai già un account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.text}>Login</Text>
                </TouchableOpacity>
            </View>



        </View>
    )
}

export default SignUpScreen

const styles = StyleSheet.create({
    container:{
        alignItems: 'center',
        padding: 20,
    },
    logo:{
        width: '70%',
        maxWidth: 300,
        maxHeight: 200,
    },

    button:{
        width: '50%',
        marginTop: 70,
    },

    link:{
        marginTop: 10,
    },

    text:{
        color: 'grey',
        textAlign: 'center'
    },

    selection:{
        width: '100%',
    }
})
