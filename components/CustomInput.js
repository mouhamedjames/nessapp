import {StyleSheet, Text, View, useWindowDimensions, TextInput} from 'react-native'
import React from 'react'
// @ts-ignore

const CustomInput = ({value, setValue, placeholder, secValue}) => {
    return(
        <View style={styles.container}>

            <View style={styles.input}>
                <TextInput style={styles.textInput}
                           placeholderTextColor="lightgrey"
                           value={value}
                           onChangeText={setValue}
                           placeholder={placeholder}
                           secureTextEntry={secValue}
                />
            </View>

        </View>
    )
}

const styles = StyleSheet.create({

    container:{
        backgroundColor: 'white',
        width: '100%',
        borderColor: '#e8e8e8',
        borderWidth: 2,
        borderRadius: 10,
        paddingHorizontal: 10,
        marginVertical: 5,
    },
    input:{},
    textInput:{
        color: 'grey',
    }
})

export default CustomInput
