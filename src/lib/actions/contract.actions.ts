"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function acceptProposal(proposalId: string) {
  const session = await auth();
  if (session?.user?.role !== "CLIENT") return;

  await prisma.$transaction(async (tx) => {
    const proposal = await tx.proposal.findUnique({
      where: { id: proposalId },
      include: { project: true },
    });

    if (!proposal) return;
    if (proposal.project.clientId !== session.user.id) return;
    if (proposal.status !== "PENDING") return;
    if (proposal.project.status !== "OPEN") return;

    await tx.proposal.update({
      where: { id: proposal.id },
      data: { status: "ACCEPTED" },
    });

    await tx.proposal.updateMany({
      where: {
        projectId: proposal.projectId,
        id: { not: proposal.id },
        status: "PENDING",
      },
      data: { status: "REJECTED" },
    });

    await tx.project.update({
      where: { id: proposal.projectId },
      data: { status: "IN_PROGRESS" },
    });

    await tx.contract.create({
      data: {
        projectId: proposal.projectId,
        proposalId: proposal.id,
        clientId: session.user.id,
        freelancerId: proposal.freelancerId,
        price: proposal.price,
      },
    });

    await tx.conversation.upsert({
      where: {
        projectId_clientId_freelancerId: {
          projectId: proposal.projectId,
          clientId: session.user.id,
          freelancerId: proposal.freelancerId,
        },
      },
      update: {},
      create: {
        projectId: proposal.projectId,
        clientId: session.user.id,
        freelancerId: proposal.freelancerId,
      },
    });
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/contracts");
  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard/proposals");
  revalidatePath("/dashboard/chat");
}

export async function acceptProposalFromForm(formData: FormData) {
  const proposalId = formData.get("proposalId")?.toString();
  if (!proposalId) return;
  await acceptProposal(proposalId);
}

export async function rejectProposal(proposalId: string) {
  const session = await auth();
  if (session?.user?.role !== "CLIENT") return;

  const proposal = await prisma.proposal.findUnique({
    where: { id: proposalId },
    include: { project: { select: { clientId: true } } },
  });

  if (!proposal) return;
  if (proposal.project.clientId !== session.user.id) return;
  if (proposal.status !== "PENDING") return;

  await prisma.proposal.update({
    where: { id: proposal.id },
    data: { status: "REJECTED" },
  });

  revalidatePath("/dashboard/contracts");
  revalidatePath("/dashboard/proposals");
}

export async function rejectProposalFromForm(formData: FormData) {
  const proposalId = formData.get("proposalId")?.toString();
  if (!proposalId) return;
  await rejectProposal(proposalId);
}

export async function completeContract(contractId: string) {
  const session = await auth();
  if (!session?.user) return;

  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    select: { id: true, clientId: true, projectId: true, status: true },
  });

  if (!contract) return;
  if (contract.clientId !== session.user.id) return;
  if (contract.status !== "ACTIVE") return;

  await prisma.$transaction([
    prisma.contract.update({
      where: { id: contract.id },
      data: { status: "COMPLETED", completedAt: new Date() },
    }),
    prisma.project.update({
      where: { id: contract.projectId },
      data: { status: "CLOSED" },
    }),
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/contracts");
  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard/proposals");
}

export async function completeContractFromForm(formData: FormData) {
  const contractId = formData.get("contractId")?.toString();
  if (!contractId) return;
  await completeContract(contractId);
}
