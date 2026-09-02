export type Scene =
  | "sunny"
  | "cloudy"
  | "rainy"
  | "snowy"
  | "sunrise"
  | "sunset"
  | "night"
  | "aurora";

export type WeatherData = {
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  isDay: boolean;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
  cloudCover: number;
  city: string;
  countryCode: string;
  description: string;
  icon: string;
  auroraProbability: number;
};