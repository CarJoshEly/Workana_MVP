"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const proposalSchema = z.object({
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
  price: z.coerce.number().min(1, "El precio debe ser mayor a 0"),
  projectId: z.string().min(1),
});

export async function createProposal(formData: FormData) {
  const session = await auth();

  if (session?.user?.role !== "FREELANCER") {
    return { error: "Solo los freelancers pueden enviar propuestas", success: false };
  }

  const parsed = proposalSchema.safeParse({
    message: formData.get("message")?.toString(),
    price: formData.get("price")?.toString(),
    projectId: formData.get("projectId")?.toString(),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, success: false };
  }

  try {
    await prisma.proposal.create({
      data: {
        message: parsed.data.message,
        price: parsed.data.price,
        projectId: parsed.data.projectId,
        freelancerId: session.user.id,
      },
    });

    revalidatePath(`/projects/${parsed.data.projectId}`);
    revalidatePath("/my-proposals");
    return { success: true };
  } catch (error) {
    return { error: "Error al enviar la propuesta", success: false };
  }
}

export async function getFreelancerProposals() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await prisma.proposal.findMany({
    where: { freelancerId: session.user.id },
    include: { project: { select: { title: true, status: true } } },
    orderBy: { createdAt: "desc" },
  });
}