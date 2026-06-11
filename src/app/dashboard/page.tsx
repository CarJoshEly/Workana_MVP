import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Hola, {session.user?.name} 👋
        </h1>
        <p className="text-gray-500 mt-2">Sprint 2 en construcción...</p>
      </div>
    </div>
  );
}