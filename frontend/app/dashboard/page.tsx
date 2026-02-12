"use client";

import { useEffect, useState } from "react";
import type { SupportTicket, UrgencyLevel } from "@/lib/types";
import { useToast } from "@/lib/toast";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_TICKETS_API_URL;
const TICKET_DETAIL_BASE_URL =
    API_URL + '/ticket';

const categoryLabels: Record<string, string> = {
    BILLING: "Billing",
    TECHNICAL: "Technical",
    FEATURE_REQUEST: "Feature Request",
};

const statusLabels: Record<string, string> = {
    OPEN: "Open",
    CLOSED: "Closed",
};

const statusStyles: Record<string, string> = {
    OPEN: "bg-sky-100 text-sky-800",
    CLOSED: "bg-slate-100 text-slate-600",
};

const urgencyStyles: Record<UrgencyLevel, string> = {
    LOW: "bg-emerald-100 text-emerald-800 bg-emerald-900/30 text-emerald-400",
    MEDIUM: "bg-amber-100 text-amber-800 bg-amber-900/30 text-amber-400",
    HIGH: "bg-orange-100 text-orange-800 bg-red-900/30 text-orange-400"
};

function SentimentBadge({ score }: { score: number }) {
    const style =
        score > 5
            ? "bg-emerald-100 text-emerald-800 bg-emerald-900/30 text-emerald-400"
            : score == 5
                ? "bg-slate-100 text-slate-700 bg-slate-700/50 text-slate-300"
                : "bg-red-100 text-red-800 bg-red-900/30 text-red-400";
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
            title={`Score: ${score}`}
        >{score}
        </span>
    );
}

const DEFAULT_LIMIT = 10;

