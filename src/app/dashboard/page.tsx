import { auth } from "@/lib/auth";
import { Briefcase, FileText, CheckCircle, DollarSign, Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { StatCard } from "./stat-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, role: true },
  });
  if (!currentUser) redirect("/login");

  const isClient = currentUser.role === "CLIENT";

  const [totalProjects, totalProposals, totalContracts, completedAmount] = await Promise.all([
    isClient
      ? prisma.project.count({ where: { clientId: session.user.id } })
      : prisma.project.count({ where: { status: "OPEN" } }),
    isClient
      ? prisma.proposal.count({ where: { project: { clientId: session.user.id } } })
      : prisma.proposal.count({ where: { freelancerId: session.user.id } }),
    isClient
      ? prisma.contract.count({ where: { clientId: session.user.id } })
      : prisma.contract.count({ where: { freelancerId: session.user.id } }),
    prisma.contract.aggregate({
      where: isClient
        ? { clientId: session.user.id, status: "COMPLETED" }
        : { freelancerId: session.user.id, status: "COMPLETED" },
      _sum: { price: true },
    }),
  ]);

  const completedTotal = completedAmount._sum.price ?? 0;
  const moneyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const stats = [
    { 
      title: isClient ? "Proyectos Publicados" : "Proyectos Activos", 
      value: totalProjects, 
      icon: Briefcase, 
      description: "Sin actividad esta semana" 
    },
    { 
      title: isClient ? "Propuestas Recibidas" : "Mis Propuestas", 
      value: totalProposals, 
      icon: FileText, 
      description: `${totalProposals} registradas` 
    },
    { title: "Contratos", value: totalContracts, icon: CheckCircle },
    {
      title: isClient ? "Gastado" : "Ingresos",
      value: moneyFormatter.format(completedTotal),
      icon: DollarSign,
      description: "Contratos completados",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bienvenido, {currentUser.name}</h1>
          <p className="text-gray-500">Este es el resumen de tu cuenta de {isClient ? 'Cliente' : 'Freelancer'}.</p>
        </div>
        {isClient && (
          <Button asChild className="rounded-xl font-bold shadow-lg shadow-emerald-100">
            <Link href="/projects/create">
              <Plus className="w-4 h-4 mr-2" /> Publicar Proyecto
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-sm text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
            <Briefcase className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Empieza tu primer proyecto</h3>
          <p className="text-gray-500 italic">
            {isClient 
              ? "Publica tu necesidad y recibe propuestas de los mejores profesionales en minutos."
              : "Explora proyectos y envía tu primera propuesta para empezar a ganar."}
          </p>
        </div>
      </div>
    </div>
  );
}
