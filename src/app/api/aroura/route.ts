import { NextRequest, NextResponse } from "next/server";

type AuroraCoordinate = [
  number,
  number,
  number,
];

type NOAAAuroraResponse = {
  Observation Time?: string;
  Forecast Time?: string;
  coordinates?: AuroraCoordinate[];
};

function longitudeDistance(
  first: number,
  second: number,
) {
  const difference =
    Math.abs(first - second);

  return Math.min(
    difference,
    360 - difference,
  );
}

export async function GET(
  request: NextRequest,
) {
  const latitude = Number(
    request.nextUrl.searchParams.get(
      "latitude",
    ),
  );

  const receivedLongitude = Number(
    request.nextUrl.searchParams.get(
      "longitude",
    ),
  );

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(receivedLongitude)
  ) {
    return NextResponse.json(
      {
        error:
          "Latitude and longitude are required.",
      },
      {
        status: 400,
      },
    );
  }

  /*
   * NOAA stores longitude between 0 and 360.
   * Browser geolocation normally uses -180 to 180.
   */

  const longitude =
    receivedLongitude < 0
      ? receivedLongitude + 360
      : receivedLongitude;

  try {
    const response = await fetch(
      "https://services.swpc.noaa.gov/json/ovation_aurora_latest.json",
      {
        next: {
          revalidate: 300,
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        "NOAA request failed.",
      );
    }

    const data =
      (await response.json()) as NOAAAuroraResponse;

    const coordinates =
      data.coordinates ?? [];

    let probability = 0;

    for (const coordinate of coordinates) {
      const [
        pointLongitude,
        pointLatitude,
        pointProbability,
      ] = coordinate;

      const latitudeDifference =
        Math.abs(
          pointLatitude - latitude,
        );

      const longitudeDifference =
        longitudeDistance(
          pointLongitude,
          longitude,
        );

      /*
       * Look at a small area around the user rather
       * than relying on one exact NOAA grid point.
       */

      if (
        latitudeDifference <= 4 &&
        longitudeDifference <= 5
      ) {
        probability = Math.max(
          probability,
          Number(pointProbability) || 0,
        );
      }
    }

    return NextResponse.json({
      probability: Math.round(
        probability,
      ),
      observationTime:
        data["Observation Time"] ?? null,
      forecastTime:
        data["Forecast Time"] ?? null,
    });
  } catch (error) {
    console.error(
      "Aurora forecast error:",
      error,
    );

    /*
     * Aurora failure should not break regular weather.
     */

    return NextResponse.json({
      probability: 0,
      observationTime: null,
      forecastTime: null,
    });
  }
}