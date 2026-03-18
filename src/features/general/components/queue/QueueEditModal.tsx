import { useState } from "react";
import { X, Hash, FileText, Activity, Pencil, Save, AlertCircle } from "lucide-react";
import type { QueueItem } from "../../config/generalconfig";

interface QueueEditModalProps {
    item:    QueueItem;
    type:    "active" | "inactive";
    onSave:  (updates: { label: string; description: string }) => void;
    onClose: () => void;
}

const MAX_DESC_CHARS = 300;

const ACTIVE_THEME = {
    bg:        "#16a34a",
    tc:        "#ffffff",
    ringBg:    "#dcfce7",
    accBg:     "#f0fdf4",
    accBorder: "#bbf7d0",
    badgeText: "#15803d",
};

const INACTIVE_THEME = {
    bg:        "#ef4444",
    tc:        "#ffffff",
    ringBg:    "#fee2e2",
    accBg:     "#fef2f2",
    accBorder: "#fecaca",
    badgeText: "#b91c1c",
};

const QueueEditModal = ({ item, type, onSave, onClose }: QueueEditModalProps) => {
    const { bg, tc, ringBg, accBg, accBorder, badgeText } =
        type === "active" ? ACTIVE_THEME : INACTIVE_THEME;

    const Icon = item.icon;

    const [label, setLabel]           = useState(item.label);
    const [description, setDescription] = useState(item.description ?? "");
    const [labelError, setLabelError]   = useState("");

    const charCount   = description.length;
    const isOverLimit = charCount > MAX_DESC_CHARS;
    const canSubmit   = label.trim().length > 0 && !isOverLimit;

    const handleSave = () => {
        if (!label.trim()) {
            setLabelError("* Please enter a Queue Name.");
            return;
        }
        onSave({ label: label.trim(), description: description.trim() });
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-[460px] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center gap-4 px-5 pt-5 pb-4">
                    <div className="p-1.5 rounded-2xl shrink-0" style={{ backgroundColor: ringBg }}>
                        <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md"
                            style={{ backgroundColor: bg, color: tc }}
                        >
                            {Icon ? <Icon size={20} /> : <Activity size={20} />}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide mb-1 border"
                            style={{ backgroundColor: accBg, color: badgeText, borderColor: accBorder }}
                        >
                            <Pencil size={9} /> Edit Queue
                        </span>
                        <h2 className="text-[15px] font-bold text-gray-900 leading-snug truncate">
                            {item.label}
                        </h2>
                        <p className="text-[11px] text-gray-400 mt-0.5">Update queue name and description below</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 shrink-0 self-start mt-0.5 transition-colors"
                    >
                        <X size={15} />
                    </button>
                </div>

                {/* Editable: Queue Name */}
                <div className="px-5 pb-3">
                    <div
                        className="rounded-xl border overflow-hidden"
                        style={{ borderColor: labelError ? "#fca5a5" : accBorder }}
                    >
                        <div
                            className="flex items-center gap-2 px-4 py-2 border-b"
                            style={{ backgroundColor: accBg, borderColor: accBorder }}
                        >
                            <div
                                className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                                style={{ backgroundColor: `${bg}25`, color: bg }}
                            >
                                <Hash size={11} />
                            </div>
                            <span
                                className="text-[10px] font-bold uppercase tracking-widest"
                                style={{ color: badgeText }}
                            >
                                Queue Name <span style={{ color: bg }}>*</span>
                            </span>
                        </div>
                        <input
                            autoFocus
                            maxLength={100}
                            value={label}
                            placeholder="Enter queue name…"
                            onChange={e => { setLabel(e.target.value); setLabelError(""); }}
                            onKeyDown={e => { if (e.key === "Escape") onClose(); }}
                            className="w-full bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none"
                        />
                    </div>
                    {labelError && (
                        <p className="flex items-center gap-1 text-xs text-red-500 font-medium mt-1">
                            <AlertCircle size={12} />{labelError}
                        </p>
                    )}
                </div>

                {/* Editable: Description */}
                <div className="px-5 pb-3">
                    <div
                        className="rounded-xl border overflow-hidden"
                        style={{ borderColor: accBorder }}
                    >
                        <div
                            className="flex items-center justify-between px-4 py-2 border-b"
                            style={{ backgroundColor: accBg, borderColor: accBorder }}
                        >
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: `${bg}25`, color: bg }}
                                >
                                    <FileText size={11} />
                                </div>
                                <span
                                    className="text-[10px] font-bold uppercase tracking-widest"
                                    style={{ color: badgeText }}
                                >
                                    Queue Description
                                </span>
                            </div>
                            <span className={`text-xs tabular-nums font-medium ${isOverLimit ? "text-red-500 font-bold" : "text-gray-400"}`}>
                                {charCount} / {MAX_DESC_CHARS}
                            </span>
                        </div>
                        <textarea
                            rows={4}
                            value={description}
                            placeholder="Enter queue description…"
                            onChange={e => setDescription(e.target.value)}
                            onKeyDown={e => { if (e.key === "Escape") onClose(); }}
                            className={`w-full bg-white px-4 py-3 text-sm text-gray-900 leading-relaxed placeholder:text-gray-300 focus:outline-none resize-none ${isOverLimit ? "text-red-700" : ""}`}
                        />
                    </div>
                    {isOverLimit
                        ? <p className="text-xs text-red-500 mt-1.5">{charCount - MAX_DESC_CHARS} characters over the limit.</p>
                        : <p className="text-xs text-gray-400 mt-1.5">Click Submit or press Esc to cancel.</p>
                    }
                </div>

                {/* Read-only: Status */}
                <div className="px-5 pb-4">
                    <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
                        <div className="flex items-center justify-between py-2.5 px-4">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: accBg }}>
                                    <Activity size={12} style={{ color: bg }} />
                                </div>
                                <span className="text-xs font-medium text-gray-500">Is Active</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span
                                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                                    style={{ backgroundColor: accBg, color: badgeText, border: `1px solid ${accBorder}` }}
                                >
                                    {type === "active" ? "Active" : "Inactive"}
                                </span>
                                <span className="text-[9px] font-bold uppercase text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded tracking-wide">
                                    readonly
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="grid grid-cols-2 gap-3 px-5 pb-5 pt-1 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="h-10 mt-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!canSubmit}
                        className="h-10 mt-3 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 transition-colors shadow-sm flex items-center justify-center gap-1.5"
                    >
                        <Save size={13} /> Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QueueEditModal;
