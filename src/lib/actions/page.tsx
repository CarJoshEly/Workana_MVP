import { getFreelancerProposals } from "@/lib/actions/proposal.actions";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function MyProposalsPage() {
  const session = await auth();
  if (session?.user?.role !== "FREELANCER") redirect("/");

  const proposals = await getFreelancerProposals();

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Mis Propuestas Enviadas</h1>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="divide-y">
          {proposals.map((prop) => (
            <div key={prop.id} className="p-6 hover:bg-gray-50 transition">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-semibold text-blue-600">
                  {prop.project.title}
                </h2>
                <span className="font-bold text-gray-900">${prop.price}</span>
              </div>
              <p className="text-gray-600 text-sm line-clamp-2 mb-4">{prop.message}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Enviada el {new Date(prop.createdAt).toLocaleDateString()}</span>
                <span className="bg-gray-100 px-2 py-1 rounded font-medium uppercase">
                  Proyecto {prop.project.status}
                </span>
              </div>
            </div>
          ))}
          {proposals.length === 0 && (
            <p className="p-10 text-center text-gray-500">Aún no has enviado ninguna propuesta.</p>
          )}
        </div>
      </div>
    </div>
  );
}
