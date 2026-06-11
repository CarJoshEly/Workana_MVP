import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ChatPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ clientId: session.user.id }, { freelancerId: session.user.id }],
    },
    include: {
      project: { select: { title: true, status: true } },
      client: { select: { name: true } },
      freelancer: { select: { name: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Chat</h1>
        <p className="text-sm text-gray-500">
          Conversaciones creadas al aceptar una propuesta.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {conversations.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Aun no tienes conversaciones. Apareceran cuando exista un contrato activo.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {conversations.map((conversation) => {
              const otherUser =
                conversation.clientId === session.user.id
                  ? conversation.freelancer.name
                  : conversation.client.name;
              const lastMessage = conversation.messages[0];

              return (
                <Link
                  key={conversation.id}
                  href={`/dashboard/chat/${conversation.id}`}
                  className="block p-6 transition-colors hover:bg-gray-50"
                >
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">
                        {conversation.project.title}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">Con {otherUser}</p>
                      <p className="mt-3 line-clamp-1 text-sm text-gray-600">
                        {lastMessage?.content ?? "Sin mensajes todavia"}
                      </p>
                    </div>
                    <div className="shrink-0 text-left md:text-right">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                        {conversation.project.status}
                      </span>
                      {lastMessage && (
                        <p className="mt-2 text-xs text-gray-400">
                          {new Date(lastMessage.createdAt).toLocaleString("es-ES")}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
