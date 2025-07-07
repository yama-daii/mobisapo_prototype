import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import * as Location from "expo-location";
import { API_KEY } from "../../config"; // APIキーをconfig.tsからインポート

// メインコンポーネント
export default function App() {
  // 天気テキストの状態
  const [weatherText, setWeatherText] = useState("");
  // 住所テキストの状態
  const [addressText, setAddressText] = useState("");
  // ローディング状態
  const [loading, setLoading] = useState(true);
  // リフレッシュ状態
  const [refreshing, setRefreshing] = useState(false);
  // エラーメッセージ
  const [errorMsg, setErrorMsg] = useState("");

  // 天気と位置情報を取得する関数
  const fetchWeatherAndLocation = async () => {
    try {
      // ローディング開始
      setLoading(true);
      // エラーメッセージ初期化
      setErrorMsg("");

      // 位置情報の許可をリクエスト
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("位置情報の許可が必要です");
        return;
      }

      // 現在地を取得
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // 住所取得
      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (geocode.length > 0) {
        const addr = geocode[0];
        const formattedAddress = `${addr.region || ""}${addr.city || ""}${
          addr.street || ""
        }`;
        setAddressText(formattedAddress || "現在地不明");
      }

      // 天気取得
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=ja`;
      const res = await fetch(weatherUrl);
      const data = await res.json();

      const temp = data.main.temp;
      const description = data.weather[0].description;
      const main = data.weather[0].main;
      const emoji = getWeatherEmoji(main);

      const text = `${emoji} ${description}（${temp.toFixed(1)}℃）`;
      setWeatherText(text);
    } catch (error) {
      setErrorMsg("データの取得に失敗しました");
    } finally {
      // ローディング終了、リフレッシュ終了
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 初回レンダー時に天気と位置情報を取得
  useEffect(() => {
    fetchWeatherAndLocation();
  }, []);

  // リフレッシュ時の処理
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWeatherAndLocation();
  }, []);

  // 天気の状態から絵文字を取得する関数
  const getWeatherEmoji = (main: string) => {
    switch (main) {
      case "Clear":
        return "☀️";
      case "Clouds":
        return "☁️";
      case "Rain":
        return "🌧️";
      case "Snow":
        return "❄️";
      case "Thunderstorm":
        return "⛈️";
      case "Drizzle":
        return "🌦️";
      case "Mist":
      case "Fog":
      case "Haze":
        return "🌫️";
      default:
        return "🌈";
    }
  };

  // UI
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {loading ? (
        <ActivityIndicator size="large" />
      ) : errorMsg ? (
        <Text style={styles.error}>{errorMsg}</Text>
      ) : (
        <>
          <Text style={styles.location}>{addressText}</Text>
          <Text style={styles.weather}>{weatherText}</Text>
        </>
      )}
    </ScrollView>
  );
}

// スタイルシート
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 20,
  },
  location: {
    fontSize: 22,
    color: "#fff",
    marginBottom: 10,
  },
  weather: {
    fontSize: 20,
    color: "#fff",
  },
  error: {
    fontSize: 16,
    color: "red",
  },
});
