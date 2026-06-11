import { auth } from "@/lib/auth";
import { getClientProjects } from "@/lib/actions/project.actions";
import { getFreelancerProposals } from "@/lib/actions/proposal.actions";
import { StatCard } from "./stat-card";
import { Briefcase, FileText, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user || !session.user.id) {
    redirect("/login");
  }

  // Aseguramos el rol por defecto si no viene en la sesión
  const userRole = (session.user as { role?: string }).role;
  const isClient = userRole === "CLIENT";
  
  // Cargamos datos dependiendo del rol
  const clientProjects = (isClient && session.user.id) ? await getClientProjects(session.user.id as string) : [];
  const freelancerProposals = (!isClient) ? await getFreelancerProposals() : [];

  return (
    <div className="space-y-8">
      {/* Header de bienvenida simplificado */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Hola, {session.user.name ? session.user.name.split(' ')[0] : "Usuario"} 👋
        </h1>
        <p className="text-gray-500 text-sm">
          {isClient 
            ? "Gestiona tus proyectos y encuentra el mejor talento." 
            : "Revisa tus propuestas y encuentra nuevas oportunidades."}
        </p>
      </div>

      {/* Estadísticas (Objetivo 3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title={isClient ? "Proyectos" : "Propuestas"}
          value={isClient ? clientProjects.length : freelancerProposals.length}
          icon={isClient ? Briefcase : FileText}
          description="Total acumulado"
        />
        <StatCard title="Mensajes" value="0" icon={Clock} />
        <StatCard title="Finalizados" value="0" icon={CheckCircle} />
        <StatCard title="Saldo" value="$0.00" icon={Briefcase} />
      </div>

      {/* Área Principal (Objetivo 1 y 2 - Tables) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-gray-800">
            {isClient ? "Mis Proyectos Publicados" : "Mis Propuestas Recientes"}
          </h2>
          <Link 
            href={isClient ? "/projects/create" : "/projects"} 
            className="text-sm font-bold text-[#1A9B5E] hover:underline"
          >
            {isClient ? "+ Publicar nuevo" : "Explorar proyectos"}
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3">{isClient ? "Título del Proyecto" : "Proyecto"}</th>
                <th className="px-6 py-3">{isClient ? "Propuestas" : "Monto"}</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isClient ? clientProjects.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{p.title}</div>
                    <div className="text-[10px] text-gray-400">Creado el {new Date(p.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p._count.proposals} propuestas</td>
                  <td className="px-6 py-4">
                    <span className="bg-[#E9F5ED] text-[#1A9B5E] px-2 py-1 rounded-md text-[10px] font-bold uppercase">{p.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/projects/${p.id}`} className="text-xs font-bold text-[#1A9B5E] hover:underline">Ver más</Link>
                  </td>
                </tr>
              )) : freelancerProposals.map((prop) => (
                <tr key={prop.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{prop.project.title}</div>
                    <div className="text-[10px] text-gray-400 italic">Cliente: {prop.project.client?.name || "Empresa"}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-[#1A9B5E]">${prop.price}</td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-md text-[10px] font-bold uppercase">{prop.project.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-xs font-bold text-gray-300 cursor-not-allowed">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {((isClient && clientProjects.length === 0) || (!isClient && freelancerProposals.length === 0)) && (
            <div className="p-12 text-center text-gray-400 italic">No hay datos para mostrar.</div>
          )}
        </div>
      </div>
    </div>
  );
}