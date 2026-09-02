"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  Scene,
  WeatherData,
} from "@/types/weather";

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
  forecastTime?: string | null;
  observationTime?: string | null;
};

const CALGARY_LOCATION = {
  latitude: 51.0447,
  longitude: -114.0719,
  city: "Calgary",
  countryCode: "CA",
};

/*
 * Safely reads an API response.
 * If an API returns text instead of JSON,
 * Bloomy continues running normally.
 */
async function readJsonSafely<T>(
  response: Response | null,
): Promise<T | null> {
  if (!response || !response.ok) {
    return null;
  }

  try {
    const responseText =
      await response.text();

    if (!responseText) {
      return null;
    }

    return JSON.parse(
      responseText,
    ) as T;
  } catch {
    return null;
  }
}

function minutesFromDateString(
  value?: string,
) {
  if (!value) {
    return 0;
  }

  const time =
    value.split("T")[1];

  if (!time) {
    return 0;
  }

  const [hours, minutes] =
    time.split(":").map(Number);

  return hours * 60 + minutes;
}

function getWeatherDescription(
  code: number,
) {
  if (code === 0) {
    return {
      description: "Clear",
      icon: "☀️",
    };
  }

  if ([1, 2].includes(code)) {
    return {
      description: "Partly cloudy",
      icon: "🌤️",
    };
  }

  if (code === 3) {
    return {
      description: "Cloudy",
      icon: "☁️",
    };
  }

  if ([45, 48].includes(code)) {
    return {
      description: "Foggy",
      icon: "🌫️",
    };
  }

  if (
    [
      51,
      53,
      55,
      56,
      57,
      61,
      63,
      65,
      66,
      67,
      80,
      81,
      82,
    ].includes(code)
  ) {
    return {
      description: "Rainy",
      icon: "🌧️",
    };
  }

  if (
    [
      71,
      73,
      75,
      77,
      85,
      86,
    ].includes(code)
  ) {
    return {
      description: "Snowy",
      icon: "❄️",
    };
  }

  if ([95, 96, 99].includes(code)) {
    return {
      description: "Thunderstorm",
      icon: "⛈️",
    };
  }

  return {
    description: "Clear",
    icon: "🌤️",
  };
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
    71,
    73,
    75,
    77,
    85,
    86,
  ];

  const rainCodes = [
    51,
    53,
    55,
    56,
    57,
    61,
    63,
    65,
    66,
    67,
    80,
    81,
    82,
    95,
    96,
    99,
  ];

  const cloudyCodes = [
    2,
    3,
    45,
    48,
  ];

  // =================================
  // 1. SNOW
  // =================================

  if (
    snowfall > 0 ||
    snowCodes.includes(weatherCode)
  ) {
    return "snowy";
  }

  // =================================
  // 2. RAIN OR THUNDERSTORM
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
  // 3. AURORA
  // =================================

  if (
    !isDay &&
    auroraProbability >= 10 &&
    cloudCover <= 65
  ) {
    return "aurora";
  }

  // =================================
  // 4. NIGHT
  // =================================

  if (!isDay) {
    return "night";
  }

  const currentMinutes =
    minutesFromDateString(
      currentTime,
    );

  const sunriseMinutes =
    minutesFromDateString(
      sunrise,
    );

  const sunsetMinutes =
    minutesFromDateString(
      sunset,
    );

  // =================================
  // 5. SUNRISE
  // Begins 45 minutes before sunrise
  // and ends 75 minutes after sunrise.
  // =================================

  const isSunriseTime =
    sunriseMinutes > 0 &&
    currentMinutes >=
      sunriseMinutes - 45 &&
    currentMinutes <=
      sunriseMinutes + 75;

  if (isSunriseTime) {
    return "sunrise";
  }

  // =================================
  // 6. SUNSET
  // Begins 75 minutes before sunset
  // and remains until the API changes
  // isDay to false.
  // =================================

  const isSunsetTime =
    sunsetMinutes > 0 &&
    currentMinutes >=
      sunsetMinutes - 75;

  if (isSunsetTime) {
    return "sunset";
  }

  // =================================
  // 7. CLOUDY
  // =================================

  if (
    cloudyCodes.includes(weatherCode) ||
    cloudCover >= 70
  ) {
    return "cloudy";
  }

  // =================================
  // 8. SUNNY
  // =================================

  return "sunny";
}

function getBrowserLocation() {
  return new Promise<{
    latitude: number;
    longitude: number;
    usedFallback: boolean;
  }>((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        latitude:
          CALGARY_LOCATION.latitude,
        longitude:
          CALGARY_LOCATION.longitude,
        usedFallback: true,
      });

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude:
            position.coords.latitude,
          longitude:
            position.coords.longitude,
          usedFallback: false,
        });
      },
      () => {
        resolve({
          latitude:
            CALGARY_LOCATION.latitude,
          longitude:
            CALGARY_LOCATION.longitude,
          usedFallback: true,
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 10_000,
        maximumAge:
          30 * 60 * 1000,
      },
    );
  });
}

