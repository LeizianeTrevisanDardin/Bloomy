"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type { Scene, WeatherData } from "@/types/weather";

type OpenMeteoResponse = {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    is_day: number;
    precipitation: number;
    rain: number;
    showers: number;
    snowfall: number;
    weather_code: number;
    cloud_cover: number;
  };
  daily: {
    sunrise: string[];
    sunset: string[];
  };
};

type LocationResponse = {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  countryCode?: string;
};

type AuroraResponse = {
  probability?: number;
};

type Coordinates = {
  latitude: number;
  longitude: number;
  usedFallback: boolean;
};

type WeatherSnapshot = {
  weather: WeatherData | null;
  automaticScene: Scene;
};

type WeatherCache = {
  savedAt: number;
  snapshot: WeatherSnapshot;
};

type LocationCache = {
  savedAt: number;
  latitude: number;
  longitude: number;
};

const CALGARY_LOCATION = {
  latitude: 51.0447,
  longitude: -114.0719,
  city: "Calgary",
  countryCode: "CA",
};

const WEATHER_CACHE_KEY = "bloomy-weather-v2";
const LOCATION_CACHE_KEY = "bloomy-location-v1";
const WEATHER_CACHE_TIME = 5 * 60 * 1000;
const LOCATION_CACHE_TIME = 5 * 60 * 1000;

function readStorage<T>(key: string): T | null {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Weather still works when browser storage is unavailable.
  }
}

function readWeatherCache(): WeatherSnapshot | null {
  const cached = readStorage<WeatherCache>(WEATHER_CACHE_KEY);

  if (
    !cached ||
    !cached.snapshot.weather ||
    Date.now() - cached.savedAt > WEATHER_CACHE_TIME
  ) {
    return null;
  }

  return cached.snapshot;
}

function saveWeatherCache(snapshot: WeatherSnapshot) {
  writeStorage(WEATHER_CACHE_KEY, {
    savedAt: Date.now(),
    snapshot,
  } satisfies WeatherCache);
}

function getBrowserLocation(): Promise<Coordinates> {
  const cached = readStorage<LocationCache>(LOCATION_CACHE_KEY);

  if (
    cached &&
    Date.now() - cached.savedAt <= LOCATION_CACHE_TIME
  ) {
    return Promise.resolve({
      latitude: cached.latitude,
      longitude: cached.longitude,
      usedFallback: false,
    });
  }

  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ ...CALGARY_LOCATION, usedFallback: true });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        writeStorage(LOCATION_CACHE_KEY, {
          ...coordinates,
          savedAt: Date.now(),
        } satisfies LocationCache);

        resolve({ ...coordinates, usedFallback: false });
      },
      () => {
        resolve({ ...CALGARY_LOCATION, usedFallback: true });
      },
      {
        enableHighAccuracy: true,
        timeout: 15_000,
        maximumAge: 5 * 60 * 1000,
      },
    );
  });
}

