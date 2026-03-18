import {
    BadgeCheck, Crown, Landmark, Mail, Phone, TriangleAlert,
    ShieldX, ShieldCheck, UserRoundX, Scale, Gavel, CreditCard,
    RotateCcw, RotateCw, Activity, Cross, CheckCircle2, AlertCircle,
} from "lucide-react";
import type { FlagItem, FlagTheme } from "./types";

// ─── Constants ────────────────────────────────────────────────────────────────

export const MAX_DESC_CHARS = 120;

// ─── Flag definitions ─────────────────────────────────────────────────────────

export const ALL_FLAGS: FlagItem[] = [
    { id: "PTP",               label: "PTP",                description: "Promise to Pay",            icon: BadgeCheck,    bgColor: "#16a34a",        textColor: "#fff" },
    { id: "VIP",               label: "VIP",                description: "VIP Customer",              icon: Crown,         bgColor: "#87bf17",        textColor: "#fff" },
    { id: "IBV",               label: "IBV",                description: "IBV Verification",          icon: Landmark,      bgColor: "#f73936",        textColor: "#fff" },
    { id: "Email",             label: "Email",              description: "Email Preference",          icon: Mail,          bgColor: "",               textColor: ""     },
    { id: "Cell",              label: "Cell",               description: "Cell Phone Preference",     icon: Phone,         bgColor: "",               textColor: ""     },
    { id: "Fraud",             label: "Fraud",              description: "Fraud Alert",               icon: TriangleAlert, bgColor: "#f73936",        textColor: "#fff" },
    { id: "RevokedAuth",       label: "Revoked Auth",       description: "Revoked Authorization",     icon: ShieldX,       bgColor: "#2175cb",        textColor: "#fff" },
    { id: "DCV",               label: "DCV",                description: "DCV Verified",              icon: ShieldCheck,   bgColor: "#87bf17",        textColor: "#fff" },
    { id: "DoNotLend",         label: "Do Not Lend",        description: "Do Not Lend to Customer",   icon: UserRoundX,    bgColor: "#f73936",        textColor: "#fff" },
    { id: "Bankrupted",        label: "Bankrupted",         description: "Bankruptcy Filed",          icon: Scale,         bgColor: "#f78336",        textColor: "#fff" },
    { id: "LegalThreat",       label: "Legal Threat",       description: "Legal Threat Made",         icon: Gavel,         bgColor: "#f73936",        textColor: "#fff" },
    { id: "DebtConsolidation", label: "Debt Consolidation", description: "Debt Consolidation Active", icon: CreditCard,    bgColor: "#f78336",        textColor: "#fff" },
    { id: "Recovery",          label: "Recovery",           description: "Recovery Mode Active",      icon: RotateCcw,     bgColor: "#fbec5d",        textColor: "#000" },
    { id: "TwoRescinds",       label: "Two Rescinds",       description: "Two Rescinds Recorded",     icon: RotateCw,      bgColor: "rgb(247,57,54)", textColor: "#fff" },
    { id: "Hardship",          label: "Hardship",           description: "Hardship Status",           icon: Activity,      bgColor: "#f78336",        textColor: "#fff" },
    { id: "Deceased",          label: "Deceased",           description: "Deceased Customer",         icon: Cross,         bgColor: "#f73936",        textColor: "#fff" },
    { id: "CheckDeposit",      label: "Check Deposit",      description: "Check Deposit Method",      icon: CheckCircle2,  bgColor: "",               textColor: ""     },
    { id: "Returns",           label: "Returns",            description: "Returns Active",            icon: AlertCircle,   bgColor: "",               textColor: ""     },
];

export const INITIAL_ACTIVE_IDS: string[]   = ["PTP","VIP","IBV","Email","Cell","Fraud","RevokedAuth","DCV","DoNotLend"];
export const INITIAL_INACTIVE_IDS: string[] = ["Bankrupted","LegalThreat","DebtConsolidation","Recovery","TwoRescinds","Hardship","Deceased","CheckDeposit","Returns"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const byIds = (ids: string[]): FlagItem[] =>
    ids.map(id => ALL_FLAGS.find(f => f.id === id)!);

/** Derive all dynamic color tokens from a single flag's bgColor/textColor. */
export const getFlagTheme = (flag: FlagItem): FlagTheme => {
    const bg = flag.bgColor  || "#3b82f6";
    const tc = flag.textColor || "#fff";
    return {
        bg,
        tc,
        ringBg:    `${bg}18`,
        accBg:     `${bg}14`,
        accBorder: `${bg}2e`,
        // Recovery (#fbec5d) is yellow — use dark amber for legibility
        badgeText: bg === "#fbec5d" ? "#92400e" : bg,
    };
};
