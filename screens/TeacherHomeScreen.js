import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from "@react-navigation/native";
import Button from "../components/CustomButton";
import { useEffect, useState } from "react";
import { get, getDatabase, ref } from "firebase/database";

const HomeScreenT = () => {
    const route = useRoute();
    const datiUtente = route.params?.dati;
    const tipoUtente = route.params?.tipo;
    const navigation = useNavigation();

    console.log("datiUtente Home : " + JSON.stringify(datiUtente));

    const [ids, setIds] = useState([]);
    const [data, setData] = useState([]); // dati prenotazioni

    useEffect(() => {
        const fetchLessons = async () => {
            const db = getDatabase();
            const refDispo = ref(db, `teachers/${datiUtente.id}/lessons`);

            try {
                const snapshot = await get(refDispo);
                if (snapshot.exists()) {
                    const lez = snapshot.val();
                    console.log("lezioni:: " + JSON.stringify(lez));
                    const extractedIds = Object.keys(lez).filter(key => key !== "0");
                    setIds(extractedIds);
                    console.log("id lezioni:: " + extractedIds[0]);

                    const lessonPromises = extractedIds.map(id => {
                        const refLessons = ref(db, `lessons/${id}`);
                        return get(refLessons).then(snapshot => snapshot.val());
                    });

                    const lessons = await Promise.all(lessonPromises);
                    setData(lessons);
                }
            } catch (error) {
                console.error("Errore nel recupero delle lezioni:", error);
            }
        };

        fetchLessons();
    }, [datiUtente.id]);

    return (
        <View style={styles.container}>
            <Text>Home Professori</Text>
            <Text>Bentornato! {datiUtente.nome} {datiUtente.cognome}</Text>

            <View style={styles.comando}>
                <Button
                    text={"aggiugni lezione"}
                    onPress={() => navigation.navigate("Disponibilita", {
                        data: datiUtente
                    })}
                />
            </View>

            <View style={styles.comando}>
                <Button
                    text={"programma settimana"}
                    onPress={() => navigation.navigate("Pianificazione", {
                        data: datiUtente
                    })}
                />
            </View>

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
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
        </View>
    );
}

export default HomeScreenT;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginTop: 20,
        padding: 20,
    },
    comando: {
        padding: 20,
        alignSelf: "center",
        width: '70%',
    },
    item: {
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 5,
    },
});
