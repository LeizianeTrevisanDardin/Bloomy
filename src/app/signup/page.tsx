import Link from "next/link";
import { redirect } from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  signup,
} from "../login/actions";

type SignupPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function SignupPage({
  searchParams,
}: SignupPageProps) {
  const params =
    await searchParams;

  const supabase =
    await createClient();

  const { data } =
    await supabase.auth.getClaims();

  if (data?.claims) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0c0c0f] px-4 py-10 text-white">
      <div className="w-full max-w-[460px]">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10 text-3xl">
            🌸
          </div>

          <h1 className="mt-5 text-3xl font-semibold">
            Create your world
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Build habits, reach goals and watch Bloomy grow.
          </p>
        </div>

        <div className="rounded-3xl border border-white/[0.08] bg-[#151419] p-6 shadow-2xl sm:p-8">
          {params.error && (
            <div className="mb-5 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {params.error}
            </div>
          )}

          <form action={signup}>
            <div>
              <label
                htmlFor="displayName"
                className="text-sm text-zinc-300"
              >
                Name
              </label>

              <input
                id="displayName"
                name="displayName"
                type="text"
                autoComplete="name"
                required
                maxLength={80}
                placeholder="Your name"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-500/10"
              />
            </div>

            <div className="mt-4">
              <label
                htmlFor="email"
                className="text-sm text-zinc-300"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-500/10"
              />
            </div>

            <div className="mt-4">
              <label
                htmlFor="password"
                className="text-sm text-zinc-300"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="At least 8 characters"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-500/10"
              />
            </div>

            <div className="mt-4">
              <label
                htmlFor="confirmPassword"
                className="text-sm text-zinc-300"
              >
                Confirm password
              </label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="Repeat your password"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-500/10"
              />
            </div>

            <button
              type="submit"
              className="mt-6 w-full rounded-xl bg-purple-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-400"
            >
              Create account
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-400">
            Already have an account?{" "}

            <Link
              href="/login"
              className="font-medium text-purple-300 hover:text-purple-200"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}