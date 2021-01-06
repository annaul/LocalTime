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
import axios, {AxiosResponse} from 'axios';
import Geolocation, {
  GeolocationResponse,
} from '@react-native-community/geolocation';
import {API_KEY, API_URL_GET_ZONE, API_URL_CONVERT_ZONE} from '@env';

interface Params {
  key: string;
  format: string;
  from?: string;
  to?: string;
  by?: string;
  lat?: string;
  lng?: string;
}

const App: React.FC = () => {
  const editTime = (offset: number) => {
    const date = new Date(new Date().getTime() + offset * 1000);
    const hours =
      date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
    const minutes =
      date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();

    return `${hours}:${minutes}`;
  };

  const [requestedLat, setRequestedLat] = useState<string>();
  const [requestedLng, setRequestedLng] = useState<string>();
  const [time, setTime] = useState<string>(editTime(0));
  const [requestedZone, setRequestedZone] = useState<string>();
  const [userZone, setUserZone] = useState<string>();

  useEffect(() => {
    const getUserZone = () => {
      Geolocation.getCurrentPosition((position: GeolocationResponse) => {
        const {
          coords: {latitude, longitude},
        } = position;
        getZone(latitude.toString(), longitude.toString(), 'user');
      });
    };

    getUserZone();
  }, []);

  useEffect(() => {
    const getZoneOffset = (from: string, to: string) => {
      const params: Params = {
        key: API_KEY,
        format: 'json',
        from,
        to,
      };
      axios
        .get(API_URL_CONVERT_ZONE, {params})
        .then((response: AxiosResponse) => {
          const {
            data: {offset},
          } = response;

          setTime(editTime(offset));
        })
        .catch((error: Error) => console.warn(error));
    };

    if (userZone && requestedZone) {
      getZoneOffset(userZone, requestedZone);
    }
  }, [requestedZone, userZone]);

  const getZone = (
    a: string | undefined,
    b: string | undefined,
    zone: string,
  ) => {
    const params: Params = {
      key: API_KEY,
      format: 'json',
      by: 'position',
      lat: a,
      lng: b,
    };

    axios
      .get(API_URL_GET_ZONE, {params})
      .then((response: AxiosResponse) => {
        const {
          data: {zoneName, status, message},
        } = response;
        if (response && status === 'OK') {
          zone === 'requested'
            ? setRequestedZone(zoneName)
            : setUserZone(zoneName);
        } else if (status === 'FAILED') {
          Alert.alert(message);
        }
      })
      .catch((error: Error) => console.warn(error));
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        <Text style={styles.time}>{time}</Text>
        <Text style={styles.title}>
          Enter coordinates to see time for that location
        </Text>
        <TextInput
          placeholder={'latitude'}
          onChangeText={(text: string) => setRequestedLat(text)}
          style={styles.textInput}
        />
        <TextInput
          placeholder={'longitude'}
          onChangeText={(text: string) => setRequestedLng(text)}
          style={styles.textInput}
        />
        <Button
          onPress={() => getZone(requestedLat, requestedLng, 'requested')}
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
    padding: 10,
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 5,
    marginVertical: 10,
  },
});

export default App;
