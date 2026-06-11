"use client";

import { createProject } from "@/lib/actions/project.actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function CreateProjectPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await createProject(formData);

    if (result && "error" in result && result.error) {
      setError(result.error as string);
      setLoading(false);
    } else {
      router.push("/projects");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <nav className="mb-8">
          <Link href="/projects" className="text-sm text-gray-500 hover:text-[#1A9B5E] transition-colors">
            ← Volver a proyectos
          </Link>
        </nav>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Publicar un nuevo proyecto</h1>
          <p className="text-gray-500 mb-8 text-sm">Describe lo que necesitas para encontrar al mejor freelancer.</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">Título del proyecto</label>
              <input id="title" name="title" required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1A9B5E]/20 focus:border-[#1A9B5E] outline-none transition-all" placeholder="Ej: Necesito un desarrollador Next.js" />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">Categoría</label>
              <select id="category" name="category" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1A9B5E]/20 focus:border-[#1A9B5E] outline-none transition-all bg-white text-gray-700">
                <option value="Programación Web">Programación Web</option>
                <option value="Diseño Gráfico">Diseño Gráfico</option>
                <option value="Marketing Digital">Marketing Digital</option>
                <option value="Redacción">Redacción</option>
              </select>
            </div>

            <div>
              <label htmlFor="budget" className="block text-sm font-semibold text-gray-700 mb-2">Presupuesto estimado (USD)</label>
              <input id="budget" name="budget" type="number" required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1A9B5E]/20 focus:border-[#1A9B5E] outline-none transition-all" placeholder="500" />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">Descripción detallada</label>
              <textarea id="description" name="description" rows={5} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1A9B5E]/20 focus:border-[#1A9B5E] outline-none transition-all resize-none" placeholder="Describe los requerimientos técnicos, plazos y expectativas..."></textarea>
            </div>

            <button disabled={loading} type="submit" className="w-full bg-[#1A9B5E] text-white py-4 rounded-full font-bold hover:bg-[#158a52] transition-all shadow-lg shadow-[#1A9B5E]/20 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Publicando..." : "Publicar Proyecto Ahora"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}