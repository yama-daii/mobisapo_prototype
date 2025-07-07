import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Dimensions,
} from "react-native";
import * as Location from "expo-location";
import MapView, { Marker, Polyline } from "react-native-maps";
import axios from "axios";
import polyline from "@mapbox/polyline";
import { GOOGLE_MAPS_API_KEY } from "../../config";

interface Coords {
  latitude: number;
  longitude: number;
}

export default function TravelTimeScreen() {
  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [destination, setDestination] = useState("");
  const [destinationCoords, setDestinationCoords] = useState<Coords | null>(
    null
  );
  const [routeCoords, setRouteCoords] = useState<Coords[]>([]);
  const [duration, setDuration] = useState("");
  const [travelMode, setTravelMode] = useState("driving");

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("位置情報の許可が必要です");
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
    })();
  }, []);

  const getRoute = async () => {
    if (!location || !destination) return;
    const origin = `${location.latitude},${location.longitude}`;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=${travelMode}&key=${GOOGLE_MAPS_API_KEY}`;

    try {
      const response = await axios.get(url);
      console.log(response.data);
      if (response.data.routes.length > 0) {
        const leg = response.data.routes[0].legs[0];
        setDuration(leg.duration.text);

        const points = response.data.routes[0].overview_polyline.points;
        const coords = polyline.decode(points).map(([lat, lng]) => ({
          latitude: lat,
          longitude: lng,
        }));
        setRouteCoords(coords);

        setDestinationCoords({
          latitude: leg.end_location.lat,
          longitude: leg.end_location.lng,
        });
      } else {
        alert("ルートが取得できません。");
      }
    } catch (error) {
      console.error(error);
      alert("ルート取得時にエラーが発生しました");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>目的地を入力:</Text>
      <TextInput
        style={styles.input}
        placeholder="例: 東京駅"
        value={destination}
        onChangeText={setDestination}
      />

      <View style={styles.modeButtons}>
        {["driving", "walking"].map((mode) => (
          <Button
            key={mode}
            title={mode}
            onPress={() => setTravelMode(mode)}
            color={travelMode === mode ? "blue" : "gray"}
          />
        ))}
      </View>

      <Button title="ルートを取得" onPress={getRoute} />
      {duration && (
        <Text style={styles.result}>
          所要時間（{travelMode}）: {duration}
        </Text>
      )}

      {location && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker coordinate={location} title="現在地" />
          {destinationCoords && (
            <Marker coordinate={destinationCoords} title="目的地" />
          )}
          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeWidth={5}
              strokeColor="blue"
            />
          )}
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, paddingTop: 50, backgroundColor: "#fff" },
  label: { fontSize: 16, marginBottom: 5 },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  result: { fontSize: 18, marginTop: 10 },
  map: {
    width: Dimensions.get("window").width,
    height: 300,
    marginTop: 10,
  },
  modeButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
});
