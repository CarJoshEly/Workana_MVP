import { auth } from "@/lib/auth";
import { updateProfile } from "@/lib/actions/profile.actions";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PasswordForm } from "./password-form";

export default async function DashboardProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [user, projectsCount, proposalsCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        avatarUrl: true,
      },
    }),
    prisma.project.count({ where: { clientId: session.user.id } }),
    prisma.proposal.count({ where: { freelancerId: session.user.id } }),
  ]);

  if (!user) redirect("/login");
  const initial = user.name?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi perfil</h1>
        <p className="text-sm text-gray-500">
          Informacion basica de tu cuenta en Workana MVP.
        </p>
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1A9B5E] bg-cover bg-center text-2xl font-bold text-white"
            style={user.avatarUrl ? { backgroundImage: `url(${user.avatarUrl})` } : undefined}
          >
            {!user.avatarUrl && initial}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
            {user.bio && <p className="mt-2 max-w-2xl text-sm text-gray-600">{user.bio}</p>}
            <span className="mt-3 inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold uppercase text-[#1A9B5E]">
              {user.role}
            </span>
            {user.role === "FREELANCER" && (
              <Link
                href={`/freelancers/${user.id}`}
                className="ml-3 inline-flex text-xs font-semibold text-[#1A9B5E] hover:underline"
              >
                Ver perfil publico
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <form
          action={updateProfile}
          className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <div>
            <h2 className="text-lg font-bold text-gray-900">Editar informacion</h2>
            <p className="text-sm text-gray-500">Actualiza tu nombre, bio y foto de perfil.</p>
          </div>

          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-semibold text-gray-700">
              Nombre
            </label>
            <input
              id="name"
              name="name"
              defaultValue={user.name}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-[#1A9B5E] focus:ring-2 focus:ring-[#1A9B5E]/20"
            />
          </div>

          <div>
            <label htmlFor="bio" className="mb-2 block text-sm font-semibold text-gray-700">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={5}
              maxLength={500}
              defaultValue={user.bio ?? ""}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-[#1A9B5E] focus:ring-2 focus:ring-[#1A9B5E]/20"
              placeholder="Cuenta brevemente que haces y en que tipo de proyectos trabajas."
            />
          </div>

          <div>
            <label htmlFor="avatar" className="mb-2 block text-sm font-semibold text-gray-700">
              Foto de perfil
            </label>
            <input
              id="avatar"
              name="avatar"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-green-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#1A9B5E] outline-none transition-all focus:border-[#1A9B5E] focus:ring-2 focus:ring-[#1A9B5E]/20"
            />
          </div>

          <button
            type="submit"
            className="rounded-full bg-[#1A9B5E] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#158a52]"
          >
            Guardar perfil
          </button>
        </form>

        <PasswordForm />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Proyectos publicados</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{projectsCount}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Propuestas enviadas</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{proposalsCount}</p>
        </div>
      </section>
    </div>
  );
}
