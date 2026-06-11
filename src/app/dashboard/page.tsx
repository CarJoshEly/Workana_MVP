import { auth } from "@/lib/auth";
import { getClientProjects } from "@/lib/actions/project.actions";
import { getFreelancerProposals } from "@/lib/actions/proposal.actions";
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
    <div className="min-h-screen bg-[#F7F9F8] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de bienvenida */}
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Hola, {session.user.name ? session.user.name.split(' ')[0] : "Usuario"} 👋
          </h1>
          <p className="text-gray-500 text-sm">
            {isClient 
              ? "Gestiona tus proyectos y encuentra el mejor talento para tu negocio." 
              : "Revisa el estado de tus propuestas y encuentra nuevas oportunidades."}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Lateral (Información de Perfil) */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
              <div className="w-20 h-20 bg-[#1A9B5E] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {session.user.name ? session.user.name[0].toUpperCase() : "U"}
              </div>
              <h3 className="font-bold text-gray-900">{session.user.name}</h3>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-4">
                {userRole || "Usuario"}
              </p>
              <div className="pt-4 border-t border-gray-50 text-left">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Reputación</span>
                  <span className="text-[#1A9B5E] font-bold">Nuevo</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-[#1A9B5E] h-1.5 rounded-full w-1/4"></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h4 className="font-bold text-sm text-gray-900 mb-4">Resumen</h4>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{isClient ? "Proyectos" : "Propuestas"}</span>
                  <span className="font-bold">
                    {isClient ? clientProjects.length : freelancerProposals.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Saldo</span>
                  <span className="font-bold text-[#1A9B5E]">$0.00</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Área Principal de Actividad */}
          <main className="lg:col-span-3">
            {isClient ? (
              /* VISTA PARA CLIENTES */
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                  <h2 className="font-bold text-gray-800">Mis Proyectos Publicados</h2>
                  <Link 
                    href="/projects/create" 
                    className="text-sm font-bold text-[#1A9B5E] hover:underline"
                  >
                    + Publicar nuevo
                  </Link>
                </div>

                <div className="divide-y divide-gray-50">
                  {clientProjects.map((p) => (
                    <div key={p.id} className="p-6 hover:bg-gray-50/50 transition">
                      <div className="flex justify-between items-center">
                        <div>
                          <Link href={`/projects/${p.id}`} className="font-bold text-[#1A9B5E] hover:underline mb-1">
                            {p.title}
                          </Link>
                          <p className="text-sm text-gray-400">{p._count.proposals} propuestas recibidas</p>
                        </div>
                        <span className="bg-[#E9F5ED] text-[#1A9B5E] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                          {p.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {clientProjects.length === 0 && (
                    <div className="p-12 text-center text-gray-400 italic">No tienes proyectos activos publicados.</div>
                  )}
                </div>
              </div>
            ) : (
              /* VISTA PARA FREELANCERS */
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                  <h2 className="font-bold text-gray-800">Mis Propuestas Recientes</h2>
                  <Link href="/projects" className="text-sm font-bold text-[#1A9B5E] hover:underline">
                    Buscar más proyectos
                  </Link>
                </div>

                <div className="divide-y divide-gray-50">
                  {freelancerProposals.map((prop) => (
                    <div key={prop.id} className="p-6 hover:bg-gray-50/50 transition">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-800">{prop.project.title}</h3>
                        <span className="font-bold text-[#1A9B5E] text-lg">${prop.price}</span>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{prop.message}</p>
                      <div className="flex justify-between items-center text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
                        <span>Enviado: {new Date(prop.createdAt).toLocaleDateString()}</span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded">{prop.project.status}</span>
                      </div>
                    </div>
                  ))}
                  {freelancerProposals.length === 0 && (
                    <div className="p-12 text-center text-gray-400 italic">No has enviado ninguna propuesta todavía.</div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}