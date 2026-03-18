import { X, Hash, FileText, Activity } from "lucide-react";
import type { QueueItem } from "../../config/generalconfig";

interface QueueInfoModalProps {
    item:    QueueItem;
    type:    "active" | "inactive";
    onClose: () => void;
}

const ACTIVE_THEME = {
    bg:         "#16a34a",   // green-600
    tc:         "#ffffff",
    ringBg:     "#dcfce7",   // green-100
    accBg:      "#f0fdf4",   // green-50
    accBorder:  "#bbf7d0",   // green-200
    badgeText:  "#15803d",   // green-700
};

const INACTIVE_THEME = {
    bg:         "#ef4444",   // red-500
    tc:         "#ffffff",
    ringBg:     "#fee2e2",   // red-100
    accBg:      "#fef2f2",   // red-50
    accBorder:  "#fecaca",   // red-200
    badgeText:  "#b91c1c",   // red-700
};

const QueueInfoModal = ({ item, type, onClose }: QueueInfoModalProps) => {
    const { bg, tc, ringBg, accBg, accBorder, badgeText } =
        type === "active" ? ACTIVE_THEME : INACTIVE_THEME;
    const Icon = item.icon;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-[420px] overflow-hidden"
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
                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: bg }} />
                            Queue Details
                        </span>
                        <h2 className="text-[15px] font-bold text-gray-900 leading-snug truncate">
                            {item.label}
                        </h2>
                        <p className="text-[11px] text-gray-400 mt-0.5">View queue configuration details</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 shrink-0 self-start mt-0.5 transition-colors"
                    >
                        <X size={15} />
                    </button>
                </div>

                {/* Detail rows */}
                <div className="px-5 pb-4">
                    <div className="rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100 bg-white">

                        {/* Queue Name */}
                        <div className="flex items-center justify-between py-2.5 px-4">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: accBg }}>
                                    <Hash size={12} style={{ color: bg }} />
                                </div>
                                <span className="text-xs font-medium text-gray-500">Queue Name</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-800 font-mono tracking-wide">
                                {item.label}
                            </span>
                        </div>

                        {/* Description */}
                        <div className="flex flex-col gap-2 py-3 px-4">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: accBg }}>
                                    <FileText size={12} style={{ color: bg }} />
                                </div>
                                <span className="text-xs font-medium text-gray-500">Queue Description</span>
                            </div>
                            <div
                                className="rounded-lg px-3.5 py-3 text-sm text-gray-700 leading-relaxed break-words whitespace-pre-wrap min-h-[52px] border"
                                style={{ backgroundColor: accBg, borderColor: accBorder }}
                            >
                                {item.description ?? <span className="text-gray-400 italic">No description provided.</span>}
                            </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center justify-between py-2.5 px-4">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: accBg }}>
                                    <Activity size={12} style={{ color: bg }} />
                                </div>
                                <span className="text-xs font-medium text-gray-500">Is Active</span>
                            </div>
                            <span
                                className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                                style={{ backgroundColor: accBg, color: badgeText, border: `1px solid ${accBorder}` }}
                            >
                                {type === "active" ? "Active" : "Inactive"}
                            </span>
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 pb-5 pt-1 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="w-full h-10 mt-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-white transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QueueInfoModal;
