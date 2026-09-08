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

// Response returned by our server route; the API key stays on the server.
type WeatherApiResponse = {
  source: string;
  city: string;
  region: string;
  country: string;
  localTime: string;
  updatedAt: string;
  temperature: number;
  feelsLike: number;
  description: string;
  conditionCode: number;
  precipitationMm: number;
  cloudCover: number;
  isDay: boolean;
};

// Keep the existing WMO-style weatherCode used by the dashboard.
// These are visual categories, not an exact equivalence between providers.
function normalizeWeatherApi(result: WeatherApiResponse): OpenMeteoResponse {
  const code = result.conditionCode;
  let weatherCode = 3;

  if (code === 1000) weatherCode = 0;
  else if (code === 1003) weatherCode = 2;
  else if ([1030, 1135, 1147].includes(code)) weatherCode = 45;
  else if ([
    1066, 1069, 1114, 1117, 1204, 1207,
    1210, 1213, 1216, 1219, 1222, 1225, 1237,
    1249, 1252, 1255, 1258, 1261, 1264, 1279, 1282,
  ].includes(code)) weatherCode = 71;
  else if ([1087, 1273, 1276].includes(code)) weatherCode = 95;
  else if ([1072, 1150, 1153, 1168, 1171].includes(code)) weatherCode = 51;
  else if ([
    1063, 1180, 1183, 1186, 1189, 1192, 1195,
    1198, 1201, 1240, 1243, 1246,
  ].includes(code)) weatherCode = 61;

  return {
    current: {
      time: result.localTime.replace(" ", "T"),
      temperature_2m: result.temperature,
      apparent_temperature: result.feelsLike,
      is_day: result.isDay ? 1 : 0,
      precipitation: result.precipitationMm,
      // This route reports total precipitation only, not separate amounts.
      rain: 0,
      showers: 0,
      snowfall: 0,
      weather_code: weatherCode,
      cloud_cover: result.cloudCover,
    },
    daily: { sunrise: [], sunset: [] },
  };
}

function isValidWeatherApi(
  result: WeatherApiResponse | null,
): result is WeatherApiResponse {
  return Boolean(
    result &&
    typeof result.localTime === "string" &&
    typeof result.description === "string" &&
    typeof result.isDay === "boolean" &&
    Number.isFinite(result.temperature) &&
    Number.isFinite(result.feelsLike) &&
    Number.isFinite(result.conditionCode) &&
    Number.isFinite(result.precipitationMm) &&
    Number.isFinite(result.cloudCover),
  );
}

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

const WEATHER_CACHE_KEY = "bloomy-weather-v4-weatherapi";
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
    !cached.snapshot?.weather ||
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

async function fetchJson<T>(
  url: string,
  parentSignal: AbortSignal,
): Promise<T | null> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  parentSignal.addEventListener("abort", abort, { once: true });
  if (parentSignal.aborted) controller.abort();
  const timeout = window.setTimeout(abort, 12_000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
    });
    return await readJsonSafely<T>(response);
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeout);
    parentSignal.removeEventListener("abort", abort);
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
  const snowCodes = [
    71, 73, 75, 77, 85, 86,
  ];

  const rainCodes = [
    51, 53, 55, 56, 57,
    61, 63, 65, 66, 67,
    80, 81, 82,
    95, 96, 99,
  ];

  // =================================
  // AURORA
  // =================================
  // At night, aurora takes priority
  // over rain/clouds when probability
  // is at least 10%.

  if (
    !isDay &&
    auroraProbability >= 10
  ) {
    return "aurora";
  }

  // =================================
  // SNOW
  // =================================

  if (
    snowfall > 0 ||
    snowCodes.includes(weatherCode)
  ) {
    return "snowy";
  }

  // =================================
  // RAIN
  // =================================

  if (
    precipitation > 0 ||
    rain > 0 ||
    showers > 0 ||
    rainCodes.includes(weatherCode)
  ) {
    return "rainy";
  }

  // =================================
  // NIGHT
  // =================================

  if (!isDay) {
    return "night";
  }

  // =================================
  // CLOUDY
  // =================================

  if (
    [2, 3, 45, 48].includes(weatherCode) ||
    cloudCover >= 40
  ) {
    return "cloudy";
  }

  // =================================
  // SUNRISE / SUNSET
  // =================================

  const currentMinutes =
    minutesFromDateString(currentTime);

  const sunriseMinutes =
    minutesFromDateString(sunrise);

  const sunsetMinutes =
    minutesFromDateString(sunset);

  if (
    sunriseMinutes > 0 &&
    currentMinutes >= sunriseMinutes - 45 &&
    currentMinutes <= sunriseMinutes + 75
  ) {
    return "sunrise";
  }

  if (
    sunsetMinutes > 0 &&
    currentMinutes >= sunsetMinutes - 75 &&
    currentMinutes <= sunsetMinutes + 45
  ) {
    return "sunset";
  }

  // =================================
  // SUNNY
  // =================================

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
  providerDescription?: string,
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
    sunrise: result.daily?.sunrise?.[0],
    sunset: result.daily?.sunset?.[0],
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
    description: providerDescription || (scene === "aurora" ? "Aurora tonight" : details.description),
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

      const { latitude, longitude } = location;
      const query = `latitude=${latitude}&longitude=${longitude}`;

      // Open-Meteo supplies astronomy and serves as a weather fallback.
      const openMeteoRequest = fetchJson<OpenMeteoResponse>(
        createWeatherUrl(latitude, longitude),
        controller.signal,
      );
      const primaryRequest = fetchJson<WeatherApiResponse>(
        `/api/weather?${query}`,
        controller.signal,
      );
      const locationRequest = location.usedFallback
        ? Promise.resolve(null)
        : fetchJson<LocationResponse>(
            createLocationUrl(latitude, longitude),
            controller.signal,
          );
      const auroraRequest = fetchJson<AuroraResponse>(
        `/api/aurora?${query}`,
        controller.signal,
      );

      const primaryResult = await primaryRequest;
      const primary = isValidWeatherApi(primaryResult) ? primaryResult : null;
      const weatherResult = primary
        ? normalizeWeatherApi(primary)
        : await openMeteoRequest;

      if (!weatherResult?.current) throw new Error("Unable to read weather.");
      if (requestId !== requestIdRef.current) return;

      const firstSnapshot = createWeatherData(
        weatherResult,
        primary?.city || (location.usedFallback ? CALGARY_LOCATION.city : "Your location"),
        location.usedFallback ? CALGARY_LOCATION.countryCode : "",
        0,
        primary?.description,
      );

      await preloadScene(firstSnapshot.automaticScene);

      if (requestId !== requestIdRef.current) return;

      commitSnapshot(firstSnapshot);
      setLoading(false);

      // Enrich the primary result without replacing its current weather.
      void Promise.all([
        locationRequest,
        auroraRequest,
        openMeteoRequest,
      ]).then(async ([locationResult, auroraResult, astronomyResult]) => {
        if (requestId !== requestIdRef.current) return;

        const city =
          primary?.city ||
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
          {
            ...weatherResult,
            daily: astronomyResult?.daily ?? weatherResult.daily,
          },
          city,
          countryCode,
          auroraResult?.probability ?? 0,
          primary?.description,
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
      }).catch(() => {
        // Keep the first usable result if optional enrichment fails.
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
      requestIdRef.current += 1;
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

