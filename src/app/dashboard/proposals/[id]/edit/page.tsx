import { updateProposal } from "@/lib/actions/proposal.actions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type EditProposalPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProposalPage({ params }: EditProposalPageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "FREELANCER") redirect("/dashboard");

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: {
      project: { select: { title: true, status: true } },
    },
  });

  if (!proposal) notFound();
  if (proposal.freelancerId !== session.user.id) redirect("/dashboard/proposals");
  if (proposal.status !== "PENDING") redirect("/dashboard/proposals");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/dashboard/proposals" className="text-sm font-semibold text-[#1A9B5E] hover:underline">
          Volver a mis propuestas
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Editar propuesta</h1>
        <p className="text-sm text-gray-500">
          Proyecto: {proposal.project.title}
        </p>
      </div>

      <form action={updateProposal} className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <input type="hidden" name="proposalId" value={proposal.id} />

        <div>
          <label htmlFor="price" className="mb-2 block text-sm font-semibold text-gray-700">
            Precio propuesto
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min="1"
            defaultValue={proposal.price}
            required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-[#1A9B5E] focus:ring-2 focus:ring-[#1A9B5E]/20"
          />
        </div>

        <div>
          <label htmlFor="message" className="mb-2 block text-sm font-semibold text-gray-700">
            Mensaje
          </label>
          <textarea
            id="message"
            name="message"
            rows={7}
            defaultValue={proposal.message}
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
