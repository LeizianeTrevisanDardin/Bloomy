"use client";

import type {
  Scene,
  WeatherData,
} from "@/types/weather";

type WeatherCardProps = {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  automaticScene: Scene;
};

export default function WeatherCard({
  weather,
  loading,
  error,
  automaticScene,
}: WeatherCardProps) {
  const cardClassName =
    "absolute right-2 top-[62px] z-40 w-[132px] rounded-xl border border-white/10 bg-black/60 p-2.5 shadow-xl backdrop-blur-xl sm:right-4 sm:top-[74px] sm:w-[205px] sm:rounded-2xl sm:p-4";

  // =================================
  // LOADING
  // =================================

  if (loading) {
    return (
      <div className={cardClassName}>
        <div className="animate-pulse">
          <div className="h-6 w-20 rounded bg-white/10 sm:h-7 sm:w-24" />

          <div className="mt-3 h-3 w-full rounded bg-white/10" />

          <div className="mt-2 hidden h-3 w-20 rounded bg-white/10 sm:block" />
        </div>
      </div>
    );
  }

  // =================================
  // ERROR
  // =================================

  if (error || !weather) {
    return (
      <div className={cardClassName}>
        <p className="text-xs text-zinc-300 sm:text-sm">
          🌤️ Weather unavailable
        </p>

        <p className="mt-2 hidden text-xs leading-5 text-zinc-500 sm:block">
          Bloomy will continue using the default scene.
        </p>
      </div>
    );
  }

  // =================================
  // WEATHER
  // =================================

  return (
    <div className={cardClassName}>
      <div className="flex items-start gap-2 sm:gap-3">
        <span
          aria-hidden="true"
          className="shrink-0 text-2xl sm:text-4xl"
        >
          {weather.icon}
        </span>

        <div className="min-w-0">
          <p className="text-lg font-semibold text-white sm:text-2xl">
            {Math.round(weather.temperature)}
            °C
          </p>

          <p className="truncate text-[10px] text-zinc-300 sm:text-xs">
            {weather.description}
          </p>

          <p className="hidden truncate text-xs text-zinc-400 sm:block">
            {weather.city}

            {weather.countryCode
              ? `, ${weather.countryCode}`
              : ""}
          </p>
        </div>
      </div>

      <div className="my-3 hidden h-px bg-white/10 sm:block" />

      <p className="hidden text-xs leading-5 text-zinc-300 sm:block">
        Feels like{" "}
        {Math.round(
          weather.apparentTemperature,
        )}
        °C · Clouds{" "}
        {Math.round(weather.cloudCover)}%
      </p>

      {!weather.isDay &&
        weather.auroraProbability > 0 && (
          <p className="mt-1 text-[10px] text-emerald-300 sm:mt-2 sm:text-xs">
            🌌 Aurora{" "}
            {weather.auroraProbability}%
          </p>
        )}

      {/* TEMPORARY DEBUG INFORMATION */}

      <div className="mt-2 border-t border-white/10 pt-2">
        <p className="truncate text-[9px] capitalize text-amber-300 sm:text-[10px]">
          Scene: {automaticScene}
        </p>

        <p className="hidden text-[10px] text-zinc-500 sm:block">
          {weather.isDay ? "Day" : "Night"}
          {" · "}
          Clouds{" "}
          {Math.round(weather.cloudCover)}%
        </p>
      </div>
    </div>
  );
}