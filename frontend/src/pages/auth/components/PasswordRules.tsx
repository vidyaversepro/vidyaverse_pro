import { Check } from 'lucide-react';

const RULES = [
    { test: (v: string) => v.length >= 8, label: '8+ characters' },
    { test: (v: string) => /[A-Z]/.test(v), label: 'Uppercase letter' },
    { test: (v: string) => /[0-9]/.test(v), label: 'A number' },
];

/** Live password-strength chips, ported from the Auth Pages reference. */
export function PasswordRules({ password }: { password: string }) {
    if (!password) return null;
    return (
        <div className="flex flex-wrap gap-[7px] mt-2.5">
            {RULES.map((rule) => {
                const met = rule.test(password);
                return (
                    <span
                        key={rule.label}
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors ${met
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-muted text-muted-foreground border border-border/60'
                            }`}
                    >
                        {met && <Check size={10} />}
                        {rule.label}
                    </span>
                );
            })}
        </div>
    );
}
