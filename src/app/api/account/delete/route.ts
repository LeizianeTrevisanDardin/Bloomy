import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function DELETE() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "User session not found." },
        { status: 401 },
      );
    }

    const admin = createAdminClient();

    /*
     * The authenticated user's ID comes from the server session.
     * It is never accepted from the browser request body.
     */
    const { error: deleteError } =
      await admin.auth.admin.deleteUser(user.id, false);

    if (deleteError) {
      return NextResponse.json(
        { error: "Unable to delete the account." },
        { status: 500 },
      );
    }

    /*
     * Storage objects are not database rows and are not removed by
     * foreign-key cascades. The admin client can clean the avatar
     * after the Auth user has been deleted.
     */
    await admin.storage
      .from("avatars")
      .remove([`${user.id}/avatar.webp`]);

    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to delete the account." },
      { status: 500 },
    );
  }
}
