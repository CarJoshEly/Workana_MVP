"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
    const project = await prisma.project.findUnique({
      where: { id: parsed.data.projectId },
      select: { clientId: true, status: true },
    });

    if (!project || project.status !== "OPEN") {
      return { error: "Este proyecto ya no acepta propuestas", success: false };
    }

    if (project.clientId === session.user.id) {
      return { error: "No puedes enviar propuestas a tu propio proyecto", success: false };
    }

    const existingProposal = await prisma.proposal.findFirst({
      where: {
        projectId: parsed.data.projectId,
        freelancerId: session.user.id,
      },
      select: { id: true },
    });

    if (existingProposal) {
      return { error: "Ya enviaste una propuesta para este proyecto", success: false };
    }

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
    revalidatePath("/dashboard/proposals");
    return { success: true };
  } catch {
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

const proposalUpdateSchema = z.object({
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
  price: z.coerce.number().min(1, "El precio debe ser mayor a 0"),
});

export async function updateProposal(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "FREELANCER") {
    return;
  }

  const proposalId = formData.get("proposalId")?.toString();
  if (!proposalId) return;

  const parsed = proposalUpdateSchema.safeParse({
    message: formData.get("message")?.toString(),
    price: formData.get("price")?.toString(),
  });

  if (!parsed.success) {
    return;
  }

  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    select: { freelancerId: true, projectId: true, status: true },
  });

  if (!proposal || proposal.freelancerId !== session.user.id) {
    return;
  }

  if (proposal.status !== "PENDING") {
    return;
  }

  await prisma.proposal.update({
    where: { id: proposalId },
    data: parsed.data,
  });

  revalidatePath(`/projects/${proposal.projectId}`);
  revalidatePath("/dashboard/proposals");
  redirect("/dashboard/proposals");
}

export async function deleteProposalFromForm(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "FREELANCER") return;

  const proposalId = formData.get("proposalId")?.toString();
  if (!proposalId) return;

  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    select: { freelancerId: true, projectId: true, status: true },
  });

  if (!proposal || proposal.freelancerId !== session.user.id) return;
  if (proposal.status !== "PENDING") return;

  await prisma.proposal.delete({ where: { id: proposalId } });

  revalidatePath(`/projects/${proposal.projectId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/proposals");
}
