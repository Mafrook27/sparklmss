import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown,
    Mail,
    CreditCard,
    RotateCcw,
    Save,
    MessageSquare,
    Hash,
    AlertCircle,
} from 'lucide-react';

// ─── Toggle Switch ─────────────────────────────────────────────────────────────
interface ToggleProps {
    label:     string;
    sublabel?: string;
    checked:   boolean;
    onChange:  (v: boolean) => void;
    icon?:     React.ReactNode;
}

const Toggle = ({ label, sublabel, checked, onChange, icon }: ToggleProps) => (
    <div
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors group select-none"
    >
        <div className="flex items-center gap-3 min-w-0">
            {icon && (
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${checked ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                    {icon}
                </div>
            )}
            <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 leading-snug">{label}</p>
                {sublabel && <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{sublabel}</p>}
            </div>
        </div>
        <div className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${checked ? 'bg-blue-600' : 'bg-slate-200 group-hover:bg-slate-300'}`}>
            <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
    </div>
);

// ─── Section wrapper ────────────────────────────────────────────────────────────
interface SectionProps {
    id:       string;
    icon:     React.ElementType;
    color:    string;   // Tailwind bg class for icon
    title:    string;
    subtitle: string;
    badge?:   React.ReactNode;
    expanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

const Section = ({ id, icon: Icon, color, title, subtitle, badge, expanded, onToggle, children }: SectionProps) => (
    <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${expanded ? 'border-blue-200 shadow-md' : 'border-slate-200 shadow-sm hover:border-slate-300'}`}>
        {/* Header */}
        <button
            type="button"
            onClick={onToggle}
            className={`w-full flex items-center gap-3 md:gap-4 px-4 py-3.5 text-left transition-colors ${expanded ? 'bg-gradient-to-r from-blue-50/60 to-white' : 'bg-white hover:bg-slate-50/60'}`}
        >
            {/* Icon */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-all duration-200 ${expanded ? `${color} text-white` : 'bg-slate-100 text-slate-500'}`}>
                <Icon size={18} />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-bold transition-colors ${expanded ? 'text-blue-700' : 'text-slate-900'}`}>{title}</span>
                    {badge}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{subtitle}</p>
            </div>

            {/* Chevron */}
            <motion.div
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className={`shrink-0 transition-colors ${expanded ? 'text-blue-500' : 'text-slate-400'}`}
            >
                <ChevronDown size={16} />
            </motion.div>
        </button>

        {/* Animated body */}
        <AnimatePresence initial={false}>
            {expanded && (
                <motion.div
                    key={`${id}-body`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    style={{ overflow: 'hidden' }}
                >
                    <div className="border-t border-slate-100 bg-white">
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

// ─── Status badge ───────────────────────────────────────────────────────────────
const StatusBadge = ({ active }: { active: boolean }) => (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
        active
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-slate-50 text-slate-500 border-slate-200'
    }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-500' : 'bg-slate-400'}`} />
        {active ? 'Enabled' : 'Disabled'}
    </span>
);

// ─── Action buttons (consistent with rest of app) ───────────────────────────────
interface ActionRowProps {
    onSubmit:  () => void;
    onCancel:  () => void;
    submitLabel?: string;
}

const ActionRow = ({ onSubmit, onCancel, submitLabel = 'Submit' }: ActionRowProps) => (
    <div className="flex items-center justify-end gap-2 px-4 pb-4 pt-2">
        <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-red-200 hover:text-red-500 rounded-lg transition-colors uppercase tracking-wider"
        >
            <RotateCcw size={12} /> Cancel
        </button>
        <button
            onClick={onSubmit}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm uppercase tracking-wider"
        >
            <Save size={12} /> {submitLabel}
        </button>
    </div>
);

// ─── Main Component ─────────────────────────────────────────────────────────────
const GeneralConfiguration: React.FC = () => {
    const [expanded, setExpanded] = useState<Set<string>>(new Set(['sms-email']));

    const [config, setConfig] = useState({
        customSms:              true,
        customEmail:            false,
        paymentAuthReturn:      true,
        consecutiveReturnCount: 2,
    });
    const [paymentAuthError, setPaymentAuthError] = useState<string | null>(null);

    const toggle = (id: string) =>
        setExpanded(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    const set = (key: string, value: any) => {
        setConfig(prev => ({ ...prev, [key]: value }));
        if (key === 'consecutiveReturnCount') setPaymentAuthError(null);
    };

    const handlePaymentSubmit = () => {
        if (config.consecutiveReturnCount === null || config.consecutiveReturnCount === undefined || (config.consecutiveReturnCount as any) === '') {
            setPaymentAuthError('* Please enter Consecutive Return Count.');
            return;
        }
        setPaymentAuthError(null);
        console.log('Payment auth config saved:', config);
    };

    return (
        <div className="flex flex-col gap-0 bg-white rounded-xl border border-slate-200 shadow-sm h-full overflow-hidden">

            {/* Page header — matches DisplayTable blue header style */}
            <div className="bg-blue-600 px-4 py-3 shrink-0 flex items-center justify-between">
                <div>
                    <h2 className="text-white text-sm font-bold">General Configuration</h2>
                    <p className="text-blue-200 text-[11px] mt-0.5">Manage system-wide settings and preferences</p>
                </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-4 lg:p-5 space-y-3">

                {/* ── SMS & Email ─────────────────────────────────────────── */}
                <Section
                    id="sms-email"
                    icon={Mail}
                    color="bg-blue-600"
                    title="SMS & Email Configuration"
                    subtitle="Control custom messaging channels for your organisation"
                    badge={<StatusBadge active={config.customSms || config.customEmail} />}
                    expanded={expanded.has('sms-email')}
                    onToggle={() => toggle('sms-email')}
                >
                    <div className="px-2 pt-2">
                        <Toggle
                            label="Custom SMS"
                            sublabel="Use a custom SMS provider instead of the default"
                            icon={<MessageSquare size={15} />}
                            checked={config.customSms}
                            onChange={v => set('customSms', v)}
                        />
                        <div className="mx-4 h-px bg-slate-100" />
                        <Toggle
                            label="Custom Email"
                            sublabel="Use a custom email provider instead of the default"
                            icon={<Mail size={15} />}
                            checked={config.customEmail}
                            onChange={v => set('customEmail', v)}
                        />
                    </div>
                    <ActionRow
                        onSubmit={() => console.log('SMS/Email saved:', config)}
                        onCancel={() => { set('customSms', true); set('customEmail', false); }}
                    />
                </Section>

                {/* ── Payment Authorization ───────────────────────────────── */}
                <Section
                    id="payment-auth"
                    icon={CreditCard}
                    color="bg-indigo-600"
                    title="Payment Authorization"
                    subtitle="Configure consecutive return thresholds for payment processing"
                    badge={<StatusBadge active={config.paymentAuthReturn} />}
                    expanded={expanded.has('payment-auth')}
                    onToggle={() => toggle('payment-auth')}
                >
                    <div className="px-2 pt-2">
                        <Toggle
                            label="Initiate Payment Auth on Consecutive Return"
                            sublabel="Automatically trigger authorization when consecutive returns are detected"
                            icon={<CreditCard size={15} />}
                            checked={config.paymentAuthReturn}
                            onChange={v => set('paymentAuthReturn', v)}
                        />
                    </div>

                    {/* Number input */}
                    <div className="px-4 pb-2 pt-1">
                        <div className="mx-0 h-px bg-slate-100 mb-3" />
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex-1 min-w-0">
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                                    <Hash size={12} className="text-slate-400" />
                                    Consecutive Return Count
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min={0}
                                        value={config.consecutiveReturnCount === 0 ? 0 : (config.consecutiveReturnCount || '')}
                                        onChange={e => {
                                            const v = e.target.value === '' ? '' : parseInt(e.target.value);
                                            set('consecutiveReturnCount', v);
                                        }}
                                        className={`w-full h-10 px-4 text-sm bg-white border rounded-xl outline-none transition-all ${
                                            paymentAuthError
                                                ? 'border-red-400 focus:ring-2 focus:ring-red-200'
                                                : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                                        }`}
                                        placeholder="e.g. 3"
                                    />
                                    {paymentAuthError && (
                                        <div className="flex items-center gap-1 mt-1.5">
                                            <AlertCircle size={11} className="text-red-500 shrink-0" />
                                            <span className="text-[11px] text-red-500 font-medium">{paymentAuthError}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-400 sm:max-w-[200px] leading-relaxed sm:pt-5">
                                Number of consecutive returns before payment authorization is initiated.
                            </p>
                        </div>
                    </div>

                    <ActionRow
                        onSubmit={handlePaymentSubmit}
                        onCancel={() => { set('paymentAuthReturn', true); set('consecutiveReturnCount', 2); setPaymentAuthError(null); }}
                        submitLabel="Update"
                    />
                </Section>

            </div>
        </div>
    );
};

export default GeneralConfiguration;
