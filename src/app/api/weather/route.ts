import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type WeatherApiResponse = {
  location: {
    name: string;
    region: string;
    country: string;
    localtime: string;
  };
  current: {
    last_updated: string;
    temp_c: number;
    feelslike_c: number;
    is_day: number;
    precip_mm: number;
    cloud: number;
    condition: {
      text: string;
      code: number;
    };
  };
};

export async function GET(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Please sign in first." },
      { status: 401 },
    );
  }

  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "WEATHER_API_KEY is not configured." },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);

  const latitudeText = searchParams.get("latitude");
  const longitudeText = searchParams.get("longitude");

  const latitude = Number(latitudeText);
  const longitude = Number(longitudeText);

  if (
    !latitudeText?.trim() ||
    !longitudeText?.trim() ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return NextResponse.json(
      { error: "Valid latitude and longitude are required." },
      { status: 400 },
    );
  }

  try {
    const url = new URL(
      "https://api.weatherapi.com/v1/current.json",
    );

    url.searchParams.set("key", apiKey);
    url.searchParams.set("q", `${latitude},${longitude}`);
    url.searchParams.set("aqi", "no");

    const response = await fetch(url, {
      // Direct request for the initial comparison test.
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            "Weather provider request failed. Check your API key and account quota.",
        },
        { status: 502 },
      );
    }

    const result =
      (await response.json()) as WeatherApiResponse;

    if (!result.location || !result.current?.condition) {
      throw new Error("Invalid weather response.");
    }

    return NextResponse.json(
      {
        source: "WeatherAPI.com",
        city: result.location.name,
        region: result.location.region,
        country: result.location.country,
        localTime: result.location.localtime,
        updatedAt: result.current.last_updated,
        temperature: result.current.temp_c,
        feelsLike: result.current.feelslike_c,
        description: result.current.condition.text,
        conditionCode: result.current.condition.code,
        precipitationMm: result.current.precip_mm,
        cloudCover: result.current.cloud,
        isDay: result.current.is_day === 1,
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Weather is temporarily unavailable." },
      { status: 502 },
    );
  }
}