import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
    PlusCircle, Edit2, Save, RotateCcw, Wallet, Archive, X, Info, AlertCircle,
    Banknote, Coins, DollarSign,
} from "lucide-react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/components/ui/popover";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/shared/components/ui/select";
import { DisplayTable, type DisplayTableColumn } from "../ui/DisplayTable";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "drawer" | "vault";

interface StoreOpt   { id: number; name: string }
interface DrawerItem { id: number; storeId: number; storeName: string; drawerName: string; maxThreshold: number; minThreshold: number; drawerBalance: number; drawerBalanceAsOn: string; status: string; assignedTo: string; isActive: boolean }
interface VaultItem  { id: number; storeId: number; storeName: string; vaultName: string; vaultBalance: number; vaultBalanceAsOn: string; status: string; assignedTo: string; isActive: boolean; denom: DenomInfo }
interface DenomInfo  { d100: number; d50: number; d20: number; d10: number; d5: number; d1: number; c25: number; c10: number; c5: number; c1: number }
interface DrawerForm { storeId: string; drawerName: string; maxThreshold: string; minThreshold: string; isActive: boolean }
interface VaultForm  { storeId: string; vaultName: string; isActive: boolean }

// ─── Static data ──────────────────────────────────────────────────────────────

const STORES: StoreOpt[] = [
    { id: 1, name: "Main Branch" },
    { id: 2, name: "Downtown Store" },
    { id: 3, name: "West End" },
];

const INIT_DRAWERS: DrawerItem[] = [
    { id: 1, storeId: 1, storeName: "Main Branch",    drawerName: "Drawer-01", maxThreshold: 5000, minThreshold: 500, drawerBalance: 2350.75, drawerBalanceAsOn: "2024-03-15T10:30:00", status: "Open",   assignedTo: "John Smith", isActive: true  },
    { id: 2, storeId: 1, storeName: "Main Branch",    drawerName: "Drawer-02", maxThreshold: 5000, minThreshold: 500, drawerBalance: 1800.00, drawerBalanceAsOn: "2024-03-15T09:15:00", status: "Closed", assignedTo: "N/A",        isActive: true  },
    { id: 3, storeId: 2, storeName: "Downtown Store", drawerName: "Drawer-01", maxThreshold: 3000, minThreshold: 300, drawerBalance: 990.50,  drawerBalanceAsOn: "2024-03-14T16:45:00", status: "Open",   assignedTo: "Jane Doe",   isActive: true  },
    { id: 4, storeId: 3, storeName: "West End",       drawerName: "Drawer-01", maxThreshold: 4000, minThreshold: 400, drawerBalance: 0,       drawerBalanceAsOn: "2024-03-10T12:00:00", status: "Closed", assignedTo: "N/A",        isActive: false },
];

const INIT_VAULTS: VaultItem[] = [
    { id: 1, storeId: 1, storeName: "Main Branch",    vaultName: "Vault-Main",     vaultBalance: 50000, vaultBalanceAsOn: "2024-03-15T08:00:00", status: "Open",   assignedTo: "Manager A", isActive: true,  denom: { d100: 100, d50: 200, d20: 150, d10: 100, d5: 80,  d1: 100, c25: 200, c10: 100, c5: 50, c1: 25 } },
    { id: 2, storeId: 2, storeName: "Downtown Store", vaultName: "Vault-Downtown", vaultBalance: 30000, vaultBalanceAsOn: "2024-03-15T07:30:00", status: "Closed", assignedTo: "N/A",       isActive: true,  denom: { d100: 50,  d50: 100, d20: 100, d10: 80,  d5: 60,  d1: 50,  c25: 100, c10: 50,  c5: 30, c1: 10 } },
    { id: 3, storeId: 3, storeName: "West End",       vaultName: "Vault-West",     vaultBalance: 0,     vaultBalanceAsOn: "2024-03-10T09:00:00", status: "Closed", assignedTo: "N/A",       isActive: false, denom: { d100: 0,   d50: 0,   d20: 0,   d10: 0,   d5: 0,   d1: 0,   c25: 0,   c10: 0,   c5: 0,  c1: 0  } },
];

