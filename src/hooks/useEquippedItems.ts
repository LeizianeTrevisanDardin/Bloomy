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

// =================================
// NORMALIZE EQUIPPED ROWS
// =================================

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
          id:
            shopItem.id,

          name:
            shopItem.name,

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

// =================================
// AUTH ERROR CHECK
// =================================

function isMissingSessionError(
  error: unknown,
) {
  if (
    !(error instanceof Error)
  ) {
    return false;
  }

  return (
    error.name ===
      "AuthSessionMissingError" ||
    error.message
      .toLowerCase()
      .includes(
        "auth session missing",
      )
  );
}

// =================================
// HOOK
// =================================

export function useEquippedItems() {
  const [supabase] =
    useState(
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

  // =================================
  // FETCH EQUIPPED ITEMS
  // =================================

  const fetchEquippedItems =
    useCallback(async () => {
      /*
       * Check the local Supabase
       * session first.
       *
       * This avoids calling getUser()
       * while Supabase is still
       * restoring auth on page load.
       */

      const {
        data:
          sessionData,
        error:
          sessionError,
      } =
        await supabase.auth.getSession();

      if (sessionError) {
        if (
          isMissingSessionError(
            sessionError,
          )
        ) {
          return [];
        }

        throw sessionError;
      }

      const session =
        sessionData.session;

      if (!session?.user) {
        return [];
      }

      const user =
        session.user;

      // =================================
      // LOAD EQUIPPED ITEMS
      // =================================

      const {
        data,
        error:
          equippedError,
      } =
        await supabase
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

      if (
        equippedError
      ) {
        throw equippedError;
      }

      return normalizeEquippedRows(
        (data ??
          []) as EquippedRow[],
      );
    }, [
      supabase,
    ]);

  // =================================
  // INITIAL LOAD
  // =================================

  useEffect(() => {
    let cancelled =
      false;

    async function load() {
      try {
        const items =
          await fetchEquippedItems();

        if (
          cancelled
        ) {
          return;
        }

        setEquippedItems(
          items,
        );

        setError(null);
      } catch (err) {
        if (
          cancelled
        ) {
          return;
        }

        /*
         * Missing auth during the
         * initial render is not a
         * real application error.
         */

        if (
          isMissingSessionError(
            err,
          )
        ) {
          setEquippedItems(
            [],
          );

          setError(null);

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
        if (
          !cancelled
        ) {
          setLoading(
            false,
          );
        }
      }
    }

    void load();

    // =================================
    // AUTH STATE LISTENER
    // =================================

    /*
     * If the page mounted before
     * Supabase finished restoring
     * the user session, this listener
     * reloads the equipped items as
     * soon as the session becomes
     * available.
     */

    const {
      data:
        authListener,
    } =
      supabase.auth.onAuthStateChange(
        (
          event,
          session,
        ) => {
          if (
            cancelled
          ) {
            return;
          }

          if (
            event ===
              "SIGNED_OUT" ||
            !session?.user
          ) {
            setEquippedItems(
              [],
            );

            setError(null);

            return;
          }

          /*
           * Do the async reload
           * outside the auth callback.
           */

          window.setTimeout(
            () => {
              if (
                cancelled
              ) {
                return;
              }

              void (async () => {
                try {
                  const items =
                    await fetchEquippedItems();

                  if (
                    cancelled
                  ) {
                    return;
                  }

                  setEquippedItems(
                    items,
                  );

                  setError(
                    null,
                  );
                } catch (err) {
                  if (
                    cancelled ||
                    isMissingSessionError(
                      err,
                    )
                  ) {
                    return;
                  }

                  console.error(
                    "Failed to reload equipped items after auth change:",
                    err,
                  );
                }
              })();
            },
            0,
          );
        },
      );

    return () => {
      cancelled =
        true;

      authListener
        .subscription
        .unsubscribe();
    };
  }, [
    fetchEquippedItems,
    supabase,
  ]);

  // =================================
  // REFRESH EQUIPPED ITEMS
  // =================================

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
        if (
          isMissingSessionError(
            err,
          )
        ) {
          setEquippedItems(
            [],
          );

          setError(null);

          return;
        }

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
        setLoading(
          false,
        );
      }
    }, [
      fetchEquippedItems,
    ]);

  // =================================
  // GET ITEM BY SLOT
  // =================================

  const getEquippedItem =
    useCallback(
      (
        slot:
          string,
      ) =>
        equippedItems.find(
          (item) =>
            item.slot ===
            slot,
        ) ??
        null,
      [
        equippedItems,
      ],
    );

  // =================================
  // RESULT
  // =================================

  return {
    equippedItems,

    loading,
    error,

    getEquippedItem,

    refreshEquippedItems,
  };
}