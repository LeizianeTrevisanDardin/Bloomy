import BloomyWorld from "@/components/BloomyWorld";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#16151d] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-3xl font-bold">Bloomy 🌱</h1>

        <p className="mt-2 text-zinc-400">
          Grow your life, one day at a time.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500 font-bold">
                B
              </div>

              <div>
                <p className="font-semibold">Bloomy</p>
                <p className="text-sm text-zinc-400">Level 1</p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-zinc-400">XP</p>

              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[25%] rounded-full bg-purple-500" />
              </div>

              <p className="mt-2 text-xs text-zinc-500">250 / 1000 XP</p>
            </div>
          </aside>

          <section className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-zinc-400">Your world</p>

              <div className="mt-4 flex min-h-[320px] items-center justify-center rounded-2xl bg-gradient-to-b from-purple-950 via-indigo-950 to-emerald-950">
                <div className="mt-4">
                  <BloomyWorld />
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <h2 className="text-lg font-semibold">Today&apos;s Tasks</h2>

                <div className="mt-4 space-y-3">
                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white/5 p-4">
                    <input type="checkbox" className="h-5 w-5" />
                    <span>Work on Bloomy</span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white/5 p-4">
                    <input type="checkbox" className="h-5 w-5" />
                    <span>Study for 30 minutes</span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white/5 p-4">
                    <input type="checkbox" className="h-5 w-5" />
                    <span>Exercise</span>
                  </label>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <h2 className="text-lg font-semibold">Goals</h2>

                <div className="mt-4 space-y-5">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Build Bloomy MVP</span>
                      <span className="text-zinc-400">10%</span>
                    </div>

                    <div className="mt-2 h-2 rounded-full bg-white/10">
                      <div className="h-full w-[10%] rounded-full bg-emerald-500" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm">
                      <span>30 day streak</span>
                      <span className="text-zinc-400">3 / 30</span>
                    </div>

                    <div className="mt-2 h-2 rounded-full bg-white/10">
                      <div className="h-full w-[10%] rounded-full bg-orange-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}