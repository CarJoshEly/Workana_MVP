import { auth } from "@/lib/auth";
import { deleteProposalFromForm } from "@/lib/actions/proposal.actions";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardProposalsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (currentUser?.role !== "FREELANCER") redirect("/dashboard");

  const proposals = await prisma.proposal.findMany({
    where: { freelancerId: session.user.id },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          status: true,
          budget: true,
          client: { select: { name: true } },
          conversations: {
            where: { freelancerId: session.user.id },
            select: { id: true },
            take: 1,
          },
        },
      },
      contract: { select: { id: true, status: true, price: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis propuestas</h1>
          <p className="text-sm text-gray-500">
            Consulta tus aplicaciones y el estado de cada oportunidad.
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
            Aun no has enviado propuestas.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {proposals.map((proposal) => (
              <article key={proposal.id} className="p-6 transition-colors hover:bg-gray-50">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {proposal.project.title}
                    </h2>
                    <p className="mt-1 text-xs uppercase tracking-wide text-gray-400">
                      Cliente: {proposal.project.client.name}
                    </p>
                    <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                      {proposal.message}
                    </p>
                  </div>
                  <div className="shrink-0 text-left md:text-right">
                    <p className="font-bold text-[#1A9B5E]">
                      ${proposal.price.toLocaleString()}
                    </p>
                    <span className="mt-2 inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                      {proposal.status}
                    </span>
                    {proposal.contract && (
                      <span className="mt-2 block rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-[#1A9B5E]">
                        Acuerdo {proposal.contract.status}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
                  <span>
                    Enviada el {new Date(proposal.createdAt).toLocaleDateString("es-ES")}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/projects/${proposal.project.id}`}
                      className="font-semibold text-[#1A9B5E] hover:underline"
                    >
                      Ver proyecto
                    </Link>
                    {proposal.project.conversations[0] && (
                      <Link
                        href={`/dashboard/chat/${proposal.project.conversations[0].id}`}
                        className="rounded-full border border-gray-200 px-3 py-1.5 font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Chat
                      </Link>
                    )}
                    {proposal.status === "PENDING" && (
                      <>
                        <Link
                          href={`/dashboard/proposals/${proposal.id}/edit`}
                          className="rounded-full border border-gray-200 px-3 py-1.5 font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          Editar
                        </Link>
                        <form action={deleteProposalFromForm}>
                          <input type="hidden" name="proposalId" value={proposal.id} />
                          <button
                            type="submit"
                            className="rounded-full border border-red-200 px-3 py-1.5 font-semibold text-red-600 hover:bg-red-50"
                          >
                            Eliminar
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
