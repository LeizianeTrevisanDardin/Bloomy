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
            left-[74%]
            top-[58%]
            w-[10%]
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
    </div>
  );
}