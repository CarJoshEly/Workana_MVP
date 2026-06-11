import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <span className="text-2xl font-bold text-[#1A9B5E]">WorkanaMVP</span>
        <div className="flex gap-3">
          <Link href="/login" className="px-4 py-2 text-sm text-gray-700 hover:text-[#1A9B5E] font-medium transition-colors">
            Iniciar sesión
          </Link>
          <Link href="/register" className="px-4 py-2 text-sm bg-[#1A9B5E] text-white rounded-full font-medium hover:bg-[#158a52] transition-colors">
            Registrarse
          </Link>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Conecta talento con <br />
          <span className="text-[#1A9B5E]">oportunidades reales</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-xl mx-auto">
          Publica proyectos, encuentra freelancers y haz crecer tu negocio.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/register" className="px-8 py-3 bg-[#1A9B5E] text-white rounded-full font-semibold text-lg hover:bg-[#158a52] transition-colors">
            Empezar ahora
          </Link>
          <Link href="/projects" className="px-8 py-3 border border-gray-300 text-gray-700 rounded-full font-semibold text-lg hover:border-[#1A9B5E] hover:text-[#1A9B5E] transition-colors">
            Ver proyectos
          </Link>
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: "💼", title: "Publica proyectos", desc: "Describe tu proyecto y recibe propuestas de freelancers calificados." },
            { icon: "🔍", title: "Encuentra talento", desc: "Revisa perfiles, propuestas y elige al profesional ideal." },
            { icon: "🚀", title: "Trabaja sin límites", desc: "Gestiona todo desde un solo lugar, de forma simple y segura." },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}