function humanizeEnum(value: string) {
    return value
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(isoOrDateStr: string | undefined): string {
    if (!isoOrDateStr) return "—";
    try {
        const d = new Date(isoOrDateStr);
        if (Number.isNaN(d.getTime())) return isoOrDateStr;
        return d.toLocaleDateString(undefined, {
            dateStyle: "medium",
            timeZone: "UTC",
        });
    } catch {
        return isoOrDateStr;
    }
}

export default function DashboardPage() {
    const { toast } = useToast();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(DEFAULT_LIMIT);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);
    const [detail, setDetail] = useState<SupportTicket | null>(null);
    const [draftMessage, setDraftMessage] = useState("");
    const [saving, setSaving] = useState(false);
    const [resolving, setResolving] = useState(false);
    const [editingMessageId, setEditingMessageId] = useState<string | number | null>(null);
    const [editingMessageText, setEditingMessageText] = useState("");
    const [updatingMessage, setUpdatingMessage] = useState(false);
    const [showNewMessageForm, setShowNewMessageForm] = useState(false);
    const [newMessageText, setNewMessageText] = useState("");
    const [creatingMessage, setCreatingMessage] = useState(false);

    useEffect(() => {
        async function fetchTickets() {
            try {
                setLoading(true);
                setError(null);
                const url = `${TICKET_DETAIL_BASE_URL}?limit=${limit}&page=${page}`;
                const res = await fetch(url);
                if (!res.ok) throw new Error(`Failed to load tickets: ${res.status}`);
                const json = await res.json();
                const list = json.data ?? (Array.isArray(json) ? json : []);
                const mapped = list.map((e: Record<string, unknown>) => ({
                    id: String(e.id),
                    customerName: String(e.customer_name ?? e.customerName ?? ""),
                    customerEmail: String(e.customer_email ?? e.customerEmail ?? (e as Record<string, unknown>).email ?? ""),
                    subject: String(e.subject ?? ""),
                    urgencyLevel: String(e.urgency_level ?? e.urgencyLevel ?? ""),
                    category: String(e.category ?? ""),
                    status: String(e.status ?? ""),
                    sentimentScore: Number(e.sentiment_score ?? e.sentimentScore ?? 0),
                    createdAt: e.created_at != null ? String(e.created_at) : undefined,
                }));
                setTickets(mapped);
                const meta = json.meta ?? {};
                setTotal(typeof meta.total === "number" ? meta.total : mapped.length);
                setTotalPages(typeof meta.totalPages === "number" ? meta.totalPages : 1);

                // Default view is the first ticket.
                if (mapped.length > 0) {
                    setSelectedTicketId((prev) => prev ?? mapped[0].id);
                } else {
                    setSelectedTicketId(null);
                    setDetail(null);
                    setDraftMessage("");
                }
            } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to load tickets");
                setTickets([]);
                setTotal(0);
                setTotalPages(0);
                setSelectedTicketId(null);
            } finally {
                setLoading(false);
            }
        }
        fetchTickets();
    }, [page, limit]);

    useEffect(() => {
        async function fetchDetail(id: string) {
            try {
                setDetailLoading(true);
                setDetailError(null);
                const res = await fetch(`${TICKET_DETAIL_BASE_URL}/${id}`);
                if (!res.ok) throw new Error(`Failed to load ticket detail: ${res.status}`);
                const json = await res.json() as any;
                const mapped = {
                    id: json.id,
                    customerName: String(json.customer_name ?? json.customerName ?? ""),
                    customerEmail: String(json.customer_email ?? json.customerEmail ?? (json as Record<string, unknown>).email ?? ""),
                    subject: String(json.subject ?? ""),
                    urgencyLevel: String(json.urgency_level ?? json.urgencyLevel ?? ""),
                    category: String(json.category ?? ""),
                    status: String(json.status ?? ""),
                    sentimentScore: Number(json.sentiment_score ?? json.sentimentScore ?? 0),
                    createdAt: json.created_at != null ? String(json.created_at) : undefined,
                    description: String(json.description) ?? '',
                    messages: json.messages.map((e: any) => {
                        return {
                            id: e.id ?? e.ticket_id,
                            ticketId: e.ticket_id,
                            userType: e.user_type,
                            status: e.status,
                            message: e.message,
                            createdAt: e.created_at != null ? String(e.created_at) : undefined,
                        }
                    }),
                };
                const d = mapped as SupportTicket;
                setDetail(d);
                setDraftMessage('');
            } catch (e) {
                setDetail(null);
                setDraftMessage("");
                setDetailError(e instanceof Error ? e.message : "Failed to load ticket detail");
            } finally {
                setDetailLoading(false);
            }
        }

        if (!selectedTicketId) return;
        fetchDetail(selectedTicketId);
    }, [selectedTicketId]);

    async function updateDraftMessage(messageId: string | number, messageText: string) {
        // Prevent editing if ticket is closed
        if (detail && detail.status === 'CLOSED') {
            toast({
                variant: "info",
                title: "Ticket is resolved",
                description: "Draft messages can’t be edited after a ticket is resolved.",
            });
            return;
        }
        
        try {
            setUpdatingMessage(true);
            const url = API_URL + `/ticket-message/${messageId}`;
            const res = await fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: messageText }),
            });

            if (!res.ok) {
                throw new Error(`Failed to update message: ${res.status}`);
            }

            // Refresh the detail to get updated message
            if (selectedTicketId) {
                const detailRes = await fetch(`${TICKET_DETAIL_BASE_URL}/${selectedTicketId}`);
                if (detailRes.ok) {
                    const json = await detailRes.json() as any;
                    const mapped = {
                        id: json.id,
                        customerName: String(json.customer_name ?? json.customerName ?? ""),
                        customerEmail: String(json.customer_email ?? json.customerEmail ?? (json as Record<string, unknown>).email ?? ""),
                        subject: String(json.subject ?? ""),
                        urgencyLevel: String(json.urgency_level ?? json.urgencyLevel ?? ""),
                        category: String(json.category ?? ""),
                        status: String(json.status ?? ""),
                        sentimentScore: Number(json.sentiment_score ?? json.sentimentScore ?? 0),
                        createdAt: json.created_at != null ? String(json.created_at) : undefined,
                        description: String(json.description) ?? '',
                        messages: json.messages.map((e: any) => {
                            return {
                                id: e.id ?? e.ticket_id,
                                ticketId: e.ticket_id,
                                userType: e.user_type,
                                status: e.status,
                                message: e.message,
                                createdAt: e.created_at != null ? String(e.created_at) : undefined,
                            }
                        }),
                    };
                    setDetail(mapped as SupportTicket);
                }
            }

            setEditingMessageId(null);
            setEditingMessageText("");
        } catch (e) {
            toast({
                variant: "error",
                title: "Update failed",
                description: e instanceof Error ? e.message : "Failed to update message",
            });
        } finally {
            setUpdatingMessage(false);
        }
    }

    async function publishMessage(messageId: string | number, messageText: string) {
        if (detail && detail.status === 'CLOSED') {
            toast({
                variant: "info",
                title: "Ticket is resolved",
                description: "Messages can’t be published after a ticket is resolved.",
            });
            return;
        }

        try {
            setUpdatingMessage(true);
            const url = API_URL + `/ticket-message/${messageId}/publish`;
            const res = await fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: messageText }),
            });

            if (!res.ok) {
                throw new Error(`Failed to publish message: ${res.status}`);
            }

            if (selectedTicketId) {
                const detailRes = await fetch(`${TICKET_DETAIL_BASE_URL}/${selectedTicketId}`);
                if (detailRes.ok) {
                    const json = await detailRes.json() as any;
                    const mapped = {
                        id: json.id,
                        customerName: String(json.customer_name ?? json.customerName ?? ""),
                        customerEmail: String(json.customer_email ?? json.customerEmail ?? (json as Record<string, unknown>).email ?? ""),
                        subject: String(json.subject ?? ""),
                        urgencyLevel: String(json.urgency_level ?? json.urgencyLevel ?? ""),
                        category: String(json.category ?? ""),
                        status: String(json.status ?? ""),
                        sentimentScore: Number(json.sentiment_score ?? json.sentimentScore ?? 0),
                        createdAt: json.created_at != null ? String(json.created_at) : undefined,
                        description: String(json.description) ?? '',
                        messages: json.messages.map((e: any) => {
                            return {
                                id: e.id ?? e.ticket_id,
                                ticketId: e.ticket_id,
                                userType: e.user_type,
                                status: e.status,
                                message: e.message,
                                createdAt: e.created_at != null ? String(e.created_at) : undefined,
                            }
                        }),
                    };
                    setDetail(mapped as SupportTicket);
                }
            }

            setEditingMessageId(null);
            setEditingMessageText("");

            toast({
                variant: "success",
                title: "Message published",
                description: "The draft message has been published.",
            });
        } catch (e) {
            toast({
                variant: "error",
                title: "Publish failed",
                description: e instanceof Error ? e.message : "Failed to publish message",
            });
        } finally {
            setUpdatingMessage(false);
        }
    }

    async function resolveTicket(ticketId: string) {
        try {
            setResolving(true);
            const url = `${API_URL}/ticket/${ticketId}/resolve`;
            const res = await fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            // If CORS isn't enabled on the server, fetch can return an opaque response
            // (status 0 / ok false). In that case we can't inspect status/body, so we
            // treat it as best-effort and rely on the follow-up fetches to sync state.
            if (!res.ok && res.type !== "opaque" && res.status !== 0) {
                throw new Error(`Failed to resolve ticket: ${res.status}`);
            }
            
            // Close any open edit mode
            setEditingMessageId(null);
            setEditingMessageText("");
            
            // Refresh the ticket list and detail in parallel
            const [listRes, detailRes] = await Promise.all([
                fetch(`${TICKET_DETAIL_BASE_URL}?limit=${limit}&page=${page}`),
                fetch(`${TICKET_DETAIL_BASE_URL}/${ticketId}`)
            ]);
            
            // Update ticket list
            if (listRes.ok) {
                const json = await listRes.json();
                const list = json.data ?? (Array.isArray(json) ? json : []);
                const mapped = list.map((e: Record<string, unknown>) => ({
                    id: String(e.id),
                    customerName: String(e.customer_name ?? e.customerName ?? ""),
                    customerEmail: String(e.customer_email ?? e.customerEmail ?? (e as Record<string, unknown>).email ?? ""),
                    subject: String(e.subject ?? ""),
                    urgencyLevel: String(e.urgency_level ?? e.urgencyLevel ?? ""),
                    category: String(e.category ?? ""),
                    status: String(e.status ?? ""),
                    sentimentScore: Number(e.sentiment_score ?? e.sentimentScore ?? 0),
                    createdAt: e.created_at != null ? String(e.created_at) : undefined,
                }));
                setTickets(mapped);
                
                // Update pagination metadata
                const meta = json.meta ?? {};
                setTotal(typeof meta.total === "number" ? meta.total : mapped.length);
                setTotalPages(typeof meta.totalPages === "number" ? meta.totalPages : 1);
            }
            
            // Update detail
            if (detailRes.ok) {
                const json = await detailRes.json() as any;
                const mapped = {
                    id: json.id,
                    customerName: String(json.customer_name ?? json.customerName ?? ""),
                    customerEmail: String(json.customer_email ?? json.customerEmail ?? (json as Record<string, unknown>).email ?? ""),
                    subject: String(json.subject ?? ""),
                    urgencyLevel: String(json.urgency_level ?? json.urgencyLevel ?? ""),
                    category: String(json.category ?? ""),
                    status: String(json.status ?? ""),
                    sentimentScore: Number(json.sentiment_score ?? json.sentimentScore ?? 0),
                    createdAt: json.created_at != null ? String(json.created_at) : undefined,
                    description: String(json.description) ?? '',
                    messages: json.messages.map((e: any) => {
                        return {
                            id: e.id ?? e.ticket_id,
                            ticketId: e.ticket_id,
                            userType: e.user_type,
                            status: e.status,
                            message: e.message,
                            createdAt: e.created_at != null ? String(e.created_at) : undefined,
                        }
                    }),
                };
                setDetail(mapped as SupportTicket);
            }
            toast({
                variant: "success",
                title: "Ticket resolved",
                description: "Ticket status has been updated.",
            });
        } catch (e) {
            toast({
                variant: "error",
                title: "Resolve failed",
                description: e instanceof Error ? e.message : "Failed to resolve ticket",
            });
        } finally {
            setResolving(false);
        }
    }

    async function createMessageForTicket(ticketId: string) {
        if (!newMessageText.trim()) {
            toast({
                variant: "info",
                title: "Add a message",
                description: "Please write a message before submitting.",
            });
            return;
        }

        if (detail && detail.status === "CLOSED") {
            toast({
                variant: "info",
                title: "Ticket is resolved",
                description: "New messages can’t be added after a ticket is resolved.",
            });
            return;
        }

        try {
            setCreatingMessage(true);
            const numericId = Number(ticketId);
            const url = API_URL + `/ticket-message/${ticketId}`;
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ticket_id: Number.isNaN(numericId) ? ticketId : numericId,
                    message: newMessageText.trim(),
                }),
            });

            if (!res.ok) {
                throw new Error(`Failed to create message: ${res.status}`);
            }

            if (selectedTicketId) {
                const detailRes = await fetch(`${TICKET_DETAIL_BASE_URL}/${selectedTicketId}`);
                if (detailRes.ok) {
                    const json = await detailRes.json() as any;
                    const mapped = {
                        id: json.id,
                        customerName: String(json.customer_name ?? json.customerName ?? ""),
                        customerEmail: String(json.customer_email ?? json.customerEmail ?? (json as Record<string, unknown>).email ?? ""),
                        subject: String(json.subject ?? ""),
                        urgencyLevel: String(json.urgency_level ?? json.urgencyLevel ?? ""),
                        category: String(json.category ?? ""),
                        status: String(json.status ?? ""),
                        sentimentScore: Number(json.sentiment_score ?? json.sentimentScore ?? 0),
                        createdAt: json.created_at != null ? String(json.created_at) : undefined,
                        description: String(json.description) ?? '',
                        messages: json.messages.map((e: any) => {
                            return {
                                id: e.id ?? e.ticket_id,
                                ticketId: e.ticket_id,
                                userType: e.user_type,
                                status: e.status,
                                message: e.message,
                                createdAt: e.created_at != null ? String(e.created_at) : undefined,
                            }
                        }),
                    };
                    setDetail(mapped as SupportTicket);
                }
            }

            setNewMessageText("");
            setShowNewMessageForm(false);

            toast({
                variant: "success",
                title: "Message added",
                description: "Your message has been added to the ticket.",
            });
        } catch (e) {
            toast({
                variant: "error",
                title: "Create message failed",
                description: e instanceof Error ? e.message : "Failed to create message",
            });
        } finally {
            setCreatingMessage(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--background)] p-6 md:p-8">
                <div className="mx-auto max-w-7xl">
                    <h1 className="mb-8 text-2xl font-semibold text-[var(--foreground)]">
                        Support Tickets
                    </h1>
                    <div className="flex items-center justify-center rounded-xl border border-[var(--foreground)]/10 bg-[var(--background)] py-24">
                        <p className="text-[var(--foreground)]/70">Loading tickets…</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[var(--background)] p-6 md:p-8">
                <div className="mx-auto max-w-7xl">
                    <h1 className="mb-8 text-2xl font-semibold text-[var(--foreground)]">
                        Support Tickets
                    </h1>
                    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800 border-red-900/50 bg-red-950/30 text-red-400">
                        <p className="font-medium">Error</p>
                        <p className="mt-1 text-sm">{error}</p>
                        <p className="mt-2 text-xs opacity-80">
                            Set NEXT_PUBLIC_TICKETS_API_URL to your API base URL, or use the
                            default /api/tickets.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--background)] p-6 md:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Support Tickets</h1>
                        <p className="mt-1 text-sm text-[var(--foreground)]/60">
                            Click a ticket to view details and edit the agent draft reply.
                        </p>
                    </div>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-md border border-[var(--foreground)]/15 bg-[var(--background)] px-3 py-2 text-xs font-medium text-[var(--foreground)]/80 hover:bg-[var(--foreground)]/5"
                    >
                        <span aria-hidden>←</span>
                        Back to home
                    </Link>
                </div>

                {tickets.length === 0 ? (
                    <div className="rounded-xl border border-[var(--foreground)]/10 bg-[var(--background)] p-10 text-center">
                        <p className="text-[var(--foreground)]/70">No tickets available.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                        {/* Left: Ticket list (cards) */}
                        <aside className="lg:col-span-5">
                            <div className="rounded-xl border border-[var(--foreground)]/10 bg-[var(--background)] shadow-sm">
                                <div className="flex items-center justify-between gap-3 border-b border-[var(--foreground)]/10 p-4">
                                    <p className="text-sm font-medium text-[var(--foreground)]">Tickets</p>
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs text-[var(--foreground)]/60" htmlFor="page-size">
                                            Per page
                                        </label>
                                        <select
                                            id="page-size"
                                            value={limit}
                                            onChange={(e) => {
                                                setLimit(Number(e.target.value));
                                                setPage(1);
                                            }}
                                            className="rounded-md border border-[var(--foreground)]/20 bg-[var(--background)] px-2 py-1 text-xs text-[var(--foreground)]"
                                        >
                                            {[5, 10, 20, 50].map((n) => (
                                                <option key={n} value={n}>
                                                    {n}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="max-h-[70vh] overflow-auto p-2">
                                    {tickets.map((t) => {
                                        const active = t.id === selectedTicketId;
                                        return (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => setSelectedTicketId(t.id)}
                                                className={`w-full rounded-lg border p-4 text-left transition ${active
                                                    ? "border-[var(--foreground)]/30 bg-[var(--foreground)]/5"
                                                    : "border-[var(--foreground)]/10 hover:bg-[var(--foreground)]/5"
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="line-clamp-3 text-sm font-semibold text-[var(--foreground)]">
                                                            {t.subject}
                                                        </p>
                                                        <p className="mt-1 truncate text-xs text-[var(--foreground)]/60">
                                                            {t.customerName} • {t.customerEmail}
                                                        </p>
                                                        <p className="mt-1 text-xs text-[var(--foreground)]/50">
                                                            {formatDate(t.createdAt)}
                                                        </p>
                                                    </div>
                                                    <div className="flex shrink-0 flex-col items-end gap-2">
                                                        <span
                                                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[t.status] ?? "bg-slate-100 text-slate-600"}`}
                                                        >
                                                            {statusLabels[t.status] ?? t.status}
                                                        </span>
                                                        <span
                                                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${urgencyStyles[t.urgencyLevel] ?? ""}`}
                                                        >
                                                            {t.urgencyLevel}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                                    <span className="rounded-md bg-[var(--foreground)]/5 px-2 py-1 text-xs text-[var(--foreground)]/80">
                                                        {categoryLabels[t.category] ?? humanizeEnum(t.category)}
                                                    </span>
                                                    <span className="text-xs text-[var(--foreground)]/60">
                                                        Sentiment <SentimentBadge score={t.sentimentScore} />
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {totalPages > 0 && (
                                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--foreground)]/10 p-4">
                                        <p className="text-xs text-[var(--foreground)]/60">
                                            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
                                        </p>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                                disabled={page <= 1}
                                                className="rounded-md border border-[var(--foreground)]/20 px-2 py-1 text-xs text-[var(--foreground)] disabled:opacity-50"
                                            >
                                                Prev
                                            </button>
                                            <span className="px-2 text-xs text-[var(--foreground)]/70">
                                                {page} / {totalPages || 1}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                                disabled={page >= totalPages}
                                                className="rounded-md border border-[var(--foreground)]/20 px-2 py-1 text-xs text-[var(--foreground)] disabled:opacity-50"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </aside>

                        {/* Right: Ticket detail */}
                        <section className="lg:col-span-7">
                            <div className="rounded-xl border border-[var(--foreground)]/10 bg-[var(--background)] shadow-sm">
                                <div className="border-b border-[var(--foreground)]/10 p-4 flex items-center justify-between gap-3">
                                    <p className="text-sm font-medium text-[var(--foreground)]">Ticket Detail</p>
                                    {detail && detail.status === 'OPEN' && (
                                        <button
                                            type="button"
                                            onClick={() => resolveTicket(detail.id)}
                                            disabled={resolving}
                                            className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed bg-green-500 hover:bg-green-600"
                                        >
                                            {resolving ? 'Resolving...' : 'Resolve Ticket'}
                                        </button>
                                    )}
                                </div>

                                <div className="p-4">
                                    {detailLoading ? (
                                        <div className="rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-10 text-center">
                                            <p className="text-[var(--foreground)]/70">Loading detail…</p>
                                        </div>
                                    ) : detailError ? (
                                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
                                            <p className="text-sm font-medium">Unable to load detail</p>
                                            <p className="mt-1 text-xs opacity-90">{detailError}</p>
                                        </div>
                                    ) : !detail ? (
                                        <div className="rounded-lg border border-[var(--foreground)]/10 bg-[var(--background)] p-10 text-center">
                                            <p className="text-[var(--foreground)]/70">
                                                Select a ticket to view details.
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h2 className="truncate text-lg font-semibold text-[var(--foreground)]">
                                                        {detail.customerName}
                                                    </h2>
                                                    <p className="mt-1 text-sm text-[var(--foreground)]/60">
                                                        {detail.customerEmail}
                                                    </p>
                                                    <p className="mt-1 text-xs text-[var(--foreground)]/50">
                                                        Ticket ID: {detail.id} · Created {formatDate(detail.createdAt)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[detail.status] ?? "bg-slate-100 text-slate-600"}`}
                                                    >
                                                        {statusLabels[detail.status] ?? detail.status}
                                                    </span>
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${urgencyStyles[detail.urgencyLevel] ?? ""}`}
                                                    >
                                                        {detail.urgencyLevel}
                                                    </span>
                                                    <span className="rounded-md bg-[var(--foreground)]/5 px-2 py-1 text-xs text-[var(--foreground)]/80">
                                                        {categoryLabels[detail.category] ?? humanizeEnum(detail.category)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-4 rounded-lg border border-[var(--foreground)]/10 bg-[var(--foreground)]/5 p-4">
                                                <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground)]/50">Subject</p>
                                                <p className="mt-1 text-sm text-[var(--foreground)]">{detail.subject}</p>
                                                <p className="mt-4 text-xs font-medium uppercase tracking-wide text-[var(--foreground)]/50">Description</p>
                                                <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--foreground)]/90">
                                                    {detail.description}
                                                </p>
                                            </div>
                                            
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Messages Section - Forum Style */}
                            {detail && (
                                <div className="mt-4 rounded-xl border border-[var(--foreground)]/10 bg-[var(--background)] shadow-sm">
                                    <div className="flex items-center justify-between gap-3 border-b border-[var(--foreground)]/10 p-4">
                                        <p className="text-sm font-medium text-[var(--foreground)]">
                                            Messages ({detail.messages?.length ?? 0})
                                        </p>
                                        {detail.status === "OPEN" && (
                                            <button
                                                type="button"
                                                onClick={() => setShowNewMessageForm((v) => !v)}
                                                className="inline-flex items-center rounded-md border border-[var(--foreground)]/20 bg-[var(--background)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)]/80 hover:bg-[var(--foreground)]/5 disabled:opacity-50"
                                                disabled={creatingMessage}
                                            >
                                                {showNewMessageForm ? "Close form" : "New message"}
                                            </button>
                                        )}
                                    </div>
                                    <div className="p-4 space-y-4">
                                        {showNewMessageForm && detail.status === "OPEN" && (
                                            <div className="rounded-lg border border-[var(--foreground)]/15 bg-white p-4 shadow-sm">
                                                <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground)]/60">
                                                    New message
                                                </p>
                                                <textarea
                                                    value={newMessageText}
                                                    onChange={(e) => setNewMessageText(e.target.value)}
                                                    rows={4}
                                                    className="mt-2 w-full rounded-md border border-[var(--foreground)]/20 bg-[var(--background)] p-2 text-sm text-[var(--foreground)] focus:border-[var(--foreground)]/40 focus:outline-none"
                                                    placeholder="Write a reply to the customer…"
                                                    disabled={creatingMessage}
                                                />
                                                <div className="mt-3 flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => createMessageForTicket(detail.id)}
                                                        disabled={creatingMessage || !newMessageText.trim()}
                                                        className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {creatingMessage ? "Posting…" : "Post message"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowNewMessageForm(false);
                                                            setNewMessageText("");
                                                        }}
                                                        disabled={creatingMessage}
                                                        className="rounded-md border border-[var(--foreground)]/20 px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--foreground)]/5 disabled:opacity-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        {detail.messages && detail.messages.length > 0 ? (
                                            detail.messages.map((msg, index) => {
                                            const userType = msg.userType ?? msg.user_type ?? 'CUSTOMER';
                                            const isAgent = userType === 'AGENT';
                                            const isDraft = msg.status === 'DRAFT';
                                            const isEditing = editingMessageId === (msg.id ?? index);
                                            const isTicketClosed = detail.status === 'CLOSED';
                                            const canEdit = isDraft && isAgent && !isTicketClosed;

                                            return (
                                                <div
                                                    key={msg.id ?? index}
                                                    className={`rounded-lg border p-4 shadow-sm ${isAgent
                                                        ? 'border-blue-200 bg-white'
                                                        : 'border-purple-200 bg-white'
                                                        }`}
                                                >
                                                    <div className="flex items-start justify-between gap-3 mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${isAgent
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : 'bg-purple-100 text-purple-800'
                                                                }`}>
                                                                {isAgent ? 'Agent' : 'Customer'}
                                                            </span>
                                                            {isDraft && (
                                                                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800">
                                                                    Draft
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {msg.createdAt && (
                                                                <span className="text-xs text-[var(--foreground)]/50">
                                                                    {formatDate(msg.createdAt)}
                                                                </span>
                                                            )}
                                                            {canEdit && (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            if (isEditing) {
                                                                                setEditingMessageId(null);
                                                                                setEditingMessageText("");
                                                                            } else {
                                                                                setEditingMessageId(msg.id ?? index);
                                                                                setEditingMessageText(msg.message);
                                                                            }
                                                                        }}
                                                                        className="rounded-md border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                        disabled={updatingMessage}
                                                                    >
                                                                        {isEditing ? 'Cancel' : 'Edit'}
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            publishMessage(
                                                                                msg.id ?? index,
                                                                                isEditing && editingMessageId === (msg.id ?? index)
                                                                                    ? (editingMessageText || msg.message)
                                                                                    : msg.message
                                                                            )
                                                                        }
                                                                        disabled={updatingMessage || isTicketClosed}
                                                                        className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    >
                                                                        Publish
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {isEditing ? (
                                                        <div className="space-y-2">
                                                            <textarea
                                                                value={editingMessageText}
                                                                onChange={(e) => setEditingMessageText(e.target.value)}
                                                                className="w-full rounded-md border border-[var(--foreground)]/20 bg-[var(--background)] p-2 text-sm text-[var(--foreground)] focus:border-[var(--foreground)]/40 focus:outline-none"
                                                                rows={4}
                                                                disabled={updatingMessage || isTicketClosed}
                                                            />
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateDraftMessage(msg.id ?? index, editingMessageText)}
                                                                    disabled={updatingMessage || !editingMessageText.trim() || isTicketClosed}
                                                                    className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-500 hover:bg-blue-600"
                                                                >
                                                                    {updatingMessage ? 'Saving...' : 'Save'}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setEditingMessageId(null);
                                                                        setEditingMessageText("");
                                                                    }}
                                                                    disabled={updatingMessage}
                                                                    className="rounded-md border border-[var(--foreground)]/20 px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--foreground)]/5 disabled:opacity-50"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm whitespace-pre-wrap text-[var(--foreground)]/90">
                                                            {msg.message}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                        ) : (
                                            <p className="text-sm text-[var(--foreground)]/60">
                                                No messages yet for this ticket.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}
