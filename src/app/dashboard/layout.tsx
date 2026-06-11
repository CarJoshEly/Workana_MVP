import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  User,
  LogOut
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard | Workana MVP",
  description: "Gestiona tus proyectos y propuestas de freelancing.",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isClient = session.user.role === "CLIENT";

  const menuItems = [
    { icon: LayoutDashboard, label: "Inicio", href: "/dashboard" },
    { 
      icon: Briefcase, 
      label: isClient ? "Mis Proyectos" : "Explorar Proyectos", 
      href: isClient ? "/dashboard/projects" : "/projects" 
    },
    { 
      icon: FileText, 
      label: isClient ? "Contratos" : "Mis Propuestas", 
      href: isClient ? "/dashboard/contracts" : "/dashboard/proposals" 
    },
    { icon: User, label: "Mi Perfil", href: "/dashboard/profile" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200">
        <div className="p-6">
          <Link href="/dashboard" className="text-2xl font-black text-[#1A9B5E]">
            WORKANA<span className="text-gray-400">MVP</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-[#1A9B5E] transition-colors"
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <form action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}>
            <button type="submit" className="flex w-full items-center px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors">
              <LogOut className="mr-3 h-5 w-5" />
              Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8">
          {/* Logo móvil */}
          <div className="md:hidden text-[#1A9B5E] font-black text-xl">W<span className="text-gray-400">M</span></div>
          
          <div className="flex items-center space-x-2 md:space-x-4 ml-auto">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900 leading-none">{session.user.name}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{session.user.role}</p>
            </div>
            <Link href="/dashboard/profile">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#1A9B5E] to-emerald-400 flex items-center justify-center text-white text-sm font-bold shadow-sm hover:opacity-90 transition">
                {session.user.name?.[0].toUpperCase()}
              </div>
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
