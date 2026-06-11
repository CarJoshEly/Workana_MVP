import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

type FreelancerProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function FreelancerProfilePage({ params }: FreelancerProfilePageProps) {
  const { id } = await params;

  const freelancer = await prisma.user.findFirst({
    where: { id, role: "FREELANCER" },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      avatarUrl: true,
      createdAt: true,
      _count: {
        select: {
          proposals: true,
          freelancerContracts: true,
        },
      },
    },
  });

  if (!freelancer) notFound();

  const completedContracts = await prisma.contract.count({
    where: { freelancerId: freelancer.id, status: "COMPLETED" },
  });

  const initial = freelancer.name[0]?.toUpperCase() ?? "F";

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-100 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#1A9B5E]">
            WorkanaMVP
          </Link>
          <Link href="/projects" className="text-sm font-semibold text-gray-600 hover:text-[#1A9B5E]">
            Ver proyectos
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <section className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div
              className="flex h-24 w-24 items-center justify-center rounded-full bg-[#1A9B5E] bg-cover bg-center text-3xl font-bold text-white"
              style={freelancer.avatarUrl ? { backgroundImage: `url(${freelancer.avatarUrl})` } : undefined}
            >
              {!freelancer.avatarUrl && initial}
            </div>
            <div>
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold uppercase text-[#1A9B5E]">
                Freelancer
              </span>
              <h1 className="mt-3 text-3xl font-bold text-gray-900">{freelancer.name}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Miembro desde {new Date(freelancer.createdAt).toLocaleDateString("es-ES")}
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <h2 className="text-lg font-bold text-gray-900">Sobre mi</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">
              {freelancer.bio || "Este freelancer aun no ha agregado una bio."}
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Propuestas enviadas</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{freelancer._count.proposals}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Contratos</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{freelancer._count.freelancerContracts}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Completados</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{completedContracts}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