export function useLocalWeather() {
  const [weather, setWeather] =
    useState<WeatherData | null>(
      null,
    );

  const [
    automaticScene,
    setAutomaticScene,
  ] = useState<Scene>("sunny");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadWeather =
    useCallback(async () => {
      try {
        setError(null);

        const location =
          await getBrowserLocation();

        const latitude =
          location.latitude;

        const longitude =
          location.longitude;

        /*
         * Open-Meteo weather URL.
         */
        const weatherUrl = new URL(
          "https://api.open-meteo.com/v1/forecast",
        );

        weatherUrl.searchParams.set(
          "latitude",
          latitude.toString(),
        );

        weatherUrl.searchParams.set(
          "longitude",
          longitude.toString(),
        );

        weatherUrl.searchParams.set(
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

        weatherUrl.searchParams.set(
          "daily",
          "sunrise,sunset",
        );

        weatherUrl.searchParams.set(
          "timezone",
          "auto",
        );

        weatherUrl.searchParams.set(
          "forecast_days",
          "1",
        );

        /*
         * BigDataCloud location-name URL.
         */
        const locationUrl = new URL(
          "https://api.bigdatacloud.net/data/reverse-geocode-client",
        );

        locationUrl.searchParams.set(
          "latitude",
          latitude.toString(),
        );

        locationUrl.searchParams.set(
          "longitude",
          longitude.toString(),
        );

        locationUrl.searchParams.set(
          "localityLanguage",
          "en",
        );

        const weatherRequest = fetch(
          weatherUrl.toString(),
        );

        const locationRequest:
          Promise<Response | null> =
          location.usedFallback
            ? Promise.resolve(null)
            : fetch(
                locationUrl.toString(),
              );

        const auroraRequest = fetch(
          `/api/aurora?latitude=${latitude}&longitude=${longitude}`,
        );

        const [
          weatherResponse,
          locationResponse,
          auroraResponse,
        ] = await Promise.all([
          weatherRequest,
          locationRequest,
          auroraRequest,
        ]);

        const weatherResult =
          await readJsonSafely<OpenMeteoResponse>(
            weatherResponse,
          );

        if (!weatherResult) {
          throw new Error(
            "Unable to read the weather response.",
          );
        }

        /*
         * Calgary remains the fallback if the
         * city-name API fails.
         */
        let city =
          CALGARY_LOCATION.city;

        let countryCode =
          CALGARY_LOCATION.countryCode;

        const locationResult =
          await readJsonSafely<LocationResponse>(
            locationResponse,
          );

        if (locationResult) {
          city =
            locationResult.city ||
            locationResult.locality ||
            locationResult
              .principalSubdivision ||
            "Your location";

          countryCode =
            locationResult.countryCode ||
            "";
        }

        /*
         * A NOAA failure must never prevent
         * regular weather from loading.
         */
        let auroraProbability = 0;

        const auroraResult =
          await readJsonSafely<AuroraResponse>(
            auroraResponse,
          );

        if (auroraResult) {
          auroraProbability =
            auroraResult.probability ??
            0;
        }

        const current =
          weatherResult.current;

        const weatherDetails =
          getWeatherDescription(
            current.weather_code,
          );

        const nextScene =
          getAutomaticScene({
            weatherCode:
              current.weather_code,

            isDay:
              current.is_day === 1,

            precipitation:
              current.precipitation,

            rain:
              current.rain,

            showers:
              current.showers,

            snowfall:
              current.snowfall,

            cloudCover:
              current.cloud_cover,

            currentTime:
              current.time,

            sunrise:
              weatherResult.daily
                .sunrise[0],

            sunset:
              weatherResult.daily
                .sunset[0],

            auroraProbability,
          });

        setWeather({
          temperature:
            current.temperature_2m,

          apparentTemperature:
            current
              .apparent_temperature,

          weatherCode:
            current.weather_code,

          isDay:
            current.is_day === 1,

          precipitation:
            current.precipitation,

          rain:
            current.rain,

          showers:
            current.showers,

          snowfall:
            current.snowfall,

          cloudCover:
            current.cloud_cover,

          city,
          countryCode,

          description:
            nextScene === "aurora"
              ? "Aurora tonight"
              : weatherDetails
                  .description,

          icon:
            nextScene === "aurora"
              ? "🌌"
              : weatherDetails.icon,

          auroraProbability,
        });

        setAutomaticScene(
          nextScene,
        );
      } catch {
        /*
         * Keep the previous/default scene if one
         * of the weather services is unavailable.
         */
        setError(
          "Weather is temporarily unavailable.",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadWeather();

    /*
     * Refresh every ten minutes.
     */
    const interval =
      window.setInterval(
        loadWeather,
        10 * 60 * 1000,
      );

    return () => {
      window.clearInterval(
        interval,
      );
    };
  }, [loadWeather]);

  return {
    weather,
    automaticScene,
    loading,
    error,
    refreshWeather: loadWeather,
  };
}