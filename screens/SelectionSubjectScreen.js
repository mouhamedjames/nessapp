import React, { useState } from 'react';
import {View, Text, TouchableOpacity, TextInput, StyleSheet, Alert} from 'react-native';
import { ScrollView} from 'react-native';
import Button from '../components/CustomButton'

import {useNavigation, useRoute} from "@react-navigation/native";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from '@firebase/auth';
import { getDatabase, ref, update,query, equalTo, orderByChild, get, push, set, child} from "firebase/database";




const subjectsList: string[] = [
    'Matematica',
    'Scienze',
    'Storia',
    'Arte',
    'Musica',
    'Informatica',
    'Letteratura',
    // chiedere quali materie devo inserire
];

const SelectionSubjectScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const route = useRoute();
    const percorso = route.params?.dati;
    const navigation = useNavigation();


    const toggleSubject = (subject: string) => {
        const updatedSubjects = [...selectedSubjects];
        const index = updatedSubjects.indexOf(subject);
        if (index === -1) {
            updatedSubjects.push(subject);
        } else {
            updatedSubjects.splice(index, 1);
        }
        setSelectedSubjects(updatedSubjects);
    };

    const renderSubjects = () => {
        return subjectsList.filter(subject =>
            subject.toLowerCase().includes(searchQuery.toLowerCase())
        ).map(subject => (
            <TouchableOpacity
                key={subject}
                onPress={() => toggleSubject(subject)}
                style={{
                    backgroundColor: selectedSubjects.includes(subject) ? '#2F6AAC' : 'white',
                    padding: 10,
                    margin: 5,
                    marginBottom: 10,
                    borderRadius: 10,
                }}
            >
                <Text style={{color: selectedSubjects.includes(subject) ? 'white' : '#000'}}>
                    {subject}
                </Text>
            </TouchableOpacity>
        ));
    };

    const handleRegister = async () => {
        console.log("percorso: " + percorso.toString().substring(50));
        const db = getDatabase();
        //const referenceUser = db.ref(percorso.toString().substring(5));


        // MODIFICA SUBSTRING 50


        const nuoveMaterie = selectedSubjects;

        update(ref(db, percorso.toString().substring(50)), {materia: nuoveMaterie})
            .then(() => {
                console.log('Campi aggiornati con successo');
                navigation.navigate("Login");
            })
            .catch((error) => {
                console.error('Errore durante l\'aggiornamento dei campi:', error);
            });


    };

    return (
        <View style={styles.container}>

            <Text style={styles.text}>
                Seleziona le materie di tua competenza
            </Text>

            <View style={styles.selezionati}>
                <View style={styles.selectedSubjectsContainer}>
                    {selectedSubjects.map(subject => (
                        <Text key={subject} style={styles.selectedSubjectText}>{subject}</Text>
                    ))}
                </View>
            </View>


            <TextInput
                style={styles.input}
                placeholder="Cerca una materia..."
                value={searchQuery}
                onChangeText={text => setSearchQuery(text)}
            />

            <ScrollView style={{}}>
                {renderSubjects()}
            </ScrollView>

            <View style={styles.button}>
                <Button
                    text='Registrati' onPress={handleRegister}
                />
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    container:{
        padding: 20
    },
    text:{
        fontSize: 20,
        marginBottom: 10,
        color: 'black',
    },
    input: {
        width: '100%',
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        padding: 10,
        borderRadius: 10,
    },
    selezionati:{
    },
    selectedSubjectsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    selectedSubjectText: {
        marginRight: 10,
        marginBottom: 5,
        padding: 5,
        backgroundColor: '#2F6AAC',
        borderColor: 'grey',
        borderWidth: 1,
        color: 'white',
        borderRadius: 5,
    },

    button:{
        width: '50%',
        marginTop: 50,
        alignSelf: 'center'
    }
})
export default SelectionSubjectScreen;
