import {Pressable, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import React from 'react'

// @ts-ignore
const CustomRadioButton = ({ label, selected, onSelect }) => {

    return(
        <TouchableOpacity
            style={[styles.radioButton,
                { backgroundColor: selected ? '#2F6AAC' : '#FFF' }]}
            onPress={onSelect}

        >
            <Text style={[styles.radioButtonText,
                { color: selected ? '#FFF' : '#000' }]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

};


const styles = StyleSheet.create({
    radioButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#2F6AAC',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    radioButtonText: {
        fontSize: 16,
    },

})

export default CustomRadioButton
