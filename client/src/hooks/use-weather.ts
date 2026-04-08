import { useState, useEffect } from "react";

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  weatherCode: number;
  condition: string;
  city: string;
  recommendation: string;
  suggestedSeason: "spring" | "summer" | "fall" | "winter";
}

export type WeatherState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "denied" }
  | { status: "error"; message: string }
  | { status: "success"; data: WeatherData };

function getCondition(code: number): string {
  if (code === 0) return "Clear sky";
  if (code <= 2) return "Mostly clear";
  if (code === 3) return "Overcast";
  if (code <= 48) return "Foggy";
  if (code <= 55) return "Drizzle";
  if (code <= 65) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Rain showers";
  if (code <= 86) return "Snow showers";
  return "Thunderstorm";
}

function getRecommendation(temp: number, code: number): string {
  const isRaining = (code >= 51 && code <= 65) || (code >= 80 && code <= 82);
  const isSnowing = (code >= 71 && code <= 77) || (code >= 85 && code <= 86);
  const isStorm = code >= 95;

  if (isStorm) return "Stormy — stay in or grab a heavy waterproof coat";
  if (isSnowing) return "Snowing — bundle up with warm layers and waterproof boots";
  if (isRaining && temp < 50) return "Cold rain — warm coat and waterproof layers recommended";
  if (isRaining) return "Rainy — bring a light rain jacket or umbrella";

  if (temp < 32) return "Freezing — heavy coat, hat, and gloves essential";
  if (temp < 45) return "Very cold — wear a warm coat and layers";
  if (temp < 55) return "Cold — a jacket or light coat is a good idea";
  if (temp < 65) return "Cool — a light layer should be enough";
  if (temp < 75) return "Comfortable — no coat needed today";
  if (temp < 85) return "Warm — light clothing is perfect";
  return "Hot — keep it light and breathable";
}

function getSuggestedSeason(temp: number): WeatherData["suggestedSeason"] {
  if (temp < 45) return "winter";
  if (temp < 62) return "fall";
  if (temp < 78) return "spring";
  return "summer";
}

export function useWeather(): [WeatherState, () => void] {
  const [state, setState] = useState<WeatherState>({ status: "idle" });

  const fetchWeather = async () => {
    if (!navigator.geolocation) {
      setState({ status: "error", message: "Geolocation not supported by your browser" });
      return;
    }

    setState({ status: "loading" });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const [weatherRes, geoRes] = await Promise.all([
            fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,weather_code&temperature_unit=fahrenheit`
            ),
            fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`,
              { headers: { "Accept-Language": "en" } }
            ),
          ]);

          if (!weatherRes.ok) throw new Error("Failed to fetch weather");

          const weatherJson = await weatherRes.json();
          const geoJson = geoRes.ok ? await geoRes.json() : null;

          const temp = Math.round(weatherJson.current.temperature_2m);
          const feelsLike = Math.round(weatherJson.current.apparent_temperature);
          const code = weatherJson.current.weather_code;

          const city =
            geoJson?.address?.city ||
            geoJson?.address?.town ||
            geoJson?.address?.village ||
            geoJson?.address?.county ||
            "Your location";

          setState({
            status: "success",
            data: {
              temperature: temp,
              feelsLike,
              weatherCode: code,
              condition: getCondition(code),
              city,
              recommendation: getRecommendation(temp, code),
              suggestedSeason: getSuggestedSeason(temp),
            },
          });
        } catch {
          setState({ status: "error", message: "Could not load weather data" });
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setState({ status: "denied" });
        } else {
          setState({ status: "error", message: "Could not get your location" });
        }
      },
      { timeout: 10000 }
    );
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  return [state, fetchWeather];
}
