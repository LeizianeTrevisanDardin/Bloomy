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
    <div className="absolute left-4 top-[74px] z-40 hidden min-w-[170px] rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-center shadow-xl backdrop-blur-lx sm:block">
      <div className="flex justify-center">
        <span className="text-xl font-semibold tabular-nums text-zinc-100">
          {formattedTime}
        </span>
      </div>

      <p className="mt-1 text-center text-xs text-zinc-300">
        {formattedDate}
      </p>
    </div>
  );
}