const EMPTY_DRAWER: DrawerForm = { storeId: "", drawerName: "", maxThreshold: "", minThreshold: "", isActive: true };
const EMPTY_VAULT:  VaultForm  = { storeId: "", vaultName: "", isActive: true };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (iso: string) => {
    try { return new Date(iso).toLocaleString("en-US", { month: "2-digit", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
    catch { return "—"; }
};

const fmtCurrency = (n: number) =>
    `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const denomTotal = (d: DenomInfo) =>
    d.d100 * 100 + d.d50 * 50 + d.d20 * 20 + d.d10 * 10 + d.d5 * 5 + d.d1 +
    d.c25 * 0.25 + d.c10 * 0.10 + d.c5 * 0.05 + d.c1 * 0.01;

const validateDrawer = (f: DrawerForm): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!f.storeId)                                       e.storeId      = "* Please select Store Name.";
    if (!f.drawerName.trim())                             e.drawerName   = "* Please enter Drawer Name.";
    if (f.maxThreshold === "" || isNaN(+f.maxThreshold))  e.maxThreshold = "* Please enter Maximum Threshold.";
    if (f.minThreshold === "" || isNaN(+f.minThreshold))  e.minThreshold = "* Please enter Minimum Threshold.";
    return e;
};

const validateVault = (f: VaultForm): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!f.storeId)          e.storeId   = "* Please select Store Name.";
    if (!f.vaultName.trim()) e.vaultName = "* Please enter Vault Name.";
    return e;
};

// ─── Shared field components ──────────────────────────────────────────────────

interface FieldInputProps {
    label: string; required?: boolean; value: string;
    onChange: (v: string) => void; type?: "text" | "number";
    placeholder?: string; error?: string;
}
const FieldInput = ({ label, required, value, onChange, type = "text", placeholder, error }: FieldInputProps) => (
    <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type} value={value} placeholder={placeholder} min={type === "number" ? 0 : undefined}
            onChange={e => onChange(e.target.value)}
            className={`w-full h-10 px-3 text-sm border rounded-xl outline-none transition-all ${
                error ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            }`}
        />
        {error && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10} />{error}</p>}
    </div>
);

interface FieldSelectProps {
    label: string; required?: boolean; value: string; onChange: (v: string) => void;
    options: { value: string; label: string }[]; placeholder?: string; error?: string;
}
const FieldSelect = ({ label, required, value, onChange, options, placeholder = "--Select--", error }: FieldSelectProps) => (
    <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <Select value={value || undefined} onValueChange={onChange}>
            <SelectTrigger className={`h-10 text-sm rounded-xl ${error ? "border-red-400 focus:ring-red-200" : ""}`}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {options.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
            </SelectContent>
        </Select>
        {error && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10} />{error}</p>}
    </div>
);

// ─── Pill toggle (matches DocumentType) ──────────────────────────────────────

interface PillToggleProps<T extends string> {
    value: T; onChange: (v: T) => void;
    options: { value: T; label: string; icon?: React.ReactNode }[];
}
function PillToggle<T extends string>({ value, onChange, options }: PillToggleProps<T>) {
    return (
        <div className="flex items-center bg-black/20 rounded-md p-0.5 gap-0.5">
            {options.map(opt => (
                <button
                    key={opt.value} onClick={() => onChange(opt.value)}
                    className={`flex items-center gap-1.5 px-3 h-7 rounded text-xs font-semibold transition-all whitespace-nowrap ${
                        value === opt.value ? "bg-white shadow-sm text-blue-600" : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                >
                    {opt.icon}{opt.label}
                </button>
            ))}
        </div>
    );
}

// ─── Small UI badges ──────────────────────────────────────────────────────────

const ActiveBadge = ({ active }: { active: boolean }) => (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${
        active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-500"
    }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-green-500" : "bg-red-400"}`} />
        {active ? "Active" : "Inactive"}
    </span>
);

