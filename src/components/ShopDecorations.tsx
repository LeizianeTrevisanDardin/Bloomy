"use client";

import {
  useEquippedItems,
} from "@/hooks/useEquippedItems";

export default function ShopDecorations() {
  const {
    getEquippedItem,
    loading,
  } = useEquippedItems();

  const gardenFlower =
    getEquippedItem(
      "garden_flower",
    );

  const gardenLight =
    getEquippedItem(
      "garden_light",
    );

  if (loading) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0">
      {/* ================================= */}
      {/* GARDEN FLOWER */}
      {/* ================================= */}

      {gardenFlower && (
        <div
          className="
            absolute
            left-[78%]
            top-[61%]
            w-[11%]
          "
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/bloomy/garden-flower.png"
            alt=""
            draggable={false}
            className="
              h-auto
              w-full
              select-none
              object-contain
            "
          />
        </div>
      )}

      {/* ================================= */}
      {/* GARDEN LANTERN */}
      {/* ================================= */}

      {gardenLight && (
        <div
          className="
            absolute
            left-[75%]
            top-[50%]
            w-[8%]
          "
        >
          {/* MAIN GROUND LIGHT */}

          <div
            className="
              pointer-events-none
              absolute
              left-[48%]
              top-[96%]
              z-0
              h-[45%]
              w-[220%]
              -translate-x-1/2
              rounded-[50%]
              bg-amber-300/28
              blur-2xl
            "
          />

          {/* SECOND GROUND LIGHT */}

          <div
            className="
              pointer-events-none
              absolute
              left-[50%]
              top-[112%]
              z-0
              h-[34%]
              w-[165%]
              -translate-x-1/2
              rounded-[50%]
              bg-yellow-200/18
              blur-xl
            "
          />

          {/* LANTERN */}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/bloomy/garden-lantern.png"
            alt=""
            draggable={false}
            className="
              relative
              z-10
              h-auto
              w-full
              select-none
              object-contain
            "
          />
        </div>
      )}
    
    </div>
  );
}