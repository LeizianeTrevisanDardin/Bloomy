"use client";

import { useGame } from "@/context/GameContext";

export default function GameStats() {
  const {
    level,
    xp,
    xpToNextLevel,
    // energy,
    // maxEnergy,
    coins,
    gems,
    addXp,
    addCoins,
  } = useGame();

  const xpPercentage = Math.min(
    100,
    (xp / xpToNextLevel) * 100
  );

  // const energyPercentage = Math.min(
  //   100,
  //   (energy / maxEnergy) * 100
  // );

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-wrap gap-6">
        {/* LEVEL */}
        <div>
          <p className="text-xs text-zinc-400">
            Level
          </p>

          <p className="text-xl font-semibold text-white">
            ⭐ {level}
          </p>
        </div>

        {/* COINS */}
        <div>
          <p className="text-xs text-zinc-400">
            Coins
          </p>

          <p className="text-xl font-semibold text-white">
            🪙 {coins}
          </p>
        </div>

        {/* GEMS */}
        <div>
          <p className="text-xs text-zinc-400">
            Gems
          </p>

          <p className="text-xl font-semibold text-white">
            💎 {gems}
          </p>
        </div>
      </div>

      {/* XP */}
      <div>
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-zinc-300">
            XP
          </span>

          <span className="text-zinc-400">
            {xp} / {xpToNextLevel}
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-purple-500 transition-all duration-500"
            style={{
              width: `${xpPercentage}%`,
            }}
          />
        </div>
      </div>

      {/* ENERGY */}
      {/* <div>
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-zinc-300">
            ⚡ Energy
          </span>

          <span className="text-zinc-400">
            {energy} / {maxEnergy}
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-yellow-400 transition-all duration-500"
            style={{
              width: `${energyPercentage}%`,
            }}
          />
        </div>
      </div> */}

      {/* TEMPORARY TEST BUTTONS */}
      <div className="flex gap-2 border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={() => addXp(25)}
          className="rounded-lg bg-purple-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-purple-400"
        >
          +25 XP
        </button>

        <button
          type="button"
          onClick={() => addCoins(10)}
          className="rounded-lg bg-yellow-500 px-3 py-2 text-sm font-medium text-black transition hover:bg-yellow-400"
        >
          +10 Coins
        </button>
      </div>
    </div>
  );
}