const StatusBadge = ({ status }: { status: string }) => (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${
        status === "Open" ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500"
    }`}>
        {status}
    </span>
);

// ─── Denom table sub-components — module-level to avoid re-mount ─────────────

const DenomColHead = () => (
    <tr className="bg-gray-50/80 border-b border-gray-200">
        <th scope="col" className="py-2 pl-4 pr-2 text-left  text-[9px] font-bold text-gray-400 uppercase tracking-widest">Denom</th>
        <th scope="col" className="py-2 px-3    text-right text-[9px] font-bold text-gray-400 uppercase tracking-widest w-16">Qty</th>
        <th scope="col" className="py-2 pl-2 pr-4 text-right text-[9px] font-bold text-gray-400 uppercase tracking-widest w-24">Amount</th>
    </tr>
);

interface DenomRowProps { label: string; count: number; mult: number }
const DenomRow = ({ label, count, mult }: DenomRowProps) => {
    const amount  = count * mult;
    const isEmpty = count === 0;
    return (
        <tr className={`border-b border-gray-100 transition-colors ${isEmpty ? "opacity-35" : "hover:bg-gray-50"}`}>
            <td className="py-2.5 pl-4 pr-2">
                <span className="text-sm font-bold text-gray-900">{label}</span>
            </td>
            <td className="py-2.5 px-3 text-right">
                <span className="text-xs tabular-nums text-gray-400">×{count.toLocaleString()}</span>
            </td>
            <td className="py-2.5 pl-2 pr-4 text-right">
                <span className={`text-sm tabular-nums font-semibold ${isEmpty ? "text-gray-300" : "text-gray-800"}`}>
                    {fmtCurrency(amount)}
                </span>
            </td>
        </tr>
    );
};

// ─── Denomination modal — fully responsive (mobile sheet / tablet+centered) ──

const DenomModal = ({ vault, onClose }: { vault: VaultItem; onClose: () => void }) => {
    const closeBtnRef = useRef<HTMLButtonElement>(null);

    // ESC to close + focus close button on mount
    useEffect(() => {
        closeBtnRef.current?.focus();
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    const bills = [
        { label: "$100", count: vault.denom.d100, mult: 100   },
        { label: "$50",  count: vault.denom.d50,  mult: 50    },
        { label: "$20",  count: vault.denom.d20,  mult: 20    },
        { label: "$10",  count: vault.denom.d10,  mult: 10    },
        { label: "$5",   count: vault.denom.d5,   mult: 5     },
        { label: "$1",   count: vault.denom.d1,   mult: 1     },
    ];
    const coins = [
        { label: "25¢",  count: vault.denom.c25,  mult: 0.25  },
        { label: "10¢",  count: vault.denom.c10,  mult: 0.10  },
        { label: "5¢",   count: vault.denom.c5,   mult: 0.05  },
        { label: "1¢",   count: vault.denom.c1,   mult: 0.01  },
    ];

    const billsTotal = bills.reduce((s, b) => s + b.count * b.mult, 0);
    const coinsTotal = coins.reduce((s, c) => s + c.count * c.mult, 0);
    const grandTotal = billsTotal + coinsTotal;
    const billsPct   = grandTotal > 0 ? (billsTotal  / grandTotal) * 100 : 0;
    const coinsPct   = grandTotal > 0 ? (coinsTotal  / grandTotal) * 100 : 0;

    return (
        // Backdrop — bottom-sheet on mobile, centered on sm+
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="denom-modal-title"
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-[92dvh] sm:max-h-[88dvh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* ── Mobile drag handle ── */}
                <div className="flex justify-center pt-2.5 pb-1 sm:hidden shrink-0" aria-hidden="true">
                    <div className="w-8 h-1 rounded-full bg-gray-200" />
                </div>

                {/* ── Header: double-ring icon + vault name + badge ── */}
                <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 pt-3 sm:pt-4 pb-4 border-b border-gray-100 shrink-0">
                    {/* Double-ring icon — matches app modal pattern */}
                    <div className="p-1 sm:p-1.5 rounded-2xl bg-blue-50 shrink-0" aria-hidden="true">
                        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shadow-md bg-blue-600">
                            <Archive className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide mb-1 bg-blue-50 text-blue-700 border border-blue-200">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-blue-500" aria-hidden="true" />
                            Denomination Breakdown
                        </span>
                        <h2 id="denom-modal-title" className="text-sm sm:text-[15px] font-bold text-gray-900 leading-snug truncate">
                            {vault.vaultName}
                        </h2>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                            {vault.storeName}
                        </p>
                    </div>

                    <button
                        ref={closeBtnRef}
                        onClick={onClose}
                        aria-label="Close denomination modal"
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* ── Summary stat cards — Bills | Coins | Grand Total ── */}
                <div className="px-4 sm:px-5 py-3 grid grid-cols-3 gap-2 sm:gap-3 shrink-0 border-b border-gray-100">
                    {/* Bills card */}
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <Banknote className="h-3 w-3 text-emerald-600 shrink-0" aria-hidden="true" />
                            <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest leading-none">Bills</span>
                        </div>
                        <p className="text-sm sm:text-base font-bold text-emerald-800 tabular-nums leading-none">{fmtCurrency(billsTotal)}</p>
                        <p className="text-[10px] text-emerald-600 mt-1 tabular-nums">{billsPct.toFixed(1)}% of total</p>
                    </div>

                    {/* Coins card */}
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <Coins className="h-3 w-3 text-amber-600 shrink-0" aria-hidden="true" />
                            <span className="text-[9px] font-bold text-amber-700 uppercase tracking-widest leading-none">Coins</span>
                        </div>
                        <p className="text-sm sm:text-base font-bold text-amber-800 tabular-nums leading-none">{fmtCurrency(coinsTotal)}</p>
                        <p className="text-[10px] text-amber-600 mt-1 tabular-nums">{coinsPct.toFixed(1)}% of total</p>
                    </div>

                    {/* Grand Total card */}
                    <div className="rounded-xl border border-blue-300 bg-blue-600 px-3 py-2.5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <DollarSign className="h-3 w-3 text-white/80 shrink-0" aria-hidden="true" />
                            <span className="text-[9px] font-bold text-white/80 uppercase tracking-widest leading-none">Total</span>
                        </div>
                        <p className="text-sm sm:text-base font-bold text-white tabular-nums leading-none">{fmtCurrency(grandTotal)}</p>
                    </div>
                </div>

                {/* ── Scrollable denomination body ── */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    {/*
                      Mobile  (< sm): single column — Bills stacked above Coins
                      Tablet+ (≥ sm): two columns side by side
                    */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">

                        {/* ── Bills ── */}
                        <section aria-label="Bill denominations">
                            {/* Sticky section header — sticks within the scrollable container */}
                            <div className="sticky top-0 z-10 flex items-center gap-2 px-4 py-2.5 bg-white border-b border-gray-200 shadow-[0_1px_0_0_#e5e7eb]">
                                <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 bg-emerald-100" aria-hidden="true">
                                    <Banknote className="h-3 w-3 text-emerald-600" />
                                </div>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Bills</span>
                                <span className="ml-auto text-xs font-bold text-emerald-700 tabular-nums">{fmtCurrency(billsTotal)}</span>
                            </div>

                            <table className="w-full border-collapse">
                                <thead><DenomColHead /></thead>
                                <tbody>
                                    {bills.map(b => <DenomRow key={b.label} {...b} />)}
                                    {/* Bills subtotal */}
                                    <tr className="bg-emerald-50/70 border-t-2 border-emerald-100">
                                        <td colSpan={2} className="py-3 pl-4 pr-2">
                                            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Subtotal</span>
                                        </td>
                                        <td className="py-3 pl-2 pr-4 text-right">
                                            <span className="text-sm font-bold text-emerald-700 tabular-nums">{fmtCurrency(billsTotal)}</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </section>

                        {/* ── Coins ── */}
                        <section aria-label="Coin denominations">
                            <div className="sticky top-0 z-10 flex items-center gap-2 px-4 py-2.5 bg-white border-b border-gray-200 shadow-[0_1px_0_0_#e5e7eb]">
                                <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 bg-amber-100" aria-hidden="true">
                                    <Coins className="h-3 w-3 text-amber-600" />
                                </div>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Coins</span>
                                <span className="ml-auto text-xs font-bold text-amber-700 tabular-nums">{fmtCurrency(coinsTotal)}</span>
                            </div>

                            <table className="w-full border-collapse">
                                <thead><DenomColHead /></thead>
                                <tbody>
                                    {coins.map(c => <DenomRow key={c.label} {...c} />)}
                                    {/* Coins subtotal */}
                                    <tr className="bg-amber-50/70 border-t-2 border-amber-100">
                                        <td colSpan={2} className="py-3 pl-4 pr-2">
                                            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">Subtotal</span>
                                        </td>
                                        <td className="py-3 pl-2 pr-4 text-right">
                                            <span className="text-sm font-bold text-amber-700 tabular-nums">{fmtCurrency(coinsTotal)}</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </section>

                    </div>
                </div>

                {/* ── Footer ── */}
                <div className="bg-gray-50 border-t border-gray-100 px-4 sm:px-5 py-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full h-10 text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-white rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Shared popover action button ─────────────────────────────────────────────

const ActionPopover = ({ onEdit }: { onEdit: () => void }) => (
    <Popover>
        <PopoverTrigger asChild>
            <button className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors" title="Actions">
                <Edit2 size={15} className="text-blue-600 cursor-pointer" />
            </button>
        </PopoverTrigger>
        <PopoverContent
            side="bottom" align="end" sideOffset={8}
            className="w-auto p-2 bg-white/80 backdrop-blur-xl border border-indigo-200/50 rounded-xl flex items-center gap-1.5 shadow-[0_20px_50px_rgba(79,70,229,0.15)] z-50 animate-in fade-in-0 zoom-in-95 duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        >
            <PopoverPrimitive.Close asChild>
                <button
                    onClick={onEdit}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 active:scale-95 text-white rounded-lg transition-all text-xs font-semibold tracking-wide cursor-pointer shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                >
                    <Edit2 size={13} strokeWidth={2.5} /> Edit
                </button>
            </PopoverPrimitive.Close>
        </PopoverContent>
    </Popover>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const CashRegister = () => {
    // ── Tab & store filter ──
    const [tab,         setTab]         = useState<Tab>("drawer");
    const [storeFilter, setStoreFilter] = useState("0"); // "0" = show all

    // ── Data ──
    const [drawers, setDrawers] = useState<DrawerItem[]>(INIT_DRAWERS);
    const [vaults,  setVaults]  = useState<VaultItem[]>(INIT_VAULTS);

    // ── Form state ──
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEdit,     setIsEdit]     = useState(false);
    const [editingId,  setEditingId]  = useState<number | null>(null);
    const [df, setDf]                 = useState<DrawerForm>(EMPTY_DRAWER); // drawer fields
    const [vf, setVf]                 = useState<VaultForm>(EMPTY_VAULT);   // vault fields
    const [errors, setErrors]         = useState<Record<string, string>>({});

    // ── Denomination modal ──
    const [denomVault, setDenomVault] = useState<VaultItem | null>(null);

    // ─── Filtered table data ──────────────────────────────────────────────────
    const visibleDrawers = useMemo(() =>
        storeFilter === "0" ? drawers : drawers.filter(d => String(d.storeId) === storeFilter),
        [drawers, storeFilter]
    );
    const visibleVaults = useMemo(() =>
        storeFilter === "0" ? vaults : vaults.filter(v => String(v.storeId) === storeFilter),
        [vaults, storeFilter]
    );

    // ─── Form helpers ─────────────────────────────────────────────────────────
    const resetForm = useCallback(() => {
        setIsFormOpen(false); setIsEdit(false); setEditingId(null);
        setDf(EMPTY_DRAWER); setVf(EMPTY_VAULT); setErrors({});
    }, []);

    const openAdd = useCallback(() => {
        setIsEdit(false); setEditingId(null);
        setDf(EMPTY_DRAWER); setVf(EMPTY_VAULT); setErrors({});
        setIsFormOpen(true);
    }, []);

    // ─── Drawer CRUD ──────────────────────────────────────────────────────────
    const openEditDrawer = useCallback((d: DrawerItem) => {
        setIsEdit(true); setEditingId(d.id);
        setDf({ storeId: String(d.storeId), drawerName: d.drawerName, maxThreshold: String(d.maxThreshold), minThreshold: String(d.minThreshold), isActive: d.isActive });
        setErrors({}); setIsFormOpen(true);
    }, []);

    const saveDrawer = useCallback(() => {
        const errs = validateDrawer(df);
        if (Object.keys(errs).length) { setErrors(errs); return; }
        const store = STORES.find(s => String(s.id) === df.storeId)!;
        if (isEdit && editingId !== null) {
            setDrawers(prev => prev.map(d =>
                d.id === editingId
                    ? { ...d, storeId: +df.storeId, storeName: store.name, drawerName: df.drawerName.trim(), maxThreshold: +df.maxThreshold, minThreshold: +df.minThreshold, isActive: df.isActive }
                    : d
            ));
        } else {
            const id = Math.max(0, ...drawers.map(d => d.id)) + 1;
            setDrawers(prev => [{
                id, storeId: +df.storeId, storeName: store.name, drawerName: df.drawerName.trim(),
                maxThreshold: +df.maxThreshold, minThreshold: +df.minThreshold,
                drawerBalance: 0, drawerBalanceAsOn: new Date().toISOString(),
                status: "Closed", assignedTo: "N/A", isActive: df.isActive,
            }, ...prev]);
        }
        resetForm();
    }, [df, isEdit, editingId, drawers, resetForm]);

    // ─── Vault CRUD ───────────────────────────────────────────────────────────
    const openEditVault = useCallback((v: VaultItem) => {
        setIsEdit(true); setEditingId(v.id);
        setVf({ storeId: String(v.storeId), vaultName: v.vaultName, isActive: v.isActive });
        setErrors({}); setIsFormOpen(true);
    }, []);

    const saveVault = useCallback(() => {
        const errs = validateVault(vf);
        if (Object.keys(errs).length) { setErrors(errs); return; }
        const store = STORES.find(s => String(s.id) === vf.storeId)!;
        if (isEdit && editingId !== null) {
            setVaults(prev => prev.map(v =>
                v.id === editingId
                    ? { ...v, storeId: +vf.storeId, storeName: store.name, vaultName: vf.vaultName.trim(), isActive: vf.isActive }
                    : v
            ));
        } else {
            const id = Math.max(0, ...vaults.map(v => v.id)) + 1;
            setVaults(prev => [{
                id, storeId: +vf.storeId, storeName: store.name, vaultName: vf.vaultName.trim(),
                vaultBalance: 0, vaultBalanceAsOn: new Date().toISOString(),
                status: "Closed", assignedTo: "N/A", isActive: vf.isActive,
                denom: { d100: 0, d50: 0, d20: 0, d10: 0, d5: 0, d1: 0, c25: 0, c10: 0, c5: 0, c1: 0 },
            }, ...prev]);
        }
        resetForm();
    }, [vf, isEdit, editingId, vaults, resetForm]);

    // ─── Columns ──────────────────────────────────────────────────────────────
    const drawerColumns: DisplayTableColumn<DrawerItem>[] = useMemo(() => [
        { header: "#",              headerClassName: "w-12 text-center",  className: "w-12 text-center text-slate-400", render: (_, i) => i + 1 },
        { header: "Store Name",     accessorKey: "storeName",             className: "text-slate-600",                  render: r => r.storeName },
        { header: "Drawer Name",    accessorKey: "drawerName",            className: "font-semibold text-slate-800",    render: r => r.drawerName },
        { header: "Max Threshold",  accessorKey: "maxThreshold",          className: "tabular-nums text-slate-600",     render: r => fmtCurrency(r.maxThreshold) },
        { header: "Min Threshold",  accessorKey: "minThreshold",          className: "tabular-nums text-slate-600",     render: r => fmtCurrency(r.minThreshold) },
        { header: "Balance",        accessorKey: "drawerBalance",         className: "tabular-nums font-medium",        render: r => fmtCurrency(r.drawerBalance) },
        { header: "Balance As On",  accessorKey: "drawerBalanceAsOn",     className: "tabular-nums text-slate-500 text-xs", render: r => fmtDate(r.drawerBalanceAsOn) },
        { header: "Status",         accessorKey: "status",                className: "text-center",  headerClassName: "text-center",  render: r => <StatusBadge status={r.status} /> },
        { header: "Assigned To",    accessorKey: "assignedTo",            className: "text-slate-600", render: r => r.assignedTo },
        { header: "IsActive",       accessorKey: "isActive",              className: "text-center",  headerClassName: "text-center",  render: r => <ActiveBadge active={r.isActive} /> },
        { header: "Action",         headerClassName: "text-center w-16",  className: "text-center w-16", render: row => <ActionPopover onEdit={() => openEditDrawer(row)} /> },
    ], [openEditDrawer]);

    const vaultColumns: DisplayTableColumn<VaultItem>[] = useMemo(() => [
        { header: "#",             headerClassName: "w-12 text-center",  className: "w-12 text-center text-slate-400", render: (_, i) => i + 1 },
        { header: "Store Name",    accessorKey: "storeName",             className: "text-slate-600",               render: r => r.storeName },
        { header: "Vault Name",    accessorKey: "vaultName",             className: "font-semibold text-slate-800", render: r => r.vaultName },
        { header: "Balance",       accessorKey: "vaultBalance",          className: "tabular-nums font-medium",     render: r => fmtCurrency(r.vaultBalance) },
        { header: "Balance As On", accessorKey: "vaultBalanceAsOn",      className: "tabular-nums text-slate-500 text-xs", render: r => fmtDate(r.vaultBalanceAsOn) },
        { header: "Status",        accessorKey: "status",                className: "text-center", headerClassName: "text-center", render: r => <StatusBadge status={r.status} /> },
        { header: "Assigned To",   accessorKey: "assignedTo",            className: "text-slate-600", render: r => r.assignedTo },
        { header: "IsActive",      accessorKey: "isActive",              className: "text-center", headerClassName: "text-center", render: r => <ActiveBadge active={r.isActive} /> },
        {
            header: "Denomination", headerClassName: "text-center w-24", className: "text-center w-24",
            render: row => (
                <button onClick={() => setDenomVault(row)} title="View denomination" className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors">
                    <Info size={15} className="text-indigo-500 cursor-pointer" />
                </button>
            ),
        },
        { header: "Action", headerClassName: "text-center w-16", className: "text-center w-16", render: row => <ActionPopover onEdit={() => openEditVault(row)} /> },
    ], [openEditVault]);

    // ─── Header extra: store select + tab pill ────────────────────────────────
    const headerExtra = useMemo(() => (
        <div className="flex items-center gap-2">
            {/* Store filter — hidden while form is open (matching original behaviour) */}
            {!isFormOpen && (
                <Select value={storeFilter} onValueChange={setStoreFilter}>
                    <SelectTrigger className="h-7 min-w-[120px] text-xs font-medium bg-black/20 text-white border-white/20 hover:bg-black/30 focus:ring-0 focus:ring-offset-0 [&>svg]:text-white/70">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="0">Show All</SelectItem>
                        {STORES.map(s => (
                            <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {/* Cash Drawer | Vault pill */}
            <PillToggle<Tab>
                value={tab}
                onChange={v => { setTab(v); resetForm(); setStoreFilter("0"); }}
                options={[
                    { value: "drawer", label: "Cash Drawer", icon: <Wallet  size={12} className="shrink-0" /> },
                    { value: "vault",  label: "Vault",       icon: <Archive size={12} className="shrink-0" /> },
                ]}
            />
        </div>
    ), [tab, isFormOpen, storeFilter, resetForm]);

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-full overflow-hidden gap-3">

            {/* ── Inline form panel (shown when adding / editing) ── */}
            {isFormOpen && (
                <div className="shrink-0 rounded-xl border border-blue-200 shadow-md overflow-hidden">

                    {/* Form header */}
                    <div className="bg-blue-600 px-4 py-2.5 flex items-center justify-between">
                        <h3 className="text-white text-sm font-bold">
                            {isEdit ? "Edit" : "Add"} {tab === "drawer" ? "Cash Drawer" : "Vault"}
                        </h3>
                        <button onClick={resetForm} className="text-white/70 hover:text-white transition-colors" title="Close form">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Form body */}
                    <div className="bg-white p-4">
                        {tab === "drawer" ? (
                            /* ── Drawer form fields ── */
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                <FieldSelect
                                    label="Store Name" required value={df.storeId}
                                    onChange={v => { setDf(f => ({ ...f, storeId: v })); setErrors(e => ({ ...e, storeId: "" })); }}
                                    options={STORES.map(s => ({ value: String(s.id), label: s.name }))}
                                    error={errors.storeId}
                                />
                                <FieldInput
                                    label="Drawer Name" required value={df.drawerName}
                                    onChange={v => { setDf(f => ({ ...f, drawerName: v })); setErrors(e => ({ ...e, drawerName: "" })); }}
                                    error={errors.drawerName}
                                />
                                <FieldInput
                                    label="Max Threshold" required type="number" value={df.maxThreshold}
                                    onChange={v => { setDf(f => ({ ...f, maxThreshold: v })); setErrors(e => ({ ...e, maxThreshold: "" })); }}
                                    error={errors.maxThreshold}
                                />
                                <FieldInput
                                    label="Min Threshold" required type="number" value={df.minThreshold}
                                    onChange={v => { setDf(f => ({ ...f, minThreshold: v })); setErrors(e => ({ ...e, minThreshold: "" })); }}
                                    error={errors.minThreshold}
                                />
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Is Active</label>
                                    <div className="flex items-center gap-4 h-10">
                                        {[{ val: true, label: "Yes" }, { val: false, label: "No" }].map(opt => (
                                            <label key={opt.label} className="flex items-center gap-1.5 cursor-pointer">
                                                <input
                                                    type="radio" className="accent-blue-600"
                                                    checked={df.isActive === opt.val}
                                                    onChange={() => setDf(f => ({ ...f, isActive: opt.val }))}
                                                />
                                                <span className="text-sm text-slate-700">{opt.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* ── Vault form fields ── */
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <FieldSelect
                                    label="Store Name" required value={vf.storeId}
                                    onChange={v => { setVf(f => ({ ...f, storeId: v })); setErrors(e => ({ ...e, storeId: "" })); }}
                                    options={STORES.map(s => ({ value: String(s.id), label: s.name }))}
                                    error={errors.storeId}
                                />
                                <FieldInput
                                    label="Vault Name" required value={vf.vaultName}
                                    onChange={v => { setVf(f => ({ ...f, vaultName: v })); setErrors(e => ({ ...e, vaultName: "" })); }}
                                    error={errors.vaultName}
                                />
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Is Active</label>
                                    <div className="flex items-center gap-4 h-10">
                                        {[{ val: true, label: "Yes" }, { val: false, label: "No" }].map(opt => (
                                            <label key={opt.label} className="flex items-center gap-1.5 cursor-pointer">
                                                <input
                                                    type="radio" className="accent-blue-600"
                                                    checked={vf.isActive === opt.val}
                                                    onChange={() => setVf(f => ({ ...f, isActive: opt.val }))}
                                                />
                                                <span className="text-sm text-slate-700">{opt.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                            <button
                                onClick={resetForm}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-red-200 hover:text-red-500 rounded-lg transition-colors uppercase tracking-wider"
                            >
                                <RotateCcw size={12} /> Cancel
                            </button>
                            <button
                                onClick={tab === "drawer" ? saveDrawer : saveVault}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm uppercase tracking-wider"
                            >
                                <Save size={12} /> {isEdit ? "Update" : "Add"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Table ── */}
            <div className={isFormOpen ? "flex-1 min-h-0" : "h-full"}>
                <DisplayTable
                    className="h-full"
                    title={tab === "drawer" ? "Cash Drawer" : "Vault"}
                    data={tab === "drawer" ? visibleDrawers : visibleVaults as any}
                    columns={tab === "drawer" ? drawerColumns : vaultColumns as any}
                    enableGlobalSearch
                    enableColumnFilters
                    enablePagination
                    initialPageSize={10}
                    pageSizeOptions={[10, 25, 50]}
                    emptyMessage={`No ${tab === "drawer" ? "drawers" : "vaults"} found.`}
                    headerExtra={headerExtra}
                    toolbarButtons={[{
                        label: isFormOpen ? "Cancel" : tab === "drawer" ? "New Drawer" : "Add Vault",
                        icon: isFormOpen ? <X size={14} /> : <PlusCircle size={14} />,
                        onClick: isFormOpen ? resetForm : openAdd,
                        className: isFormOpen
                            ? "bg-red-600 border-red-600 text-white hover:bg-red-700"
                            : "bg-green-600 border-green-600 text-white hover:bg-green-700",
                    }]}
                />
            </div>

            {/* ── Denomination modal ── */}
            {denomVault && <DenomModal vault={denomVault} onClose={() => setDenomVault(null)} />}
        </div>
    );
};

export default CashRegister;
