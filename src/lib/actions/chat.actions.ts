"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const messageSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().trim().min(1, "El mensaje no puede estar vacio").max(2000),
});

export async function sendMessage(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return;
  }

  const parsed = messageSchema.safeParse({
    conversationId: formData.get("conversationId")?.toString(),
    content: formData.get("content")?.toString(),
  });

  if (!parsed.success) {
    return;
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: parsed.data.conversationId },
    select: { id: true, clientId: true, freelancerId: true },
  });

  if (
    !conversation ||
    (conversation.clientId !== session.user.id &&
      conversation.freelancerId !== session.user.id)
  ) {
    return;
  }

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: session.user.id,
      content: parsed.data.content,
    },
  });

  revalidatePath("/dashboard/chat");
  revalidatePath(`/dashboard/chat/${conversation.id}`);
  redirect(`/dashboard/chat/${conversation.id}`);
}
