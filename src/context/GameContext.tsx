"use client";

"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

type GameContextType = {
  level: number;
  xp: number;
  xpToNextLevel: number;

  energy: number;
  maxEnergy: number;

  coins: number;
  gems: number;

  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  addGems: (amount: number) => void;

  spendEnergy: (amount: number) => void;
  restoreEnergy: (amount: number) => void;
};

const GameContext =
  createContext<GameContextType | null>(null);

type GameProviderProps = {
  children: ReactNode;
};

const XP_PER_LEVEL = 100;

export function GameProvider({
  children,
}: GameProviderProps) {
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);

  const [energy, setEnergy] = useState(100);
  const maxEnergy = 100;

  const [coins, setCoins] = useState(0);
  const [gems, setGems] = useState(0);

  const xpToNextLevel =
    level * XP_PER_LEVEL;

  // ============================
  // XP / LEVEL
  // ============================

  const addXp = (amount: number) => {
    setXp((currentXp) => {
      let newXp =
        currentXp + amount;

      let currentLevel = level;

      let requiredXp =
        currentLevel * XP_PER_LEVEL;

      while (newXp >= requiredXp) {
        newXp -= requiredXp;

        currentLevel += 1;

        requiredXp =
          currentLevel *
          XP_PER_LEVEL;
      }

      if (currentLevel !== level) {
        setLevel(currentLevel);
      }

      return newXp;
    });
  };

  // ============================
  // COINS
  // ============================

  const addCoins = (amount: number) => {
    setCoins((current) => {
      return current + amount;
    });
  };

  // ============================
  // GEMS
  // ============================

  const addGems = (amount: number) => {
    setGems((current) => {
      return current + amount;
    });
  };

  // ============================
  // ENERGY
  // ============================

  const spendEnergy = (
    amount: number
  ) => {
    setEnergy((current) => {
      return Math.max(
        0,
        current - amount
      );
    });
  };

  const restoreEnergy = (
    amount: number
  ) => {
    setEnergy((current) => {
      return Math.min(
        maxEnergy,
        current + amount
      );
    });
  };

  // ============================
  // CONTEXT VALUE
  // ============================

 const value: GameContextType = {
  level,
  xp,
  xpToNextLevel,

  energy,
  maxEnergy,

  coins,
  gems,

  addXp,
  addCoins,
  addGems,

  spendEnergy,
  restoreEnergy,
};

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context =
    useContext(GameContext);

  if (!context) {
    throw new Error(
      "useGame must be used inside GameProvider"
    );
  }

  return context;
}