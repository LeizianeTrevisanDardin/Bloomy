// src/app/dashboard/shop/page.tsx

"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

const categories = {
  character_outfit: "Character outfits",
  dog_accessory: "Dog accessories",
  garden_decoration: "Garden decorations",
  house_decoration: "House decorations",
  scene_style: "Scene styles",
} as const;

type Category = keyof typeof categories;

type ShopItem = {
  id: string;
  name: string;
  description: string;
  category: Category;
  slot: string;
  price_coins: number;
  preview_url: string | null;
  is_active: boolean;
};

type InventoryItem = {
  item_id: string;
};

type EquippedItem = {
  item_id: string;
  slot: string;
};

type ShopData = {
  items: ShopItem[];
  inventory: InventoryItem[];
  equipped: EquippedItem[];
  coins: number;
};

type Action =
  | "buy"
  | "equip"
  | "unequip"
  | "sell";

function actionError(
  error: unknown,
): string {
  const message =
    error &&
    typeof error === "object" &&
    "message" in error
      ? String(error.message)
      : "";

  const messages: Record<
    string,
    string
  > = {
    AUTH_REQUIRED:
      "Please sign in to continue.",

    PROFILE_NOT_FOUND:
      "We could not find your profile. Please sign in again.",

    ITEM_NOT_FOUND:
      "This item is no longer available.",

    ITEM_UNAVAILABLE:
      "This item is not available for purchase yet.",

    INSUFFICIENT_COINS:
      "You need more coins to buy this item.",

    ITEM_NOT_OWNED:
      "This item is no longer in your inventory. Please refresh the shop.",

    ITEM_ASSETS_UNAVAILABLE:
      "This item is not ready to equip yet.",

    INVALID_SLOT:
      "This item could not be unequipped. Refresh and try again.",
  };

  return (
    Object.entries(
      messages,
    ).find(([code]) =>
      message.includes(code),
    )?.[1] ??
    "We could not confirm the change. Refresh to check your inventory before trying again."
  );
}

