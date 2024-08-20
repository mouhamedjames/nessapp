import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRoute } from "@react-navigation/native";
import { Calendar } from 'react-native-calendars';
import { useState, useEffect } from "react";
import { get, getDatabase, ref, update } from "firebase/database";
import Dialog from 'react-native-dialog';

const StudentHomeScreen = () => {
    const [lessons, setLessons] = useState({});
    const [visible, setVisible] = useState(false);
    const [selectedLessons, setSelectedLessons] = useState([]);
    const [data, setData] = useState([]);

    const route = useRoute();
    const datiUtente = route.params?.dati;
    const tipoUtente = route.params?.tipo;
console.log(data)
    useEffect(() => {
        const refLessons = ref(getDatabase(), 'lessons');
        get(refLessons)
            .then(snapshot => {
                if (snapshot.exists()) {
                    const lezioni = snapshot.val();
                

                    // Convert to JSON string and then parse it
                    const jsonData = JSON.stringify(lezioni);
                    const parsedData = JSON.parse(jsonData);

                    const prenotazioni = [];
                    const today = new Date();
                    const currentMonth = today.getMonth() + 1; // Months are 0-based
                    const currentYear = today.getFullYear();

                    for (const key in parsedData) {
                        const lezione = parsedData[key];
                        console.log(key,parsedData[key])

                        if (isValidLesson(lezione)) {
                            const [day, month, year] = lezione.data.split(" ").map(Number);
                            const dataFormattata = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                            console.log("true",day,month,year)
                            if (isValidDate(day, month, year, currentMonth, currentYear)) 
                            {console.log("2true")
                                if (lezione.studente === "" || lezione.studente === datiUtente.email) {
                                    const refProf = ref(getDatabase(), 'teachers/' + lezione.professore);
                                    console.log("3true")
                                    get(refProf)
                                        .then(snapshot => {
                                            if (snapshot.exists()) 
                                        {
                                                const nomeProf = snapshot.val().nome;
                                                fetchLessons(dataFormattata, lezione.materia, lezione.oraInizio, lezione.oraFine, nomeProf, key);
                                                if (lezione.studente === datiUtente.email) {
                                                    prenotazioni.push({
                                                        key: key,
                                                        data: dataFormattata,
                                                        materia: lezione.materia,
                                                        oraInizio: lezione.oraInizio,
                                                        oraFine: lezione.oraFine,
                                                        professore: nomeProf,
                                                        studente: lezione.studente
                                                    });
                                                    console.log("its fine data saved")
                                                }
                                            } else {
                                                console.error('Professore non trovato:', lezione.professore);
                                            }
                                        })
                                        .catch(error => {
                                            console.error('Errore durante il recupero dei dati del professore:', error);
                                        });
                                }
                            }
                        } else {
                            console.error('Lezione non valida:', lezione);
                        }
                    }

                    setData(prenotazioni);
                    console.log( "heloo print ", lessons)
                } else {
                    console.log('Il percorso "lessons" nel database è vuoto o non esiste.');
                }
            })
            .catch(error => {
                console.error('Errore durante il recupero dei dati:', error);
            });
    }, []);

    useEffect(() => {
        console.log('Data:', data);
    }, [data]);

    const fetchLessons = async (datalezione, materia, orarioInizio, orarioFine, nomeProf, id) => {
        setLessons(prevLessons => {
            const newLessons = { ...prevLessons };
            if (!newLessons[datalezione]) {
                newLessons[datalezione] = [];
            }
            newLessons[datalezione].push({
                name: materia,
                lessonStart: orarioInizio,
                lessonEnd: orarioFine,
                teacher: nomeProf,
                id: id
            });
            return newLessons;
        });
    };

    const isValidDate = (day, month, year, currentMonth, currentYear) => {
        return (
            (month > currentMonth && year === currentYear) ||
            (year > currentYear) ||
            (month === currentMonth && day >= new Date().getDate()) ||
            (year === currentYear && month >= currentMonth)
        );
    };

    const isValidLesson = (lezione) => {
        if (!lezione.data || typeof lezione.data !== 'string') {
            console.error('Data field is undefined or not a string:', lezione);
            return false;
        }
    
        const [day, month, year] = lezione.data.split(" ").map(Number);
        
        return (
            !isNaN(day) &&
            !isNaN(month) &&
            !isNaN(year) &&
            lezione.oraInizio &&
            lezione.oraFine &&
            lezione.professore
        );
    };

    const onDayPress = (day) => {
        const selectedDay = lessons[day.dateString];
        if (selectedDay) {
            setSelectedLessons(selectedDay);
            setVisible(true);
        } else {
            Alert.alert('No Lessons', 'There are no lessons available on this day.');
        }
    };

    const handleBooking = (lesson) => {
        console.log(`Lezione prenotata: ${lesson.name} at ${lesson.lessonStart}`);
        Alert.alert('Prenotazione', `Hai prenotato la lezione: ${lesson.name} alle ${lesson.lessonStart} - ${lesson.lessonEnd} con professore: ${lesson.teacher}`);

        const db = getDatabase();
        update(ref(db, "lessons/" + lesson.id), { studente: datiUtente.email })
            .then(() => {
                console.log('Studente aggiunto alla lezione');
                const profRef = ref(db, `students/${datiUtente.id}/lessons`);
                update(profRef, { [lesson.id]: true })
                    .then(() => {
                        console.log('Lezione associata allo studente con successo.');
                    })
                    .catch(error => {
                        console.error('Errore durante l\'aggiornamento del professore:', error);
                    });
            })
            .catch(error => {
                console.error('Errore durante l\'aggiornamento dei campi:', error);
            });
    };

    return (
        <View style={styles.container}>
            <Text>Home Studenti</Text>
            <Text>{tipoUtente}: {datiUtente.nome} {datiUtente.cognome}</Text>

            <View style={styles.calendar}>
                <Calendar
                    onDayPress={onDayPress}
                    markedDates={Object.keys(lessons).reduce((acc, date) => {
                        acc[date] = { marked: true };
                        return acc;
                    }, {})}
                    theme={{
                        selectedDayTextColor: '#2F6AAC',
                        arrowColor: '#2F6AAC',
                    }}
                />
            </View>

            <Dialog.Container visible={visible}>
                <Dialog.Title>Available Lessons</Dialog.Title>
                {selectedLessons.map((lesson, index) => (
                    <View key={index} style={styles.lessonContainer}>
                        <Text style={styles.lessonDescription}>
                            {`${lesson.name}\nOrario: ${lesson.lessonStart} - ${lesson.lessonEnd}\nProfessore: ${lesson.teacher}`}
                        </Text>
                        <TouchableOpacity
                            onPress={() => handleBooking(lesson)}
                            style={styles.dialogButton}>
                            <Text style={styles.dialogButtonText}>{`Prenota ${lesson.name}`}</Text>
                        </TouchableOpacity>
                    </View>
                ))}
                <Dialog.Button label="Cancel" onPress={() => setVisible(false)} />
            </Dialog.Container>

            <View style={styles.container}>
                <FlatList
                    data={data}
                    renderItem={({ item }) => (
                        <View style={styles.item}>
                            <Text>Data: {item.data}</Text>
                            <Text>Materia: {item.materia}</Text>
                            <Text>Professore: {item.professore}</Text>
                            <Text>Inizio Lezione: {item.oraInizio}</Text>
                            <Text>Fine Lezione: {item.oraFine}</Text>
                        </View>
                    )}
                    keyExtractor={item => item.key}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    calendar: {
        marginBottom: 20,
    },
    dialogButton: {
        backgroundColor: '#2F6AAC',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    dialogButtonText: {
        color: '#fff',
        textAlign: 'center',
    },
    lessonContainer: {
        marginBottom: 10,
    },
    lessonDescription: {
        fontSize: 16,
    },
    item: {
        marginBottom: 10,
    },
});

export default StudentHomeScreen;
