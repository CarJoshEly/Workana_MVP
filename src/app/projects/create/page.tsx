import { getProjects } from "@/lib/actions/project.actions";
import Link from "next/link";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Proyectos Disponibles</h1>
        <Link
          href="/projects/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition"
        >
          Publicar Proyecto
        </Link>
      </div>

      <div className="grid gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-blue-600 hover:underline">
                  <Link href={`/projects/${project.id}`}>{project.title}</Link>
                </h2>
                <p className="text-sm text-gray-500">Publicado por {project.client.name}</p>
              </div>
              <span className="bg-green-100 text-green-700 text-sm font-bold px-3 py-1 rounded-full">
                ${project.budget}
              </span>
            </div>
            <p className="text-gray-600 line-clamp-2 mb-4">{project.description}</p>
            <div className="flex items-center text-sm text-gray-500 gap-4">
              <span>📁 {project.category}</span>
              <span>📩 {project._count.proposals} propuestas</span>
              <span suppressHydrationWarning>
                🕒 {new Date(project.createdAt).toLocaleDateString('es-ES', {
                  day: '2-digit', month: 'short', year: 'numeric'
                })}
              </span>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <p className="text-center text-gray-500 py-10">No hay proyectos abiertos en este momento.</p>
        )}
      </div>
    </div>
  );
}