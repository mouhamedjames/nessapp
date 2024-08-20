import { Alert, StyleSheet, Text, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import RNPickerSelect from 'react-native-picker-select';
import Button from '../components/CustomButton';
import ButtonComp from '../components/CustomButton.js';
import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getDatabase, ref, push, set, update } from 'firebase/database';

const AddDisponibility = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const datiUtente = route.params?.data;
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(false);
    const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);

    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedStartTime, setSelectedStartTime] = useState(null);
    const [selectedEndTime, setSelectedEndTime] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);

    const subjectsArray = datiUtente.materia;

    console.log(JSON.stringify(datiUtente, null, 2));

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleDateConfirm = (date) => {
        setSelectedDate(date);
        hideDatePicker();
    };

    const showStartTimePicker = () => {
        setStartTimePickerVisibility(true);
    };

    const hideStartTimePicker = () => {
        setStartTimePickerVisibility(false);
    };

    const handleStartTimeConfirm = (time) => {
        const adjustedTime = adjustMinutes(time);
        setSelectedStartTime(adjustedTime);
        setSelectedEndTime(null); // Reset the end time when start time is changed
        hideStartTimePicker();
    };

    const showEndTimePicker = () => {
        setEndTimePickerVisibility(true);
    };

    const hideEndTimePicker = () => {
        setEndTimePickerVisibility(false);
    };

    const handleEndTimeConfirm = (time) => {
        const adjustedTime = adjustMinutes(time);
        if (selectedStartTime && adjustedTime <= selectedStartTime) {
            Alert.alert('Error', 'End time must be at least one hour after start time');
        } else {
            setSelectedEndTime(adjustedTime);
            hideEndTimePicker();
        }
    };

    const adjustMinutes = (time) => {
        const minutes = time.getMinutes();
        const ore = time.getHours();

        if (ore < 14 || ore > 18) {
            Alert.alert('Error', 'lo studio apre alle 14:30 e chiude alle 19');
            return null;
        } else if (ore === 14 && minutes < 30) {
            Alert.alert('Error', 'lo studio apre alle 14:30');
            return null;
        } else {
            if (minutes >= 30) {
                time.setMinutes(30);
            } else {
                time.setMinutes(0);
            }
        }

        console.log("time: " + time);
        return time;
    };

    const renderPickerOptions = () => {
        if (Array.isArray(subjectsArray) && subjectsArray.length > 0) {
            return subjectsArray.map((subject) => ({
                label: subject,
                value: subject
            }));
        } else {
            return [];
        }
    };

    const createDisponibility = async () => {
        try {
            const dispRef = ref(getDatabase(), 'lessons');
            const newDispRef = push(dispRef);

            const mese = selectedDate?.getMonth() + 1;
            const data = mese + ' ' + selectedDate?.getDate() + ' ' + selectedDate?.getFullYear();
            const orarioInizio = selectedStartTime?.getHours() + ':' + (selectedStartTime?.getMinutes() === 0 ? '00' : '30');
            const orarioFine = selectedEndTime?.getHours() + ':' + (selectedEndTime?.getMinutes() === 0 ? '00' : '30');

            const newDispData = {
                data: data,
                oraInizio: orarioInizio,
                oraFine: orarioFine,
                materia: selectedSubject,
                professore: datiUtente.id,
                studente: '',
            };

            return set(newDispRef, newDispData)
                .then(() => {
                    const db = getDatabase();
                    const newDispId = newDispRef.key;

                    console.log('Nuova disponibilita aggiunto con successo:', newDispData);
                    console.log('ID della nuova disponibilita:', newDispId);

                    const profRef = ref(db, `teachers/${datiUtente.id}/lessons`);
                    update(profRef, { [newDispId]: true })
                        .then(() => {
                            console.log('Lezione associata al professore con successo.');
                        })
                        .catch(error => {
                            console.error('Errore durante l\'aggiornamento del professore:', error);
                        });

                    navigation.navigate('TeacherHome', {
                        dati: datiUtente
                    });
                })
                .catch(error => {
                    console.error('Errore durante l aggiunta disponibilita:', error);
                });

        } catch (error) {
            console.error('Disponibilita error:', error);
            Alert.alert('Error', 'Failed to register user');
        }
    }

    return (
        <View style={styles.container}>

            <View style={styles.titolo}>
                <Text style={styles.font}>Aggiungi disponibilità</Text>
            </View>

            <Button text="Seleziona data" onPress={showDatePicker} />
            <Button text="Seleziona inizio lezione" onPress={showStartTimePicker} />
            <Button text="Seleziona fine lezione" onPress={showEndTimePicker} />

            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleDateConfirm}
                onCancel={hideDatePicker}
            />

            <DateTimePickerModal
                isVisible={isStartTimePickerVisible}
                mode="time"
                onConfirm={handleStartTimeConfirm}
                onCancel={hideStartTimePicker}
               
            />

            <DateTimePickerModal
                isVisible={isEndTimePickerVisible}
                mode="time"
                onConfirm={handleEndTimeConfirm}
                onCancel={hideEndTimePicker}
               
            />

            <RNPickerSelect
                onValueChange={(value) => setSelectedSubject(value)}
                items={renderPickerOptions()}
                placeholder={{ label: 'Seleziona Materia', value: null }}
            >
                <Button text="Seleziona Materia" />
            </RNPickerSelect>

            <Text style={styles.selectedDateText}>
                Data lezione: {selectedDate ? selectedDate.toLocaleDateString() : ''}
            </Text>

            <Text style={styles.selectedTimeText}>
                Inizio lezione: {selectedStartTime ? selectedStartTime.toLocaleTimeString() : ''}
            </Text>

            <Text style={styles.selectedTimeText}>
                Fine lezione: {selectedEndTime ? selectedEndTime.toLocaleTimeString() : ''}
            </Text>

            <Text style={styles.selectedSubjectText}>
                Materia della lezione: {selectedSubject || 'N/A'}
            </Text>

            <View style={styles.fatto}>
                <ButtonComp
                    text="fatto"
                    onPress={createDisponibility}
                />
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        padding: 30,
        marginTop: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titolo: {
        marginBottom: 50,
    },
    font: {
        fontSize: 20,
    },
    selectedDateText: {
        marginTop: 10,
        fontSize: 16,
    },
    selectedTimeText: {
        marginTop: 10,
        fontSize: 16,
    },
    selectedSubjectText: {
        marginTop: 10,
        fontSize: 16,
    },
    fatto: {
        width: '50%',
        marginTop: 20,
    }
});

export default AddDisponibility;
