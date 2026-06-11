import { updateProject } from "@/lib/actions/project.actions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type EditProjectPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "CLIENT") redirect("/dashboard");

  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      budget: true,
      category: true,
      status: true,
      clientId: true,
    },
  });

  if (!project) notFound();
  if (project.clientId !== session.user.id) redirect("/dashboard/projects");
  if (project.status !== "OPEN") redirect(`/projects/${project.id}`);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/dashboard/projects" className="text-sm font-semibold text-[#1A9B5E] hover:underline">
          Volver a mis proyectos
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Editar proyecto</h1>
        <p className="text-sm text-gray-500">
          Puedes modificar proyectos mientras sigan abiertos y sin acuerdo activo.
        </p>
      </div>

      <form action={updateProject} className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <input type="hidden" name="projectId" value={project.id} />

        <div>
          <label htmlFor="title" className="mb-2 block text-sm font-semibold text-gray-700">
            Titulo del proyecto
          </label>
          <input
            id="title"
            name="title"
            defaultValue={project.title}
            required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-[#1A9B5E] focus:ring-2 focus:ring-[#1A9B5E]/20"
          />
        </div>

        <div>
          <label htmlFor="category" className="mb-2 block text-sm font-semibold text-gray-700">
            Categoria
          </label>
          <select
            id="category"
            name="category"
            defaultValue={project.category}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#1A9B5E] focus:ring-2 focus:ring-[#1A9B5E]/20"
          >
            <option value="Programacion Web">Programacion Web</option>
            <option value="Diseno Grafico">Diseno Grafico</option>
            <option value="Marketing Digital">Marketing Digital</option>
            <option value="Redaccion">Redaccion</option>
            <option value={project.category}>{project.category}</option>
          </select>
        </div>

        <div>
          <label htmlFor="budget" className="mb-2 block text-sm font-semibold text-gray-700">
            Presupuesto estimado (USD)
          </label>
          <input
            id="budget"
            name="budget"
            type="number"
            min="1"
            defaultValue={project.budget}
            required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-[#1A9B5E] focus:ring-2 focus:ring-[#1A9B5E]/20"
          />
        </div>

        <div>
          <label htmlFor="description" className="mb-2 block text-sm font-semibold text-gray-700">
            Descripcion
          </label>
          <textarea
            id="description"
            name="description"
            rows={7}
            defaultValue={project.description}
            required
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-[#1A9B5E] focus:ring-2 focus:ring-[#1A9B5E]/20"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-[#1A9B5E] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#158a52]"
        >
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
