"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  bio: z.string().trim().max(500, "La bio no puede superar 500 caracteres").optional(),
});

const avatarTypes = ["image/jpeg", "image/png", "image/webp"];
const maxAvatarSize = 2 * 1024 * 1024;

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SECRET_KEY?.trim();
  const bucket = process.env.STORAGE_BUCKET?.trim().replace(/^"|"$/g, "") || "avatars";

  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key, bucket };
}

function cleanFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function uploadAvatar(userId: string, file: File) {
  if (file.size === 0) return null;
  if (!avatarTypes.includes(file.type)) return null;
  if (file.size > maxAvatarSize) return null;

  const config = getSupabaseConfig();
  if (!config) return null;

  const fileName = cleanFileName(file.name) || "avatar";
  const path = `${userId}/${Date.now()}-${fileName}`;
  const uploadUrl = `${config.url}/storage/v1/object/${config.bucket}/${path}`;

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.key}`,
      apikey: config.key,
      "Content-Type": file.type,
      "x-upsert": "true",
    },
    body: await file.arrayBuffer(),
  });

  if (!response.ok) return null;
  return `${config.url}/storage/v1/object/public/${config.bucket}/${path}`;
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Ingresa tu contrasena actual"),
    newPassword: z.string().min(6, "La nueva contrasena debe tener al menos 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirma la nueva contrasena"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contrasenas no coinciden",
    path: ["confirmPassword"],
  });

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const parsed = profileSchema.safeParse({
    name: formData.get("name")?.toString(),
    bio: formData.get("bio")?.toString(),
  });

  if (!parsed.success) {
    return;
  }

  const avatar = formData.get("avatar");
  const avatarUrl = avatar instanceof File ? await uploadAvatar(session.user.id, avatar) : null;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      bio: parsed.data.bio || null,
      ...(avatarUrl ? { avatarUrl } : {}),
    },
  });

  revalidatePath("/dashboard/profile");
  revalidatePath(`/freelancers/${session.user.id}`);
}

export async function changePassword(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, message: "No autorizado" };

  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword")?.toString(),
    newPassword: formData.get("newPassword")?.toString(),
    confirmPassword: formData.get("confirmPassword")?.toString(),
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (!user) return { success: false, message: "No autorizado" };

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.password);
  if (!valid) {
    return { success: false, message: "La contrasena actual no es correcta" };
  }

  const hashed = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  });

  revalidatePath("/dashboard/profile");
  return { success: true, message: "Contrasena actualizada correctamente" };
}
