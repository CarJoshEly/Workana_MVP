import { auth } from "@/lib/auth";
import { getClientProjects } from "@/lib/actions/project.actions";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const projects = await getClientProjects(session.user.id);

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mi Panel (Cliente)</h1>
        <p className="text-gray-600">Bienvenido, {session.user.name}</p>
      </header>

      <section className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Mis Proyectos Publicados</h2>
          <Link href="/projects/create" className="text-blue-600 hover:underline font-medium">
            + Publicar nuevo
          </Link>
        </div>

        <div className="space-y-4">
          {projects.map((p) => (
            <div key={p.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition">
              <div>
                <h3 className="font-bold text-gray-800">{p.title}</h3>
                <p className="text-sm text-gray-500">{p._count.proposals} propuestas recibidas</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {p.status}
              </span>
            </div>
          ))}
          {projects.length === 0 && (
            <p className="text-gray-500 text-center py-4">Aún no has publicado ningún proyecto.</p>
          )}
        </div>
      </section>
    </div>
  );
}