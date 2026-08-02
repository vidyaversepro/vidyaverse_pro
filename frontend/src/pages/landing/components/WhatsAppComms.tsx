import { motion } from 'framer-motion';
import { MessageCircle, Bell, CreditCard, Bot, BadgeCheck, CheckCheck } from 'lucide-react';

/**
 * WhatsApp parent-communication section — surfaces the Urmi assimilation that the
 * old landing never showed. Indian parents live on WhatsApp; Vidyaverse reaches them
 * natively: auto fee reminders with payment links, attendance alerts, and AI inbound
 * replies grounded in real school data. CSS-composed phone mockup, WhatsApp-green accent.
 */

const capabilities = [
    { icon: Bell, title: 'Automated alerts', desc: 'Attendance, results, fees, transport — sent the moment they happen, batched into a tidy daily digest.' },
    { icon: CreditCard, title: 'Fees with one-tap pay', desc: 'Reminders carry a Razorpay payment link. Parents pay inside the chat; the books reconcile automatically.' },
    { icon: Bot, title: 'AI that answers back', desc: 'Parents ask "kitni fees baaki hai?" in Hindi or English — the bot replies from real student data, 24×7.' },
    { icon: BadgeCheck, title: 'DPDP-compliant', desc: 'Consent-first messaging, opt-outs honored, every send audit-logged. Built for Indian data law.' },
];

export default function WhatsAppComms() {
    return (
        <section id="communication" className="indic-section py-20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left: copy */}
                    <motion.div
                        initial={{ opacity: 0, y: 28 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="indic-eyebrow mb-4">Parent Communication</span>
                        <h2 className="text-3xl sm:text-5xl mt-4 mb-5">
                            Your back office, now on every parent&apos;s phone.
                        </h2>
                        <p className="text-lg mb-8 leading-relaxed indic-muted">
                            Every other ERP stops at the dashboard. Vidyaverse closes the last mile —
                            reaching parents where they already are, on WhatsApp, with the alerts and
                            payments they actually open.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-5">
                            {capabilities.map((c, i) => (
                                <motion.div
                                    key={c.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: i * 0.08 }}
                                    className="flex items-start gap-3"
                                >
                                    <span className="indic-icon-plinth w-10 h-10 shrink-0">
                                        <c.icon size={20} />
                                    </span>
                                    <div>
                                        <h4 className="font-bold text-sm mb-1">{c.title}</h4>
                                        <p className="text-xs leading-relaxed indic-muted">{c.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right: WhatsApp phone mockup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        className="flex justify-center"
                    >
                        <div className="relative w-[300px] rounded-[2.2rem] p-3 shadow-2xl" style={{ background: '#111827', boxShadow: '0 32px 80px rgba(37,211,102,0.18), 0 0 0 1px var(--border)' }}>
                            {/* notch */}
                            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-b-2xl z-20" />
                            <div className="rounded-[1.7rem] overflow-hidden" style={{ background: '#E5DDD5' }}>
                                {/* WA header */}
                                <div className="flex items-center gap-3 px-4 py-3" style={{ background: '#075E54' }}>
                                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                                        <MessageCircle size={18} className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-white text-sm font-semibold leading-tight">Sunrise Public School</div>
                                        <div className="text-white/60 text-[10px]">online</div>
                                    </div>
                                    <BadgeCheck size={16} className="text-[#25D366]" />
                                </div>

                                {/* chat body */}
                                <div className="px-3 py-4 space-y-2.5 min-h-[420px]" style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,0.03) 1px, transparent 0)', backgroundSize: '16px 16px' }}>
                                    {/* attendance alert (incoming) */}
                                    <div className="max-w-[82%] bg-white rounded-xl rounded-tl-sm p-2.5 shadow-sm">
                                        <div className="flex items-center gap-1 text-[9px] font-bold text-[#075E54] mb-1"><Bell size={9} /> ATTENDANCE</div>
                                        <p className="text-[11px] text-gray-700 leading-snug">Aarav was marked <b>present</b> today at 8:42 AM. ✅</p>
                                        <div className="text-[8px] text-gray-400 text-right mt-1">8:43 AM</div>
                                    </div>

                                    {/* fee reminder with pay button (incoming) */}
                                    <div className="max-w-[82%] bg-white rounded-xl rounded-tl-sm p-2.5 shadow-sm">
                                        <div className="flex items-center gap-1 text-[9px] font-bold text-[#B45309] mb-1"><CreditCard size={9} /> FEE REMINDER</div>
                                        <p className="text-[11px] text-gray-700 leading-snug">Term-2 fee of <b>₹12,500</b> is due on 15 Jun.</p>
                                        <div className="mt-2 rounded-lg py-1.5 text-center text-[11px] font-bold text-white" style={{ background: '#25D366' }}>
                                            💳 Pay Now — Secure Link
                                        </div>
                                        <div className="text-[8px] text-gray-400 text-right mt-1">9:01 AM</div>
                                    </div>

                                    {/* parent question (outgoing) */}
                                    <div className="max-w-[80%] ml-auto rounded-xl rounded-tr-sm p-2.5 shadow-sm" style={{ background: '#DCF8C6' }}>
                                        <p className="text-[11px] text-gray-800 leading-snug">Kitni fees abhi baaki hai?</p>
                                        <div className="flex items-center justify-end gap-1 text-[8px] text-gray-500 mt-1">9:02 AM <CheckCheck size={10} className="text-[#34B7F1]" /></div>
                                    </div>

                                    {/* AI reply (incoming) */}
                                    <div className="max-w-[82%] bg-white rounded-xl rounded-tl-sm p-2.5 shadow-sm">
                                        <div className="flex items-center gap-1 text-[9px] font-bold text-[#8B5CF6] mb-1"><Bot size={9} /> VIDYAVERSE AI</div>
                                        <p className="text-[11px] text-gray-700 leading-snug">Aapke do bachche hain. Kul ₹12,500 baaki hai (Aarav). Pichhli payment 02 Apr ko ₹10,000 mili thi. 🧾</p>
                                        <div className="text-[8px] text-gray-400 text-right mt-1">9:02 AM</div>
                                    </div>
                                </div>

                                {/* input bar */}
                                <div className="flex items-center gap-2 px-3 py-2" style={{ background: '#F0F0F0' }}>
                                    <div className="flex-1 bg-white rounded-full px-3 py-1.5 text-[10px] text-gray-400">Type a message…</div>
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: '#25D366' }}>
                                        <MessageCircle size={13} className="text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
