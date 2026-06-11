import { auth } from "@/lib/auth";
import {
  acceptProposalFromForm,
  completeContractFromForm,
  rejectProposalFromForm,
} from "@/lib/actions/contract.actions";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardContractsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (currentUser?.role !== "CLIENT") redirect("/dashboard");

  const [contracts, proposals] = await Promise.all([
    prisma.contract.findMany({
      where: { clientId: session.user.id },
      include: {
        freelancer: { select: { name: true, email: true } },
        project: {
          select: {
            id: true,
            title: true,
            status: true,
            conversations: {
              where: { clientId: session.user.id },
              select: { id: true },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.proposal.findMany({
      where: { project: { clientId: session.user.id } },
      include: {
        freelancer: { select: { name: true, email: true } },
        project: { select: { id: true, title: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contratos y propuestas</h1>
        <p className="text-sm text-gray-500">
          Acepta propuestas, rechaza candidatos y da seguimiento a tus acuerdos.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900">Acuerdos activos</h2>
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {contracts.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              Aun no tienes acuerdos creados.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {contracts.map((contract) => (
                <article key={contract.id} className="p-6">
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {contract.project.title}
                      </h3>
                      <p className="mt-1 text-xs text-gray-400">
                        Freelancer: {contract.freelancer.name} ({contract.freelancer.email})
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-[#1A9B5E]">
                          {contract.status}
                        </span>
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                          Proyecto {contract.project.status}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 text-left lg:text-right">
                      <p className="font-bold text-[#1A9B5E]">
                        ${contract.price.toLocaleString()}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Creado el {new Date(contract.createdAt).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <Link
                      href={`/projects/${contract.project.id}`}
                      className="text-xs font-semibold text-[#1A9B5E] hover:underline"
                    >
                      Ver proyecto
                    </Link>
                    {contract.project.conversations[0] && (
                      <Link
                        href={`/dashboard/chat/${contract.project.conversations[0].id}`}
                        className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        Abrir chat
                      </Link>
                    )}
                    {contract.status === "ACTIVE" && (
                      <form action={completeContractFromForm}>
                        <input type="hidden" name="contractId" value={contract.id} />
                        <button
                          type="submit"
                          className="rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-gray-700"
                        >
                          Marcar completado
                        </button>
                      </form>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-900">Propuestas recibidas</h2>
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {proposals.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            Aun no has recibido propuestas.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {proposals.map((proposal) => (
              <article key={proposal.id} className="p-6 transition-colors hover:bg-gray-50">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {proposal.project.title}
                    </h2>
                    <p className="mt-1 text-xs text-gray-400">
                      Freelancer: {proposal.freelancer.name} ({proposal.freelancer.email})
                    </p>
                    <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                      {proposal.message}
                    </p>
                  </div>
                  <div className="shrink-0 text-left lg:text-right">
                    <p className="font-bold text-[#1A9B5E]">
                      ${proposal.price.toLocaleString()}
                    </p>
                    <span className="mt-2 inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                      {proposal.status}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
                  <span>
                    Recibida el {new Date(proposal.createdAt).toLocaleDateString("es-ES")}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/projects/${proposal.project.id}`}
                      className="font-semibold text-[#1A9B5E] hover:underline"
                    >
                      Ver proyecto
                    </Link>
                    {proposal.status === "PENDING" && proposal.project.status === "OPEN" && (
                      <>
                        <form action={rejectProposalFromForm}>
                          <input type="hidden" name="proposalId" value={proposal.id} />
                          <button
                            type="submit"
                            className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                          >
                            Rechazar
                          </button>
                        </form>
                        <form action={acceptProposalFromForm}>
                          <input type="hidden" name="proposalId" value={proposal.id} />
                          <button
                            type="submit"
                            className="rounded-full bg-[#1A9B5E] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#158a52]"
                          >
                            Aceptar
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
      </section>
    </div>
  );
}
