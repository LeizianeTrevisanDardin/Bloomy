import {
  NextResponse,
} from "next/server";

type AuroraApiResponse = {
  "Observation Time"?: string;
  "Forecast Time"?: string;
  coordinates?: number[][];
};

// =================================
// LONGITUDE HELPERS
// =================================

function normalizeLongitude(
  longitude: number,
) {
  return longitude < 0
    ? longitude + 360
    : longitude;
}

function getLongitudeDistance(
  firstLongitude: number,
  secondLongitude: number,
) {
  const difference =
    Math.abs(
      firstLongitude -
        secondLongitude,
    );

  return Math.min(
    difference,
    360 - difference,
  );
}

// =================================
// AURORA API ROUTE
// =================================

export async function GET(
  request: Request,
) {
  const { searchParams } =
    new URL(request.url);

  const latitude = Number(
    searchParams.get("latitude"),
  );

  const longitude = Number(
    searchParams.get("longitude"),
  );

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
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

  try {
    const response = await fetch(
      "https://services.swpc.noaa.gov/json/ovation_aurora_latest.json",
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(
        "Unable to load the NOAA aurora forecast.",
      );
    }

    const result =
      (await response.json()) as AuroraApiResponse;

    const coordinates =
      result.coordinates ?? [];

    const normalizedUserLongitude =
      normalizeLongitude(longitude);

    let probability = 0;

    for (const coordinate of coordinates) {
      const [
        coordinateLongitude,
        coordinateLatitude,
        coordinateProbability,
      ] = coordinate;

      if (
        typeof coordinateLongitude !==
          "number" ||
        typeof coordinateLatitude !==
          "number" ||
        typeof coordinateProbability !==
          "number"
      ) {
        continue;
      }

      const latitudeDistance =
        Math.abs(
          coordinateLatitude -
            latitude,
        );

      const longitudeDistance =
        getLongitudeDistance(
          coordinateLongitude,
          normalizedUserLongitude,
        );

      /*
       * Searches the NOAA points around
       * the user's approximate location.
       */
      if (
        latitudeDistance <= 2 &&
        longitudeDistance <= 3
      ) {
        probability = Math.max(
          probability,
          coordinateProbability,
        );
      }
    }

    return NextResponse.json({
      probability:
        Math.round(probability),

      forecastTime:
        result["Forecast Time"] ??
        null,

      observationTime:
        result[
          "Observation Time"
        ] ?? null,
    });
  } catch {
    /*
     * A NOAA failure should not prevent
     * regular weather from working.
     */
    return NextResponse.json({
      probability: 0,
      forecastTime: null,
      observationTime: null,
    });
  }
}