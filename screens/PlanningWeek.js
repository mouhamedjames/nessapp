import { Alert, StyleSheet, Text, View, FlatList } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import RNPickerSelect from 'react-native-picker-select';
import Button from '../components/CustomButton';
import ButtonComp from '../components/CustomButton.js';
import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getDatabase, ref, push, set, update } from 'firebase/database';

const PlanningWeek = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const datiUtente = route.params?.data;
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(false);
    const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);

    const [currentSession, setCurrentSession] = useState({ date: null, startTime: null, endTime: null });
    const [selectedSessions, setSelectedSessions] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);

    const subjectsArray = datiUtente.materia;

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleDateConfirm = (date) => {
        setCurrentSession({ ...currentSession, date });
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
        setCurrentSession({ ...currentSession, startTime: adjustedTime, endTime: null }); // Reset the end time when start time is changed
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
        if (currentSession.startTime && adjustedTime <= currentSession.startTime) {
            Alert.alert('Error', 'End time must be at least one hour after start time');
        } else {
            setCurrentSession({ ...currentSession, endTime: adjustedTime });
            hideEndTimePicker();
        }
    };

    const adjustMinutes = (time) => {
        const minutes = time.getMinutes();
        const ore = time.getHours();

        if (ore < 14 || ore > 18) {
            Alert.alert('Error', 'Lo studio apre alle 14:30 e chiude alle 19');
            return null;
        } else if (ore === 14 && minutes < 30) {
            Alert.alert('Error', 'Lo studio apre alle 14:30');
            return null;
        } else {
            if (minutes >= 30) {
                time.setMinutes(30);
            } else {
                time.setMinutes(0);
            }
        }

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

    const addSession = () => {
        if (currentSession.date && currentSession.startTime && currentSession.endTime) {
            setSelectedSessions([...selectedSessions, currentSession]);
            setCurrentSession({ date: null, startTime: null, endTime: null });
        } else {
            Alert.alert('Error', 'Please select date, start time, and end time');
        }
    };

    const createDisponibility = async () => {
        try {
            const db = getDatabase();

            for (const session of selectedSessions) {
                const dispRef = ref(db, 'lessons');
                const newDispRef = push(dispRef);

                const mese = session.date?.getMonth() + 1;
                const data = `${mese}/${session.date?.getDate()}/${session.date?.getFullYear()}`;
                const orarioInizio = session.startTime?.getHours() + ':' + (session.startTime?.getMinutes() === 0 ? '00' : '30');
                const orarioFine = session.endTime?.getHours() + ':' + (session.endTime?.getMinutes() === 0 ? '00' : '30');

                const newDispData = {
                    data: data,
                    oraInizio: orarioInizio,
                    oraFine: orarioFine,
                    materia: selectedSubject,
                    professore: datiUtente.id,
                    studente: '',
                };

                await set(newDispRef, newDispData);

                const newDispId = newDispRef.key;  // Ottieni l'ID della nuova disponibilità
                const profRef = ref(db, `teachers/${datiUtente.id}/lessons`);
                await update(profRef, { [newDispId]: true });
            }

            navigation.navigate('TeacherHome', {
                dati: datiUtente
            });
        } catch (error) {
            console.error('Disponibilita error:', error);
            Alert.alert('Error', 'Failed to register user');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.titolo}>
                <Text style={styles.font}>Pianificazione settimana</Text>
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
                minimumDate={new Date(new Date().setHours(14, 30))}
                maximumDate={new Date(new Date().setHours(18, 0))}
            />

            <DateTimePickerModal
                isVisible={isEndTimePickerVisible}
                mode="time"
                onConfirm={handleEndTimeConfirm}
                onCancel={hideEndTimePicker}
                minimumDate={currentSession.startTime ? new Date(currentSession.startTime.getTime() + 60 * 60 * 1000) : undefined}
                maximumDate={new Date(new Date().setHours(19, 0))}
            />

            <RNPickerSelect
                onValueChange={(value) => setSelectedSubject(value)}
                items={renderPickerOptions()}
                placeholder={{ label: 'Seleziona Materia', value: null }}
            />

            <Text style={styles.selectedDateText}>
                Data lezione: {currentSession.date ? currentSession.date.toLocaleDateString() : ''}
            </Text>

            <Text style={styles.selectedTimeText}>
                Inizio lezione: {currentSession.startTime ? currentSession.startTime.toLocaleTimeString() : ''}
            </Text>

            <Text style={styles.selectedTimeText}>
                Fine lezione: {currentSession.endTime ? currentSession.endTime.toLocaleTimeString() : ''}
            </Text>

            <Button text="Aggiungi sessione" onPress={addSession} />

            <FlatList
                data={selectedSessions}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.sessionItem}>
                        <Text>Data: {item.date.toLocaleDateString()}</Text>
                        <Text>Inizio: {item.startTime.toLocaleTimeString()}</Text>
                        <Text>Fine: {item.endTime.toLocaleTimeString()}</Text>
                    </View>
                )}
            />

            <Text style={styles.selectedSubjectText}>
                Materia della lezione: {selectedSubject || 'N/A'}
            </Text>

            <View style={styles.fatto}>
                <ButtonComp text="Fatto" onPress={createDisponibility} />
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
    },
    sessionItem: {
        marginTop: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
    },
});

export default PlanningWeek;
