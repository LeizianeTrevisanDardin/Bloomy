"use client";

import { useEffect, useState } from "react";

export default function ClockCard() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const updateClock = () => {
      setNow(new Date());
    };

    updateClock();

    const interval = window.setInterval(
      updateClock,
      1_000,
    );

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const formattedTime = now
    ? new Intl.DateTimeFormat("en-CA", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(now)
    : "--:--";

  const formattedDate = now
    ? new Intl.DateTimeFormat("en-CA", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }).format(now)
    : "Loading date...";

  return (
  <div className="absolute left-2 top-[62px] z-40 min-w-[112px] rounded-xl border border-white/10 bg-black/60 px-2.5 py-2 text-center shadow-xl backdrop-blur-xl sm:left-4 sm:top-[74px] sm:min-w-[170px] sm:rounded-2xl sm:px-4 sm:py-3">
    <div className="flex justify-center">
      <span className="text-base font-semibold tabular-nums text-zinc-100 sm:text-xl">
        {formattedTime}
      </span>
    </div>

    <p className="mt-0.5 max-w-[110px] truncate text-center text-[10px] text-zinc-300 sm:mt-1 sm:max-w-none sm:text-xs">
      {formattedDate}
    </p>
  </div>
);
}