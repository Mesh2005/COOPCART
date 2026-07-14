"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth";
import { STAFF_ROLES } from "@/lib/types";

/**
 * Permanently delete a support conversation and all its messages (messages
 * cascade via the FK). Staff-only. Uses the service role because there is no
 * client DELETE policy on the chat tables.
 */
export async function deleteConversationAction(
  conversationId: string,
): Promise<{ error?: string; success?: string }> {
  const me = await getCurrentProfile();
  if (!me || !(STAFF_ROLES as readonly string[]).includes(me.role)) {
    return { error: "You don't have permission to delete conversations." };
  }
  if (!conversationId) return { error: "Missing conversation." };

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("chat_conversations").delete().eq("id", conversationId);
  if (error) return { error: error.message };

  revalidatePath("/admin/chat");
  return { success: "Conversation deleted." };
}
