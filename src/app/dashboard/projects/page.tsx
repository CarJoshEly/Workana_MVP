import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardProjectsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "CLIENT") redirect("/dashboard");

  const projects = await prisma.project.findMany({
    where: { clientId: session.user.id },
    include: { _count: { select: { proposals: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis proyectos</h1>
          <p className="text-sm text-gray-500">
            Administra los proyectos que has publicado como cliente.
          </p>
        </div>
        <Link
          href="/projects/create"
          className="rounded-full bg-[#1A9B5E] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#158a52]"
        >
          Publicar proyecto
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {projects.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            Aun no has publicado proyectos.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {projects.map((project) => (
              <article key={project.id} className="p-6 transition-colors hover:bg-gray-50">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-[#1A9B5E]">
                        {project.category}
                      </span>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                        {project.status}
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">{project.title}</h2>
                    <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                      {project.description}
                    </p>
                  </div>
                  <div className="shrink-0 text-left md:text-right">
                    <p className="font-bold text-[#1A9B5E]">
                      ${project.budget.toLocaleString()}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {project._count.proposals} propuestas
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Creado el {new Date(project.createdAt).toLocaleDateString("es-ES")}
                  </span>
                  <Link
                    href={`/projects/${project.id}`}
                    className="font-semibold text-[#1A9B5E] hover:underline"
                  >
                    Ver detalle
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
