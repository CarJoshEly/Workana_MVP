"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const projectSchema = z.object({
  title: z.string().min(5, "Mínimo 5 caracteres"),
  description: z.string().min(20, "Mínimo 20 caracteres"),
  budget: z.coerce.number().min(1, "El presupuesto debe ser mayor a 0"),
  category: z.string().min(1, "Selecciona una categoría"),
});

export async function createProject(formData: FormData) {
  const session = await auth();

  console.log("DEBUG SESSION:", session?.user); // Revisa esto en la terminal del VS Code

  // Al usar session?.user, TypeScript sabe que si pasamos este if, user existe.
  if (session?.user?.role !== "CLIENT") {
    return { error: "No autorizado", success: false };
  }

  const parsed = projectSchema.safeParse({
    title: formData.get("title")?.toString(),
    description: formData.get("description")?.toString(),
    budget: formData.get("budget")?.toString(),
    category: formData.get("category")?.toString(),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, success: false };
  }

  try {
    await prisma.project.create({
      data: {
        ...parsed.data,
        clientId: session.user.id,
      },
    });

    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { success: true, error: null };
  } catch {
    return { error: "Error al crear el proyecto", success: false };
  }
}

export async function getProjects() {
  return await prisma.project.findMany({
    where: { status: "OPEN" },
    include: {
      client: { select: { name: true } },
      _count: { select: { proposals: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getClientProjects(clientId: string) {
  return await prisma.project.findMany({
    where: { clientId },
    include: { _count: { select: { proposals: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProjectById(id: string) {
  return await prisma.project.findUnique({
    where: { id },
    include: {
      client: { select: { name: true } },
      _count: { select: { proposals: true } },
    },
  });
}