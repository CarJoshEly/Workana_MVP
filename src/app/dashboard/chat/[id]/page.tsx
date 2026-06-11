import { sendMessage } from "@/lib/actions/chat.actions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type ChatDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ChatDetailPage({ params }: ChatDetailPageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      project: { select: { id: true, title: true, status: true } },
      client: { select: { id: true, name: true, avatarUrl: true } },
      freelancer: { select: { id: true, name: true, avatarUrl: true } },
      messages: {
        include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation) notFound();
  const isParticipant =
    conversation.clientId === session.user.id ||
    conversation.freelancerId === session.user.id;
  if (!isParticipant) redirect("/dashboard/chat");

  await prisma.message.updateMany({
    where: {
      conversationId: conversation.id,
      senderId: { not: session.user.id },
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  const otherUser =
    conversation.clientId === session.user.id
      ? conversation.freelancer
      : conversation.client;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/dashboard/chat" className="text-sm font-semibold text-[#1A9B5E] hover:underline">
            Volver al chat
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">{conversation.project.title}</h1>
          <p className="text-sm text-gray-500">Conversacion con {otherUser.name}</p>
        </div>
        <Link
          href={`/projects/${conversation.project.id}`}
          className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Ver proyecto
        </Link>
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="max-h-[560px] space-y-4 overflow-y-auto p-4 sm:p-6">
          {conversation.messages.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">
              Aun no hay mensajes. Escribe el primero para iniciar la conversacion.
            </div>
          ) : (
            conversation.messages.map((message) => {
              const isMine = message.senderId === session.user.id;

              return (
                <div
                  key={message.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                      isMine
                        ? "bg-[#1A9B5E] text-white"
                        : "border border-gray-100 bg-gray-50 text-gray-700"
                    }`}
                  >
                    <p className="whitespace-pre-line leading-6">{message.content}</p>
                    <p className={`mt-2 text-[11px] ${isMine ? "text-white/70" : "text-gray-400"}`}>
                      {message.sender.name} · {new Date(message.createdAt).toLocaleString("es-ES")}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form action={sendMessage} className="border-t border-gray-100 p-4 sm:p-6">
          <input type="hidden" name="conversationId" value={conversation.id} />
          <label htmlFor="content" className="sr-only">
            Mensaje
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <textarea
              id="content"
              name="content"
              rows={2}
              required
              maxLength={2000}
              placeholder="Escribe un mensaje..."
              className="min-h-14 flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-[#1A9B5E] focus:ring-2 focus:ring-[#1A9B5E]/20"
            />
            <button
              type="submit"
              className="rounded-full bg-[#1A9B5E] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#158a52]"
            >
              Enviar
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
