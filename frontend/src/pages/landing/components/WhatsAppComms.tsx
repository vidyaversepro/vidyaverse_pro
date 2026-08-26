import { motion } from 'framer-motion';
import { Bell, CreditCard, Bot, ShieldCheck, Send } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * WhatsApp parent-communication section — surfaces the Urmi assimilation that
 * the old landing never showed. The phone mockup is now a LIVE demo: type a
 * question (Hindi or English) or tap a quick chip and the "AI" answers from a
 * small grounded rule-set, mirroring the reference prototype's reply logic.
 */

type InMsg = { dir: 'in'; label?: string; labelColor?: string; text: string; time: string; pay?: boolean };
type OutMsg = { dir: 'out'; text: string; time: string };
type ChatMsg = InMsg | OutMsg | { typing: true };

const capabilities = [
    { icon: Bell, title: 'Automated alerts', desc: 'Attendance, fees & results the moment they happen.' },
    { icon: CreditCard, title: 'One-tap fee pay', desc: 'Razorpay link inside the chat; books reconcile.' },
    { icon: Bot, title: 'AI that answers', desc: 'Bilingual replies grounded in real records.' },
    { icon: ShieldCheck, title: 'DPDP-compliant', desc: 'Consent-first, opt-outs honoured, audit-logged.' },
];

const quickChips = ['Kitni fees baaki hai?', 'Aaj ki attendance?', 'Result kab aayega?'];