async function readJsonSafely<T>(
  response: Response | null,
): Promise<T | null> {
  if (!response?.ok) return null;

  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function minutesFromDateString(value?: string) {
  const time = value?.split("T")[1];
  if (!time) return 0;

  const [hours, minutes] = time.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 0;

  return hours * 60 + minutes;
}

function getWeatherDescription(code: number) {
  if (code === 0) return { description: "Clear", icon: "☀️" };
  if ([1, 2].includes(code)) {
    return { description: "Partly cloudy", icon: "🌤️" };
  }
  if (code === 3) return { description: "Cloudy", icon: "☁️" };
  if ([45, 48].includes(code)) {
    return { description: "Foggy", icon: "🌫️" };
  }
  if (
    [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)
  ) {
    return { description: "Rainy", icon: "🌧️" };
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { description: "Snowy", icon: "❄️" };
  }
  if ([95, 96, 99].includes(code)) {
    return { description: "Thunderstorm", icon: "⛈️" };
  }

  return { description: "Clear", icon: "🌤️" };
}

function getAutomaticScene({
  weatherCode,
  isDay,
  precipitation,
  rain,
  showers,
  snowfall,
  cloudCover,
  currentTime,
  sunrise,
  sunset,
  auroraProbability,
}: {
  weatherCode: number;
  isDay: boolean;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
  cloudCover: number;
  currentTime: string;
  sunrise?: string;
  sunset?: string;
  auroraProbability: number;
}): Scene {
  const snowCodes = [71, 73, 75, 77, 85, 86];
  const rainCodes = [
    51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99,
  ];

  if (snowfall > 0 || snowCodes.includes(weatherCode)) return "snowy";

  if (
    precipitation > 0 ||
    rain > 0 ||
    showers > 0 ||
    rainCodes.includes(weatherCode)
  ) {
    return "rainy";
  }

  if (!isDay && auroraProbability >= 10 && cloudCover <= 65) {
    return "aurora";
  }

  if (!isDay) return "night";

  const currentMinutes = minutesFromDateString(currentTime);
  const sunriseMinutes = minutesFromDateString(sunrise);
  const sunsetMinutes = minutesFromDateString(sunset);

  if (
    sunriseMinutes > 0 &&
    currentMinutes >= sunriseMinutes - 45 &&
    currentMinutes <= sunriseMinutes + 75
  ) {
    return "sunrise";
  }

  if (
    sunsetMinutes > 0 &&
    currentMinutes >= sunsetMinutes - 75
  ) {
    return "sunset";
  }

  if ([2, 3, 45, 48].includes(weatherCode) || cloudCover >= 40) {
    return "cloudy";
  }

  return "sunny";
}

function createWeatherUrl(latitude: number, longitude: number) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");

  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "apparent_temperature",
      "is_day",
      "precipitation",
      "rain",
      "showers",
      "snowfall",
      "weather_code",
      "cloud_cover",
    ].join(","),
  );
  url.searchParams.set("daily", "sunrise,sunset");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "1");

  return url.toString();
}

function createLocationUrl(latitude: number, longitude: number) {
  const url = new URL(
    "https://api.bigdatacloud.net/data/reverse-geocode-client",
  );

  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("localityLanguage", "en");

  return url.toString();
}

function createWeatherData(
  result: OpenMeteoResponse,
  city: string,
  countryCode: string,
  auroraProbability: number,
) {
  const current = result.current;
  const isDay = current.is_day === 1;

  const scene = getAutomaticScene({
    weatherCode: current.weather_code,
    isDay,
    precipitation: current.precipitation,
    rain: current.rain,
    showers: current.showers,
    snowfall: current.snowfall,
    cloudCover: current.cloud_cover,
    currentTime: current.time,
    sunrise: result.daily.sunrise[0],
    sunset: result.daily.sunset[0],
    auroraProbability,
  });

  const details = getWeatherDescription(current.weather_code);

  const weather: WeatherData = {
    temperature: current.temperature_2m,
    apparentTemperature: current.apparent_temperature,
    weatherCode: current.weather_code,
    isDay,
    precipitation: current.precipitation,
    rain: current.rain,
    showers: current.showers,
    snowfall: current.snowfall,
    cloudCover: current.cloud_cover,
    city,
    countryCode,
    description: scene === "aurora" ? "Aurora tonight" : details.description,
    icon: scene === "aurora" ? "🌌" : details.icon,
    auroraProbability,
  };

  return { weather, automaticScene: scene } satisfies WeatherSnapshot;
}

function preloadScene(scene: Scene) {
  return new Promise<void>((resolve) => {
    const image = new Image();
    const timeout = window.setTimeout(resolve, 1800);

    const finish = () => {
      window.clearTimeout(timeout);
      resolve();
    };

    image.onload = finish;
    image.onerror = finish;
    image.src = `/bloomy/${scene}.webp`;

    if (image.complete) finish();
  });
}