export default function ShopPage() {
  const router = useRouter();

  const [supabase] = useState(
    () => createClient(),
  );

  const [data, setData] =
    useState<ShopData | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [error, setError] =
    useState<string | null>(
      null,
    );

  const [
    notice,
    setNotice,
  ] = useState<string | null>(
    null,
  );

  const [tab, setTab] =
    useState<
      "shop" | "inventory"
    >("shop");

  const [
    category,
    setCategory,
  ] = useState<
    Category | "all"
  >("all");

  const [
    pending,
    setPending,
  ] = useState<
    string | null
  >(null);

  const [
    sellConfirmation,
    setSellConfirmation,
  ] = useState<
    ShopItem | null
  >(null);

  const mounted =
    useRef(false);

  const requestId =
    useRef(0);

  const actionLock =
    useRef(false);

  // =================================
  // LOAD SHOP
  // =================================

  const loadShop =
    useCallback(async () => {
      const currentRequest =
        ++requestId.current;

      const isCurrent = () =>
        mounted.current &&
        currentRequest ===
          requestId.current;

      if (!mounted.current) {
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const {
          data: authData,
          error: authError,
        } =
          await supabase.auth.getUser();

        if (!isCurrent()) {
          return false;
        }

        if (authError) {
          throw authError;
        }

        if (!authData.user) {
          setData(null);
          router.replace(
            "/login",
          );

          return false;
        }

        const userId =
          authData.user.id;

        const [
          catalog,
          inventory,
          equipped,
          profile,
        ] =
          await Promise.all([
            supabase
              .from(
                "shop_items",
              )
              .select(
                "id,name,description,category,slot,price_coins,preview_url,is_active",
              )
              .order(
                "price_coins",
                {
                  ascending:
                    true,
                },
              )
              .order("name"),

            supabase
              .from(
                "user_inventory",
              )
              .select(
                "item_id",
              )
              .eq(
                "user_id",
                userId,
              ),

            supabase
              .from(
                "user_equipped_items",
              )
              .select(
                "item_id,slot",
              )
              .eq(
                "user_id",
                userId,
              ),

            supabase
              .from(
                "profiles",
              )
              .select(
                "coins",
              )
              .eq(
                "id",
                userId,
              )
              .single(),
          ]);

        if (!isCurrent()) {
          return false;
        }

        const readError =
          catalog.error ||
          inventory.error ||
          equipped.error ||
          profile.error;

        if (readError) {
          throw readError;
        }

        if (
          !profile.data ||
          !Number.isFinite(
            profile.data.coins,
          )
        ) {
          throw new Error(
            "PROFILE_NOT_FOUND",
          );
        }

        setData({
          items:
            (catalog.data ??
              []) as ShopItem[],

          inventory:
            (inventory.data ??
              []) as InventoryItem[],

          equipped:
            (equipped.data ??
              []) as EquippedItem[],

          coins:
            profile.data.coins,
        });

        return true;
      } catch {
        if (isCurrent()) {
          setError(
            "We could not load your shop. Please refresh and try again.",
          );
        }

        return false;
      } finally {
        if (isCurrent()) {
          setLoading(false);
        }
      }
    }, [
      router,
      supabase,
    ]);

  // =================================
  // INITIAL LOAD / AUTH
  // =================================

  useEffect(() => {
    mounted.current = true;

    const timer =
      window.setTimeout(
        () => {
          void loadShop();
        },
        0,
      );

    const {
      data: authListener,
    } =
      supabase.auth.onAuthStateChange(
        (event) => {
          if (
            event ===
            "SIGNED_OUT"
          ) {
            requestId.current +=
              1;

            setData(null);

            router.replace(
              "/login",
            );
          }
        },
      );

    return () => {
      mounted.current =
        false;

      requestId.current +=
        1;

      window.clearTimeout(
        timer,
      );

      authListener.subscription.unsubscribe();
    };
  }, [
    loadShop,
    router,
    supabase,
  ]);

  // =================================
  // BUY / EQUIP / UNEQUIP / SELL
  // =================================

  async function handleAction(
    item: ShopItem,
    action: Action,
  ) {
    if (
      actionLock.current ||
      loading ||
      !data ||
      error
    ) {
      return;
    }

    actionLock.current =
      true;

    setPending(item.id);
    setError(null);
    setNotice(null);

    let committed = false;

    try {
      const response =
        action === "buy"
          ? await supabase.rpc(
              "purchase_shop_item",
              {
                p_item_id:
                  item.id,
              },
            )
          : action === "equip"
            ? await supabase.rpc(
                "equip_shop_item",
                {
                  p_item_id:
                    item.id,
                },
              )
            : action ===
                "unequip"
              ? await supabase.rpc(
                  "unequip_shop_item",
                  {
                    p_slot:
                      item.slot,
                  },
                )
              : await supabase.rpc(
                  "sell_shop_item",
                  {
                    p_item_id:
                      item.id,
                  },
                );

      if (response.error) {
        throw response.error;
      }

      committed = true;

      if (!mounted.current) {
        return;
      }

      const result =
        response.data as {
          status?: string;
          coins?: number;
        } | null;

      if (
        (action ===
          "buy" ||
          action ===
            "sell") &&
        typeof result?.coins ===
          "number"
      ) {
        const coins =
          result.coins;

        setData(
          (previous) =>
            previous
              ? {
                  ...previous,
                  coins,
                }
              : previous,
        );
      }

      setNotice(
        action === "buy"
          ? result?.status ===
            "already_owned"
            ? "You already own this item. No coins were deducted."
            : `${item.name} is now in your inventory.`
          : action ===
              "equip"
            ? `${item.name} equipped.`
            : action ===
                "unequip"
              ? `${item.name} unequipped.`
              : `${item.name} sold. Your coins have been returned.`,
      );

      await loadShop();
    } catch (
      actionFailure
    ) {
      if (
        mounted.current
      ) {
        setError(
          committed
            ? "Your change was saved, but the shop could not refresh. Please refresh."
            : actionError(
                actionFailure,
              ),
        );
      }
    } finally {
      actionLock.current =
        false;

      if (
        mounted.current
      ) {
        setPending(null);
      }
    }
  }

  // =================================
  // FILTERS
  // =================================

  const owned =
    new Set(
      data?.inventory.map(
        (item) =>
          item.item_id,
      ) ?? [],
    );

  const equipped =
    new Set(
      data?.equipped.map(
        (item) =>
          item.item_id,
      ) ?? [],
    );

  const visibleItems =
    (
      data?.items ?? []
    ).filter(
      (item) =>
        (category ===
          "all" ||
          category ===
            item.category) &&
        (tab === "shop" ||
          owned.has(
            item.id,
          )),
    );

  const busy =
    loading ||
    pending !== null;

  // =================================
  // PAGE
  // =================================

  return (
    <main className="min-h-screen bg-[#0c0c0f] px-4 py-6 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl pb-[max(2rem,env(safe-area-inset-bottom))]">
        <Link
          href="/dashboard"
          className="inline-flex min-h-11 items-center text-sm text-zinc-400 hover:text-white"
        >
          ← Back to dashboard
        </Link>

        {/* HEADER */}

        <header className="mt-5 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-purple-300">
              Make yourself at home
            </p>

            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Bloomy Shop
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
              Turn your daily
              progress into
              something for your
              world. Earn coins by
              completing habits,
              tasks and goals.
            </p>
          </div>

          <div className="min-w-36 rounded-2xl border border-amber-300/15 bg-amber-300/5 px-5 py-4">
            <p className="text-xs text-zinc-400">
              Your coins
            </p>

            <p
              className="mt-1 text-2xl font-semibold text-amber-200"
              aria-live="polite"
            >
              {data
                ? data.coins.toLocaleString(
                    "en-CA",
                  )
                : "—"}
            </p>
          </div>
        </header>

        {/* SHOP / INVENTORY */}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <div
            className="flex gap-2"
            aria-label="Shop views"
          >
            {(
              [
                "shop",
                "inventory",
              ] as const
            ).map(
              (view) => (
                <button
                  key={view}
                  type="button"
                  aria-pressed={
                    tab ===
                    view
                  }
                  onClick={() =>
                    setTab(
                      view,
                    )
                  }
                  className={`min-h-11 rounded-xl border px-4 text-sm transition ${
                    tab ===
                    view
                      ? "border-purple-400/30 bg-purple-500/15 text-purple-200"
                      : "border-white/10 text-zinc-400 hover:bg-white/5"
                  }`}
                >
                  {view ===
                  "shop"
                    ? "Shop"
                    : `My inventory${
                        data
                          ? ` (${owned.size})`
                          : ""
                      }`}
                </button>
              ),
            )}
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={() => {
              void loadShop();
            }}
            className="min-h-11 rounded-xl px-4 text-sm text-zinc-300 hover:bg-white/5 disabled:opacity-50"
          >
            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {/* CATEGORY FILTER */}

        <label className="mt-5 block max-w-xs text-sm text-zinc-400">
          Category

          <select
            value={category}
            onChange={(
              event,
            ) =>
              setCategory(
                event.target
                  .value as
                  | Category
                  | "all",
              )
            }
            className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#18181d] px-3 text-base text-white"
          >
            <option value="all">
              All categories
            </option>

            {Object.entries(
              categories,
            ).map(
              ([
                value,
                label,
              ]) => (
                <option
                  key={
                    value
                  }
                  value={
                    value
                  }
                >
                  {label}
                </option>
              ),
            )}
          </select>
        </label>

        {/* MESSAGES */}

        {notice && (
          <p
            role="status"
            className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-200"
          >
            {notice}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200"
          >
            {error}
          </p>
        )}

        {/* ITEMS */}

        {loading &&
        !data ? (
          <p
            role="status"
            className="py-16 text-center text-zinc-400"
          >
            Loading your
            shop...
          </p>
        ) : !data ? (
          <p className="py-16 text-center text-zinc-400">
            Use Refresh to
            load your shop.
          </p>
        ) : visibleItems.length ===
          0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-white/10 px-5 py-16 text-center">
            <h2 className="text-lg font-medium">
              {tab ===
              "inventory"
                ? "No items here yet"
                : "New items are on the way"}
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
              {tab ===
              "inventory"
                ? "Items you buy will appear in your inventory. Try another category or browse the shop."
                : "Check back soon for more ways to personalize your world."}
            </p>
          </div>
        ) : (
          <div
            className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            aria-busy={
              busy
            }
          >
            {visibleItems.map(
              (item) => {
                const isOwned =
                  owned.has(
                    item.id,
                  );

                const isEquipped =
                  equipped.has(
                    item.id,
                  );

                const affordable =
                  data.coins >=
                  item.price_coins;

                const unavailable =
                  !isOwned &&
                  (!item.is_active ||
                    !affordable);

                const action: Action =
                  !isOwned
                    ? "buy"
                    : isEquipped
                      ? "unequip"
                      : "equip";

                return (
                  <article
                    key={
                      item.id
                    }
                    className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#17171c]"
                  >
                    <ItemPreview
                      item={
                        item
                      }
                    />

                    <div className="flex flex-1 flex-col p-5">
                      <p className="text-xs text-purple-300">
                        {categories[
                          item
                            .category
                        ] ??
                          item.category}
                      </p>

                      <h2 className="mt-2 text-lg font-semibold">
                        {
                          item.name
                        }
                      </h2>

                      <p className="mt-2 flex-1 text-sm leading-6 text-zinc-400">
                        {
                          item.description
                        }
                      </p>

                      <div className="mt-5 flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-amber-200">
                          {
                            item.price_coins
                          }{" "}
                          coins
                        </span>

                        <span
                          className={
                            isEquipped
                              ? "text-emerald-300"
                              : "text-zinc-400"
                          }
                        >
                          {isEquipped
                            ? "Equipped"
                            : isOwned
                              ? "Owned"
                              : !item.is_active
                                ? "Coming soon"
                                : ""}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={
                          busy ||
                          Boolean(
                            error,
                          ) ||
                          unavailable
                        }
                        onClick={() => {
                          void handleAction(
                            item,
                            action,
                          );
                        }}
                        className="mt-4 min-h-11 w-full touch-manipulation rounded-xl border border-purple-400/20 bg-purple-500/15 px-4 py-3 text-sm font-medium text-purple-100 transition hover:bg-purple-500/25 disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/5 disabled:text-zinc-500"
                      >
                        {pending ===
                        item.id
                          ? "Saving..."
                          : isEquipped
                            ? "Unequip"
                            : isOwned
                              ? "Equip"
                              : !item.is_active
                                ? "Coming soon"
                                : !affordable
                                  ? "Not enough coins"
                                  : `Buy for ${item.price_coins} coins`}
                      </button>

                      {isOwned && (
                        <button
                          type="button"
                          disabled={
                            busy ||
                            Boolean(
                              error,
                            )
                          }
                          onClick={() => {
                            setSellConfirmation(
                              item,
                            );
                          }}
                          className="mt-2 min-h-11 w-full touch-manipulation rounded-xl border border-red-400/15 bg-red-500/5 px-4 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {pending ===
                          item.id
                            ? "Saving..."
                            : `Sell for ${item.price_coins} coins`}
                        </button>
                      )}
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}
      </div>

      {/* ================================= */}
      {/* SELL CONFIRMATION MODAL */}
      {/* ================================= */}

      {sellConfirmation && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onClick={() => {
            if (!busy) {
              setSellConfirmation(
                null,
              );
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sell-item-title"
            className="w-full max-w-md rounded-3xl border border-white/10 bg-[#17171c] p-6 shadow-2xl"
            onClick={(
              event,
            ) => {
              event.stopPropagation();
            }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300/15 bg-amber-300/10 text-xl">
              🪙
            </div>

            <h2
              id="sell-item-title"
              className="mt-5 text-xl font-semibold text-white"
            >
              Sell{" "}
              {
                sellConfirmation.name
              }
              ?
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              This item will be
              removed from your
              inventory.
            </p>

            <div className="mt-5 rounded-2xl border border-amber-300/10 bg-amber-300/5 px-4 py-3">
              <p className="text-xs text-zinc-500">
                Coins returned
              </p>

              <p className="mt-1 text-lg font-semibold text-amber-200">
                +
                {
                  sellConfirmation.price_coins
                }{" "}
                coins
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setSellConfirmation(
                    null,
                  );
                }}
                className="min-h-11 rounded-xl border border-white/10 px-5 text-sm font-medium text-zinc-300 transition hover:bg-white/5 disabled:opacity-50"
              >
                Keep item
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  const item =
                    sellConfirmation;

                  setSellConfirmation(
                    null,
                  );

                  void handleAction(
                    item,
                    "sell",
                  );
                }}
                className="min-h-11 rounded-xl border border-red-400/20 bg-red-500/10 px-5 text-sm font-medium text-red-200 transition hover:bg-red-500/20 disabled:opacity-50"
              >
                Sell for{" "}
                {
                  sellConfirmation.price_coins
                }{" "}
                coins
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// =================================
// ITEM PREVIEW
// =================================

function ItemPreview({
  item,
}: {
  item: ShopItem;
}) {
  const [
    failedUrl,
    setFailedUrl,
  ] = useState<
    string | null
  >(null);

  const hasPreview =
    Boolean(
      item.preview_url &&
        item.preview_url !==
          failedUrl,
    );

  return (
    <div className="flex h-48 items-center justify-center border-b border-white/5 bg-gradient-to-br from-purple-500/10 via-transparent to-amber-500/5 p-6">
      {hasPreview ? (
        // Catalog URLs are managed by the administrator.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={
            item.preview_url ??
            ""
          }
          alt={item.name}
          loading="lazy"
          draggable={false}
          onError={() =>
            setFailedUrl(
              item.preview_url,
            )
          }
          className="max-h-full max-w-full object-contain [image-rendering:pixelated]"
        />
      ) : (
        <span className="text-sm text-zinc-500">
          Preview coming soon
        </span>
      )}
    </div>
  );
}