function now(): string {
    const d = new Date();
    let h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, '0');
    const ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ap}`;
}

/** The demo's "AI" — keyword-matched answers over a fixed student record. */
function reply(input: string): string {
    const t = input.toLowerCase();
    if (/fee|fees|baaki|paisa|due|pay/.test(t)) {
        return 'आपके 1 बच्चे हैं। Term-2 में कुल ₹12,500 बाकी है (Aarav)। पिछली payment 02 Apr को ₹10,000 मिली थी। एक tap में pay करें 🧾';
    }
    if (/attend|present|absent|upasthit|haazri|aaj/.test(t)) {
        return 'Aarav is present today ✅. इस महीने attendance 96% रही है (22 / 23 days)।';
    }
    if (/result|marks|exam|grade|report/.test(t)) {
        return 'Term-2 results 20 Jun को publish होंगे। पिछली बार Aarav ने 88% score किया था 🎉';
    }
    if (/bus|transport|gaadi|pickup/.test(t)) {
        return 'Bus #7 अभी on-route है, ETA 7:52 AM 🚌। Live GPS link app में उपलब्ध है।';
    }
    return 'नमस्ते! मैं Vidyaverse AI हूँ 🙏 — fees, attendance, results या transport के बारे में पूछें। I can reply in Hindi or English.';
}

const initialMessages: ChatMsg[] = [
    { dir: 'in', label: 'ATTENDANCE', labelColor: '#0A7A4F', text: 'Aarav was marked present today at 8:42 AM ✅', time: '8:43 AM' },
    { dir: 'in', label: 'FEE REMINDER', labelColor: '#B45309', text: 'Term-2 fee of ₹12,500 is due on 15 Jun.', time: '9:01 AM', pay: true },
];

function ChatBubble({ m }: { m: Exclude<ChatMsg, { typing: true }> }) {
    if (m.dir === 'in') {
        return (
            <div
                className="self-start max-w-[88%] px-3 py-[9px] shadow-sm"
                style={{ background: '#fff', borderRadius: '12px 12px 12px 3px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
            >
                {m.label && (
                    <div className="text-[9px] font-extrabold tracking-[0.04em] mb-[3px]" style={{ color: m.labelColor }}>
                        {m.label}
                    </div>
                )}
                <div className="text-[12.5px] leading-[1.5]" style={{ color: '#1a1a1a' }}>
                    {m.text}
                </div>
                {/* Dark ink on the green, not white. WhatsApp's own green (#25D366) is
                    kept — recolouring it would stop the mock reading as WhatsApp — but
                    white on it measures 1.98:1. Near-black on the same green is 7.49. */}
                {m.pay && (
                    <div className="mt-2 py-2 rounded-lg text-center text-xs font-bold" style={{ background: '#25D366', color: '#0B2E13' }}>
                        💳 Pay now — secure link
                    </div>
                )}
                <div className="text-right text-[9px] mt-[3px]" style={{ color: '#6e6e6e' }}>
                    {m.time}
                </div>
            </div>
        );
    }
    return (
        <div
            className="self-end max-w-[80%] px-3 py-[9px] shadow-sm"
            style={{ background: '#DCF8C6', borderRadius: '12px 12px 3px 12px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
        >
            <div className="text-[12.5px] leading-[1.5]" style={{ color: '#1a1a1a' }}>
                {m.text}
            </div>
            <div className="text-right text-[9px] mt-[3px]" style={{ color: '#5a8a4a' }}>
                {m.time} ✓✓
            </div>
        </div>
    );
}

export default function WhatsAppComms() {
    const [messages, setMessages] = useState<ChatMsg[]>(initialMessages);
    const [chatInput, setChatInput] = useState('');
    const chatRef = useRef<HTMLDivElement>(null);
    const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const scrollChat = useCallback(() => {
        requestAnimationFrame(() => {
            if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
        });
    }, []);

    useEffect(() => scrollChat(), [messages, scrollChat]);

    useEffect(() => () => {
        if (replyTimer.current) clearTimeout(replyTimer.current);
    }, []);

    const send = useCallback((text: string) => {
        const t = (text || '').trim();
        if (!t) return;
        setChatInput('');
        setMessages((prev) => [...prev, { dir: 'out', text: t, time: now() }, { typing: true }]);
        if (replyTimer.current) clearTimeout(replyTimer.current);
        replyTimer.current = setTimeout(() => {
            const r = reply(t);
            setMessages((prev) => [
                ...prev.filter((m) => !('typing' in m)),
                { dir: 'in', label: 'VIDYAVERSE AI', labelColor: '#7C3AED', text: r, time: now() },
            ]);
        }, 1200);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            send(chatInput);
        }
    };

    return (
        <section id="communication" className="px-[clamp(16px,4vw,28px)] py-[clamp(64px,9vw,110px)]">
            <div
                className="max-w-[1120px] mx-auto grid items-center"
                style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'clamp(32px,6vw,64px)' }}
            >
                {/* Left: copy */}
                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                    <span className="text-xs font-bold tracking-[0.16em] uppercase" style={{ color: 'var(--ink-teal)' }}>
                        The differentiator · try it live
                    </span>
                    <h2
                        className="my-3.5 leading-[1.1] text-[clamp(28px,4.6vw,48px)]"
                        style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
                    >
                        Every parent reached, on WhatsApp
                    </h2>
                    <p className="leading-[1.65] text-[clamp(15px,2vw,18px)] mb-[26px] [text-wrap:pretty]" style={{ color: 'var(--text2)' }}>
                        Type a message in the demo — ask about fees, attendance or results in Hindi or English. Our AI
                        answers from live student data, day and night.
                    </p>
                    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                        {capabilities.map((c) => (
                            <div key={c.title} className="flex gap-[11px] items-start">
                                <span
                                    className="shrink-0 w-[34px] h-[34px] rounded-[10px] flex items-center justify-center"
                                    style={{ background: 'rgb(var(--teal-rgb) / 0.14)', color: 'var(--ink-teal)' }}
                                >
                                    <c.icon size={17} strokeWidth={2} />
                                </span>
                                <div>
                                    <h4 className="text-sm font-extrabold m-0 mb-[3px]" style={{ color: 'var(--text)' }}>
                                        {c.title}
                                    </h4>
                                    <p className="text-[12.5px] leading-[1.5] m-0" style={{ color: 'var(--text2)' }}>
                                        {c.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Right: interactive phone mockup */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="flex justify-center"
                >
                    <div
                        className="w-[320px] max-w-full rounded-[34px] p-3"
                        style={{
                            background: '#111827',
                            boxShadow: '0 32px 80px rgb(37 211 102 / 0.18), 0 0 0 1px var(--border)',
                        }}
                    >
                        <div className="rounded-3xl overflow-hidden" style={{ background: '#ECE5DD' }}>
                            {/* WA header */}
                            <div className="flex items-center gap-2.5 px-4 py-3.5 text-white" style={{ background: '#075E54' }}>
                                <span
                                    className="w-9 h-9 rounded-full flex items-center justify-center"
                                    style={{ background: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-display)', fontSize: 16 }}
                                >
                                    वि
                                </span>
                                <div className="flex-1">
                                    <div className="text-sm font-bold">Sunrise Public School</div>
                                    <div className="text-[11px]" style={{ opacity: 0.75 }}>
                                        online · AI assistant
                                    </div>
                                </div>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
                                    <path d="M12 2l2.4 2.1 3.1-.5 1 3 2.9 1.3-1 3 1 3-2.9 1.3-1 3-3.1-.5L12 22l-2.4-2.1-3.1.5-1-3L2.6 15.5l1-3-1-3 2.9-1.3 1-3 3.1.5z" />
                                    <path d="M9 12l2 2 4-4" stroke="#075E54" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>

                            {/* Chat body */}
                            <div
                                ref={chatRef}
                                className="flex flex-col gap-[9px] h-[320px] overflow-y-auto px-3 py-3.5"
                                style={{
                                    backgroundImage: 'radial-gradient(rgba(0,0,0,0.035) 1px, transparent 0)',
                                    backgroundSize: '16px 16px',
                                }}
                            >
                                {messages.map((m, i) =>
                                    'typing' in m ? (
                                        <div
                                            key={`typing-${i}`}
                                            className="self-start bg-white px-3.5 py-[11px] shadow-sm flex gap-1"
                                            style={{ borderRadius: '12px 12px 12px 3px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                                        >
                                            {[0, 1, 2].map((d) => (
                                                <span
                                                    key={d}
                                                    className="w-[7px] h-[7px] rounded-full"
                                                    style={{ background: '#7C3AED', animation: `lg-tdot 1s infinite ${d * 0.15}s` }}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <ChatBubble key={i} m={m} />
                                    )
                                )}
                            </div>

                            {/* Quick chips */}
                            <div className="flex flex-wrap gap-1.5 px-2.5 pt-2 pb-[3px]" style={{ background: '#F0F0F0' }}>
                                {quickChips.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => send(c)}
                                        className="text-[11px] font-semibold px-[11px] py-1.5 rounded-full cursor-pointer"
                                        style={{ border: '1px solid rgba(0,0,0,0.12)', background: '#fff', color: '#333' }}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>

                            {/* Input bar */}
                            <div className="flex items-center gap-2 px-2.5 pb-2.5" style={{ background: '#F0F0F0' }}>
                                <input
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type a message…"
                                    className="flex-1 min-w-0 border-none outline-none rounded-full px-3.5 py-2.5 text-[12.5px]"
                                    style={{ background: '#fff', color: '#333', fontFamily: 'var(--font-body)' }}
                                />
                                <button
                                    onClick={() => send(chatInput)}
                                    aria-label="Send"
                                    className="w-10 h-10 shrink-0 border-none rounded-full flex items-center justify-center cursor-pointer"
                                    style={{ background: '#25D366', color: '#fff' }}
                                >
                                    <Send size={16} fill="currentColor" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
