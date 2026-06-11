import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [projectsCount, proposalsCount] = await Promise.all([
    prisma.project.count({ where: { clientId: session.user.id } }),
    prisma.proposal.count({ where: { freelancerId: session.user.id } }),
  ]);

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
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1A9B5E] text-2xl font-bold text-white">
            {session.user.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{session.user.name}</h2>
            <p className="text-sm text-gray-500">{session.user.email}</p>
            <span className="mt-3 inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold uppercase text-[#1A9B5E]">
              {session.user.role}
            </span>
          </div>
        </div>
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
