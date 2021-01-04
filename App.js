import React, {useEffect, useState} from 'react';
import {
  Alert,
  Button,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Text,
  TextInput,
} from 'react-native';
import axios from 'axios';
import {API_KEY, API_URL} from '@env';

const App = () => {
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [time, setTime] = useState('');
  const [zone, setZone] = useState('');

  useEffect(() => {
    // Seattle coordinates
    getTime('47.6062', '-122.3321');
  }, []);

  const getTime = async (a, b) => {
    const params = {
      key: API_KEY,
      format: 'json',
      by: 'position',
      lat: a,
      lng: b,
    };

    try {
      const response = await axios.get(API_URL, {params});
      const {
        data: {status, formatted, message, zoneName},
      } = response;

      if (response && status === 'OK') {
        setTime(formatted.substr(11, 19));
        setZone(zoneName);
      } else if (status === 'FAILED') {
        Alert.alert(message);
      }
    } catch (error) {
      console.warn(error);
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        <Text>{zone}</Text>
        <Text style={styles.time}>{time}</Text>
        <Text style={styles.title}>
          Enter coordinates to see time for that location
        </Text>
        <TextInput
          placeholder={'latitude'}
          onChangeText={(text) => setLat(text)}
          style={styles.textInput}
        />
        <TextInput
          placeholder={'longitude'}
          onChangeText={(text) => setLng(text)}
          style={styles.textInput}
        />
        <Button
          onPress={() => getTime(lat, lng)}
          title={'Submit'}
          color="#007AFF"
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginHorizontal: 50,
    marginBottom: 50,
  },
  time: {
    fontSize: 60,
    marginBottom: 30,
  },
  textInput: {
    width: '50%',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 5,
    marginVertical: 10,
  },
});

export default App;