export function useLocalWeather() {
  const [snapshot, setSnapshot] = useState<WeatherSnapshot>({
    weather: null,
    automaticScene: "sunny",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestIdRef = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);
  const hasWeatherRef = useRef(false);

  const commitSnapshot = useCallback((nextSnapshot: WeatherSnapshot) => {
    hasWeatherRef.current = Boolean(nextSnapshot.weather);
    setSnapshot(nextSnapshot);
    saveWeatherCache(nextSnapshot);
  }, []);

  const loadWeather = useCallback(async (showLoading = true) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    if (showLoading && !hasWeatherRef.current) setLoading(true);
    setError(null);

    try {
      const location = await getBrowserLocation();

      if (requestId !== requestIdRef.current) return;

      const weatherRequest = fetch(
        createWeatherUrl(location.latitude, location.longitude),
        { signal: controller.signal },
      );

      const locationRequest: Promise<Response | null> = location.usedFallback
        ? Promise.resolve(null)
        : fetch(
            createLocationUrl(location.latitude, location.longitude),
            { signal: controller.signal },
          ).catch(() => null);

      const auroraRequest: Promise<Response | null> = fetch(
        `/api/aurora?latitude=${location.latitude}&longitude=${location.longitude}`,
        { signal: controller.signal },
      ).catch(() => null);

      // Only the essential weather request blocks the first result.
      const weatherResult = await readJsonSafely<OpenMeteoResponse>(
        await weatherRequest,
      );

      if (!weatherResult) throw new Error("Unable to read weather.");
      if (requestId !== requestIdRef.current) return;

      const firstSnapshot = createWeatherData(
        weatherResult,
        location.usedFallback ? CALGARY_LOCATION.city : "Your location",
        location.usedFallback ? CALGARY_LOCATION.countryCode : "",
        0,
      );

      await preloadScene(firstSnapshot.automaticScene);

      if (requestId !== requestIdRef.current) return;

      commitSnapshot(firstSnapshot);
      setLoading(false);

      // City and aurora improve the result without blocking the dashboard.
      void Promise.all([
        locationRequest.then((response) =>
          readJsonSafely<LocationResponse>(response),
        ),
        auroraRequest.then((response) =>
          readJsonSafely<AuroraResponse>(response),
        ),
      ]).then(async ([locationResult, auroraResult]) => {
        if (requestId !== requestIdRef.current) return;

        const city =
          locationResult?.city ||
          locationResult?.locality ||
          locationResult?.principalSubdivision ||
          firstSnapshot.weather?.city ||
          "Your location";

        const countryCode =
          locationResult?.countryCode ||
          firstSnapshot.weather?.countryCode ||
          "";

        const improvedSnapshot = createWeatherData(
          weatherResult,
          city,
          countryCode,
          auroraResult?.probability ?? 0,
        );

        if (
          improvedSnapshot.automaticScene !==
          firstSnapshot.automaticScene
        ) {
          await preloadScene(improvedSnapshot.automaticScene);
        }

        if (requestId === requestIdRef.current) {
          commitSnapshot(improvedSnapshot);
        }
      });
    } catch (loadError) {
      if (
        requestId === requestIdRef.current &&
        !(loadError instanceof DOMException && loadError.name === "AbortError")
      ) {
        setError("Weather is temporarily unavailable.");
        setLoading(false);
      }
    }
  }, [commitSnapshot]);

  useEffect(() => {
    const startTimeout = window.setTimeout(() => {
      const cachedSnapshot = readWeatherCache();

      if (cachedSnapshot) {
        hasWeatherRef.current = true;
        setSnapshot(cachedSnapshot);
        setLoading(false);
      }

      void loadWeather(!cachedSnapshot);
    }, 0);

    const interval = window.setInterval(() => {
      void loadWeather(false);
    }, WEATHER_CACHE_TIME);

    return () => {
      window.clearTimeout(startTimeout);
      window.clearInterval(interval);
      controllerRef.current?.abort();
    };
  }, [loadWeather]);

  return {
    weather: snapshot.weather,
    automaticScene: snapshot.automaticScene,
    loading,
    error,
    refreshWeather: () => loadWeather(false),
  };
}
