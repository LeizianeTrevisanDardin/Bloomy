// src/hooks/useEquippedItems.ts

"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  createClient,
} from "@/lib/supabase/client";

export type EquippedShopItem = {
  id: string;
  name: string;
  slot: string;
  preview_url: string | null;
  asset_manifest: Record<
    string,
    unknown
  > | null;
};

type EquippedRow = {
  slot: string;

  shop_items:
    | {
        id: string;
        name: string;
        slot: string;
        preview_url:
          | string
          | null;
        asset_manifest:
          | Record<
              string,
              unknown
            >
          | null;
      }
    | {
        id: string;
        name: string;
        slot: string;
        preview_url:
          | string
          | null;
        asset_manifest:
          | Record<
              string,
              unknown
            >
          | null;
      }[]
    | null;
};

function normalizeEquippedRows(
  rows: EquippedRow[],
): EquippedShopItem[] {
  return rows.flatMap(
    (row) => {
      if (!row.shop_items) {
        return [];
      }

      const shopItem =
        Array.isArray(
          row.shop_items,
        )
          ? row.shop_items[0]
          : row.shop_items;

      if (!shopItem) {
        return [];
      }

      return [
        {
          id: shopItem.id,
          name: shopItem.name,

          slot:
            row.slot ??
            shopItem.slot,

          preview_url:
            shopItem.preview_url,

          asset_manifest:
            shopItem.asset_manifest,
        },
      ];
    },
  );
}

export function useEquippedItems() {
  const [supabase] = useState(
    () => createClient(),
  );

  const [
    equippedItems,
    setEquippedItems,
  ] = useState<
    EquippedShopItem[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const fetchEquippedItems =
    useCallback(async () => {
      const {
        data: userData,
        error: userError,
      } =
        await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      const user =
        userData.user;

      if (!user) {
        return [];
      }

      const {
        data,
        error: equippedError,
      } = await supabase
        .from(
          "user_equipped_items",
        )
        .select(
          `
            slot,
            shop_items (
              id,
              name,
              slot,
              preview_url,
              asset_manifest
            )
          `,
        )
        .eq(
          "user_id",
          user.id,
        );

      if (equippedError) {
        throw equippedError;
      }

      return normalizeEquippedRows(
        (data ??
          []) as EquippedRow[],
      );
    }, [supabase]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const items =
          await fetchEquippedItems();

        if (cancelled) {
          return;
        }

        setEquippedItems(
          items,
        );

        setError(null);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load equipped items:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Could not load equipped items.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [fetchEquippedItems]);

  const refreshEquippedItems =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const items =
          await fetchEquippedItems();

        setEquippedItems(
          items,
        );
      } catch (err) {
        console.error(
          "Failed to refresh equipped items:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Could not refresh equipped items.",
        );
      } finally {
        setLoading(false);
      }
    }, [fetchEquippedItems]);

  const getEquippedItem =
    useCallback(
      (slot: string) =>
        equippedItems.find(
          (item) =>
            item.slot === slot,
        ) ?? null,
      [equippedItems],
    );

  return {
    equippedItems,
    loading,
    error,

    getEquippedItem,

    refreshEquippedItems,
  };
}