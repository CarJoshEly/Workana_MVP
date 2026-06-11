import { createProposal } from "@/lib/actions/proposal.actions";
import { getProjectById } from "@/lib/actions/project.actions";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type ProjectDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const [project, session] = await Promise.all([getProjectById(id), auth()]);

  if (!project) notFound();

  const role = session?.user?.role;
  const canSendProposal = role === "FREELANCER" && project.status === "OPEN";

  async function submitProposal(formData: FormData) {
    "use server";
    const result = await createProposal(formData);
    if (result.success) redirect("/dashboard/proposals");
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <Link href="/projects" className="text-sm font-medium text-[#1A9B5E] hover:underline">
            Volver a proyectos
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-[#1A9B5E]">
              {project.category}
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              {project.status}
            </span>
          </div>

          <h1 className="mt-5 text-3xl font-bold text-gray-900">{project.title}</h1>
          <p className="mt-2 text-sm text-gray-500">
            Publicado por {project.client.name} el{" "}
            {new Date(project.createdAt).toLocaleDateString("es-ES")}
          </p>

          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Descripcion del proyecto</h2>
            <p className="whitespace-pre-line text-sm leading-7 text-gray-600">
              {project.description}
            </p>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Presupuesto</p>
            <p className="mt-1 text-3xl font-bold text-[#1A9B5E]">
              ${project.budget.toLocaleString()}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-gray-500">Propuestas</p>
                <p className="mt-1 text-xl font-bold text-gray-900">
                  {project._count.proposals}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-gray-500">Estado</p>
                <p className="mt-1 text-xl font-bold text-gray-900">{project.status}</p>
              </div>
            </div>
          </div>

          {canSendProposal ? (
            <form action={submitProposal} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <input type="hidden" name="projectId" value={project.id} />
              <h2 className="text-lg font-semibold text-gray-900">Enviar propuesta</h2>
              <div className="mt-5 space-y-4">
                <div>
                  <label htmlFor="price" className="mb-2 block text-sm font-semibold text-gray-700">
                    Precio propuesto
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="1"
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-[#1A9B5E] focus:ring-2 focus:ring-[#1A9B5E]/20"
                    placeholder="500"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="mb-2 block text-sm font-semibold text-gray-700">
                    Mensaje
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-[#1A9B5E] focus:ring-2 focus:ring-[#1A9B5E]/20"
                    placeholder="Cuenta por que eres la mejor opcion para este proyecto..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-full bg-[#1A9B5E] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#158a52]"
                >
                  Enviar propuesta
                </button>
              </div>
            </form>
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-600 shadow-sm">
              {role === "CLIENT"
                ? "Los clientes pueden revisar propuestas desde su dashboard."
                : "Inicia sesion como freelancer para enviar una propuesta."}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
