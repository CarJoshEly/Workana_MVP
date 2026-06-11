import { getProjects } from "@/lib/actions/project.actions";
import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function ProjectsPage() {
  const projects = await getProjects();
  const session = await auth();
  const role = (session?.user as any)?.role;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#1A9B5E]">
            WorkanaMVP
          </Link>
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link href="/dashboard" className="text-sm text-gray-600 hover:text-[#1A9B5E]">
                  Dashboard
                </Link>
                {role === "CLIENT" && (
                  <Link href="/projects/create" className="px-4 py-2 bg-[#1A9B5E] text-white text-sm rounded-full font-medium hover:bg-[#158a52] transition-colors">
                    Publicar proyecto
                  </Link>
                )}
              </>
            ) : (
              <Link href="/login" className="px-4 py-2 bg-[#1A9B5E] text-white text-sm rounded-full font-medium hover:bg-[#158a52] transition-colors">
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Proyectos disponibles</h1>
            <p className="text-gray-500 text-sm mt-1">{projects.length} proyectos publicados</p>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-gray-500">No hay proyectos disponibles aún.</p>
            {role === "CLIENT" && (
              <Link href="/projects/create" className="mt-4 inline-block px-6 py-2 bg-[#1A9B5E] text-white rounded-full text-sm font-medium hover:bg-[#158a52]">
                Publica el primero
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#1A9B5E]/30 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-medium px-2 py-1 bg-green-50 text-[#1A9B5E] rounded-full">
                      {project.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(project.createdAt).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                  <h2 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
                    {project.title}
                  </h2>
                  <p className="text-sm text-gray-500 line-clamp-3 mb-4">
                    {project.description}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <span className="text-[#1A9B5E] font-bold text-sm">
                      ${project.budget.toLocaleString()}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>👤 {project.client.name}</span>
                      <span>💬 {project._count.proposals} propuestas</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}