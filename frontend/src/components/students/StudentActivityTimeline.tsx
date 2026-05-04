import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Clock, User, ArrowRight, FileText, Trash2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface AuditEvent {
    id: string;
    action: string;
    userId?: string;
    entityId: string;
    changes?: Record<string, any>;
    timestamp: string;
    user?: { id: string; name: string; email: string } | null;
}

interface Props {
    studentId: string;
    isOpen: boolean;
}

const ACTION_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    STUDENT_CREATED: { icon: <FileText className="w-4 h-4" />, label: 'Student Created', color: 'text-green-400' },
    STUDENT_UPDATED: { icon: <ArrowRight className="w-4 h-4" />, label: 'Student Updated', color: 'text-blue-400' },
    STUDENT_STATUS_CHANGED: { icon: <CheckCircle className="w-4 h-4" />, label: 'Status Changed', color: 'text-amber-400' },
    STUDENT_DELETED: { icon: <Trash2 className="w-4 h-4" />, label: 'Student Deleted', color: 'text-red-400' },
    STUDENT_IMPORTED: { icon: <FileText className="w-4 h-4" />, label: 'Imported via CSV', color: 'text-purple-400' },
};

function formatTimestamp(ts: string): string {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatChanges(changes: Record<string, any> | undefined): string | null {
    if (!changes) return null;
    const parts: string[] = [];
    if (changes.oldStatus && changes.newStatus) {
        parts.push(`${changes.oldStatus} → ${changes.newStatus}`);
    }
    if (changes.name) parts.push(changes.name);
    if (changes.admissionNumber) parts.push(`Adm#: ${changes.admissionNumber}`);
    return parts.length > 0 ? parts.join(' · ') : null;
}

export default function StudentActivityTimeline({ studentId, isOpen }: Props) {
    const [events, setEvents] = useState<AuditEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (!isOpen || !studentId) return;

        setLoading(true);
        setError(null);

        api.get(`/student/${studentId}/audit`, { params: { page, limit: 10 } })
            .then(res => {
                const d = res.data;
                setEvents(d.data || []);
                setTotalPages(d.pagination?.totalPages || 1);
            })
            .catch(err => {
                setError(err.response?.data?.message || 'Failed to load audit trail');
            })
            .finally(() => setLoading(false));
    }, [studentId, isOpen, page]);

    if (!isOpen) return null;

    return (
        <div className="student-timeline">
            <h3 className="timeline-title">
                <Clock className="w-4 h-4" />
                Activity Timeline
            </h3>

            {loading && (
                <div className="timeline-loading">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading history…
                </div>
            )}

            {error && (
                <div className="timeline-error">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {!loading && !error && events.length === 0 && (
                <div className="timeline-empty">No activity recorded yet.</div>
            )}

            {!loading && events.length > 0 && (
                <div className="timeline-list">
                    {events.map((event, idx) => {
                        const config = ACTION_CONFIG[event.action] || {
                            icon: <FileText className="w-4 h-4" />,
                            label: event.action,
                            color: 'text-gray-400'
                        };
                        const changeText = formatChanges(event.changes);

                        return (
                            <div key={event.id} className="timeline-item">
                                <div className="timeline-connector">
                                    <span className={`timeline-dot ${config.color}`}>{config.icon}</span>
                                    {idx < events.length - 1 && <span className="timeline-line" />}
                                </div>

                                <div className="timeline-content">
                                    <div className="timeline-header">
                                        <span className={`timeline-action ${config.color}`}>{config.label}</span>
                                        <span className="timeline-time">{formatTimestamp(event.timestamp)}</span>
                                    </div>

                                    {event.user && (
                                        <div className="timeline-user">
                                            <User className="w-3 h-3" />
                                            {event.user.name}
                                        </div>
                                    )}

                                    {changeText && (
                                        <div className="timeline-changes">{changeText}</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {totalPages > 1 && (
                <div className="timeline-pagination">
                    <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                    <span>{page} / {totalPages}</span>
                    <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
                </div>
            )}

            <style>{`
                .student-timeline {
                    margin-top: 1rem;
                    padding: 1rem;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 12px;
                }
                .timeline-title {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: rgba(255,255,255,0.85);
                    margin-bottom: 1rem;
                }
                .timeline-loading, .timeline-error, .timeline-empty {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 1rem;
                    font-size: 0.85rem;
                    color: rgba(255,255,255,0.5);
                    justify-content: center;
                }
                .timeline-error { color: #f87171; }
                .timeline-list { display: flex; flex-direction: column; }
                .timeline-item {
                    display: flex;
                    gap: 0.75rem;
                }
                .timeline-connector {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 28px;
                    flex-shrink: 0;
                }
                .timeline-dot {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.06);
                    flex-shrink: 0;
                }
                .timeline-line {
                    width: 2px;
                    flex: 1;
                    min-height: 16px;
                    background: rgba(255,255,255,0.08);
                }
                .timeline-content {
                    flex: 1;
                    padding-bottom: 1rem;
                }
                .timeline-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 0.5rem;
                }
                .timeline-action {
                    font-weight: 600;
                    font-size: 0.82rem;
                }
                .timeline-time {
                    font-size: 0.75rem;
                    color: rgba(255,255,255,0.35);
                    white-space: nowrap;
                }
                .timeline-user {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    font-size: 0.78rem;
                    color: rgba(255,255,255,0.5);
                    margin-top: 2px;
                }
                .timeline-changes {
                    font-size: 0.78rem;
                    color: rgba(255,255,255,0.4);
                    margin-top: 2px;
                    font-style: italic;
                }
                .timeline-pagination {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    margin-top: 0.75rem;
                    padding-top: 0.75rem;
                    border-top: 1px solid rgba(255,255,255,0.06);
                }
                .timeline-pagination button {
                    background: none;
                    border: 1px solid rgba(255,255,255,0.15);
                    color: rgba(255,255,255,0.7);
                    padding: 0.25rem 0.75rem;
                    border-radius: 6px;
                    font-size: 0.78rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .timeline-pagination button:hover:not(:disabled) {
                    background: rgba(255,255,255,0.06);
                    border-color: rgba(255,255,255,0.25);
                }
                .timeline-pagination button:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }
                .timeline-pagination span {
                    font-size: 0.78rem;
                    color: rgba(255,255,255,0.4);
                }
                .text-green-400 { color: #4ade80; }
                .text-blue-400 { color: #60a5fa; }
                .text-amber-400 { color: #fbbf24; }
                .text-red-400 { color: #f87171; }
                .text-purple-400 { color: #c084fc; }
                .text-gray-400 { color: #9ca3af; }
            `}</style>
        </div>
    );
}
