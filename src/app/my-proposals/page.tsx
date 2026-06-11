import { getFreelancerProposals } from "@/lib/actions/proposal.actions";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function MyProposalsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "FREELANCER") redirect("/dashboard");

  const proposals = await getFreelancerProposals();

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis propuestas</h1>
            <p className="mt-1 text-sm text-gray-500">
              Revisa los proyectos a los que aplicaste y el estado de cada propuesta.
            </p>
          </div>
          <Link
            href="/projects"
            className="rounded-full bg-[#1A9B5E] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#158a52]"
          >
            Explorar proyectos
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {proposals.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              Aun no has enviado ninguna propuesta.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {proposals.map((proposal) => (
                <article key={proposal.id} className="p-6 transition-colors hover:bg-gray-50">
                  <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {proposal.project.title}
                      </h2>
                      <p className="mt-1 text-xs uppercase tracking-wide text-gray-400">
                        Proyecto {proposal.project.status}
                      </p>
                    </div>
                    <span className="font-bold text-[#1A9B5E]">
                      ${proposal.price.toLocaleString()}
                    </span>
                  </div>
                  <p className="mb-4 line-clamp-2 text-sm text-gray-600">{proposal.message}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      Enviada el {new Date(proposal.createdAt).toLocaleDateString("es-ES")}
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 font-medium uppercase text-gray-600">
                      {proposal.status}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
