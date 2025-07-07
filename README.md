<<<<<<< HEAD

# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

   =======

# mobisapo_prototype

# [機能]

# weather.tsx:

読み込んだ際に、現在の天気を取得して表示。
上にスワイプしてリロードが可能

# traveltime.tsx:

目的地を入力し、現在地から目的地までの所要時間・マップ上に線でのルート表示

# 注意

apiapikey の都合で鍵を保存している config.ts がこのリポジトリにないので、
動かす際にはルートディレクトリ上に config.ts を作成し、

export const API_KEY = "";
export const GOOGLE_MAPS_API_KEY = "";

こちらをコピペしてもらい、自身で作成した apikey を入力してください
上が open weathermap API
下が google api key になります

また google api key 関連で
Maps JavaScript API
Directions API
Geocoding API
Places API（任意）
を有効してもらわないと動かない可能性があるので注意
