//Local storage
import AsyncStorage from '@react-native-community/async-storage';

export function Storeit(key, value){
    try{
        AsyncStorage.setItem(
            key,
            JSON.stringify(value)
        )
    }catch(e){
        console.error(e);
    }
}

export function Getit(key){
    return AsyncStorage.getItem(key);
}

export function Deleteit(key){
    AsyncStorage.removeItem(
        key,
        (error) => {
            if(error){
                console.error(error)
            }
        }
    )
}