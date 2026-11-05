import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, Check, Loader2, Trash2 } from "lucide-react";
import { Panel, Pill } from "./AdminUI";
import { api } from "@/api/platformClient";

const items = (result) => (Array.isArray(result) ? result : result?.items || []);

export default function MessagesPanel() {
  const queryClient = useQueryClient();
  const [openId, setOpenId] = useState(null);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => items(await api.entities.ContactMessage.list({ sort: "-created_date", limit: 100 })),
  });

  const messages = data || [];

  const act = async (message, patch) => {
    await api.entities.ContactMessage.update(message.id, patch);
    queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
    queryClient.invalidateQueries({ queryKey: ["admin-new-count"] });
  };

  const remove = async (message) => {
    await api.entities.ContactMessage.delete(message.id);
    queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
    queryClient.invalidateQueries({ queryKey: ["admin-new-count"] });
  };

  return (
    <Panel
      title="Enquiries"
      description="Messages sent through the contact form. Every enquiry is stored here — nothing is lost."
    >
      {isLoading ? (
        <div className="flex items-center gap-3 text-sm text-stone">
          <Loader2 size={14} className="animate-spin" /> Loading enquiries
        </div>
      ) : messages.length === 0 ? (
        <p className="text-sm text-stone">No enquiries yet. New messages will appear here.</p>
      ) : (
        <div className="space-y-2">
          {messages.map((message) => {
            const open = openId === message.id;
            return (
              <div key={message.id} className="border border-ink/12 bg-card">
                <button
                  type="button"
                  onClick={() => {
                    setOpenId(open ? null : message.id);
                    if (!open && message.status === "new") act(message, { status: "read" });
                  }}
                  className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="truncate text-sm">{message.name}</span>
                      {message.status === "new" ? <Pill tone="draft">New</Pill> : null}
                    </div>
                    <div className="truncate text-[12px] text-stone">
                      {message.service ? `${message.service} · ` : ""}
                      {message.email}
                    </div>
                  </div>
                  <span className="caps shrink-0 text-stone">
                    {new Date(message.created_date).toLocaleDateString()}
                  </span>
                </button>

                {open ? (
                  <div className="border-t border-ink/10 px-4 py-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
                      {message.message}
                    </p>
                    <dl className="mt-4 grid gap-2 text-[12px] text-stone sm:grid-cols-2">
                      {message.phone ? (
                        <div>
                          <dt className="inline caps mr-2">Phone</dt>
                          <dd className="inline text-ink">{message.phone}</dd>
                        </div>
                      ) : null}
                      {message.location ? (
                        <div>
                          <dt className="inline caps mr-2">Location</dt>
                          <dd className="inline text-ink">{message.location}</dd>
                        </div>
                      ) : null}
                      {message.budget ? (
                        <div>
                          <dt className="inline caps mr-2">Budget</dt>
                          <dd className="inline text-ink">{message.budget}</dd>
                        </div>
                      ) : null}
                    </dl>
                    <div className="mt-5 flex flex-wrap items-center gap-4">
                      <a
                        href={`mailto:${message.email}`}
                        className="inline-flex items-center gap-2 bg-ink px-4 py-2 caps text-ivory hover:bg-mocha"
                      >
                        Reply by email
                      </a>
                      <button
                        type="button"
                        onClick={() => act(message, { status: message.status === "read" ? "new" : "read" })}
                        className="inline-flex items-center gap-2 caps text-stone hover:text-ink"
                      >
                        <Check size={12} /> Mark as {message.status === "read" ? "new" : "read"}
                      </button>
                      <button
                        type="button"
                        onClick={() => act(message, { status: "archived" })}
                        className="inline-flex items-center gap-2 caps text-stone hover:text-ink"
                      >
                        <Archive size={12} /> Archive
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(message)}
                        className="inline-flex items-center gap-2 caps text-stone hover:text-destructive"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}