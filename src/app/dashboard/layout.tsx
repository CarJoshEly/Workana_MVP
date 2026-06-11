import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  LogOut
} from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isClient = (session.user as any).role === "CLIENT";

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
    { icon: MessageSquare, label: "Mensajes", href: "/dashboard/messages" },
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
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-8">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">{session.user.name}</span>
            <div className="w-8 h-8 rounded-full bg-[#1A9B5E] flex items-center justify-center text-white text-xs font-bold">
              {session.user.name?.[0]}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}