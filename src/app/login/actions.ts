"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  headers,
} from "next/headers";

import {
  redirect,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/server";

function getString(
  formData: FormData,
  field: string,
) {
  const value =
    formData.get(field);

  return typeof value === "string"
    ? value.trim()
    : "";
}

export async function login(
  formData: FormData,
) {
  const email =
    getString(formData, "email");

  const password =
    getString(formData, "password");

  if (!email || !password) {
    redirect(
      "/login?error=Please enter your email and password.",
    );
  }

  const supabase =
    await createClient();

  const { error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    redirect(
      "/login?error=Email or password is incorrect.",
    );
  }

  revalidatePath(
    "/",
    "layout",
  );

  redirect("/dashboard");
}

export async function signup(
  formData: FormData,
) {
  const displayName =
    getString(
      formData,
      "displayName",
    );

  const email =
    getString(formData, "email");

  const password =
    getString(formData, "password");

  const confirmPassword =
    getString(
      formData,
      "confirmPassword",
    );

  if (
    !displayName ||
    !email ||
    !password
  ) {
    redirect(
      "/signup?error=Please complete all required fields.",
    );
  }

  if (password.length < 8) {
    redirect(
      "/signup?error=Password must contain at least 8 characters.",
    );
  }

  if (
    password !== confirmPassword
  ) {
    redirect(
      "/signup?error=Passwords do not match.",
    );
  }

  const headerStore =
    await headers();

  const origin =
    headerStore.get("origin") ??
    "http://localhost:3000";

  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name:
          displayName,
      },
      emailRedirectTo:
        `${origin}/auth/callback`,
    },
  });

  if (error) {
    redirect(
      "/signup?error=Unable to create your account. Please check your information.",
    );
  }

  /*
   * If email confirmation is disabled,
   * Supabase creates a session immediately.
   */
  if (data.session) {
    revalidatePath(
      "/",
      "layout",
    );

    redirect("/dashboard");
  }

  redirect(
    "/login?message=Check your email to confirm your Bloomy account.",
  );
}