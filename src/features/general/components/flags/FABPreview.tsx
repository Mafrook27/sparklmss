import { useState, useRef } from "react";
import { CircleChevronUp, CircleChevronDown } from "lucide-react";
import type { FlagItem } from "./types";

interface FABPreviewProps {
    activeFlags: FlagItem[];
}

const FABPreview = ({ activeFlags }: FABPreviewProps) => {
    const pillRef         = useRef<HTMLDivElement>(null);
    const isScrollEnabled = activeFlags.length > 6;
    const [tooltip, setTooltip] = useState<{ flag: FlagItem; top: number } | null>(null);

    const handleIconMouseEnter = (flag: FlagItem, e: React.MouseEvent<HTMLDivElement>) => {
        const pill = pillRef.current;
        if (!pill) return;
        const pillRect = pill.getBoundingClientRect();
        const iconRect = e.currentTarget.getBoundingClientRect();
        setTooltip({ flag, top: iconRect.top - pillRect.top + iconRect.height / 2 });
    };

    return (
        // wrapper is relative so the tooltip can be positioned as a sibling
        // (avoids being clipped by the pill's overflow:hidden)
        <div className="flex-1 min-h-0 relative flex flex-col items-center w-11">

            {/* Tooltip — sibling of pill, not clipped by overflow:hidden */}
            {tooltip && (
                <div
                    className="absolute right-full mr-2.5 px-2.5 py-1 rounded-md text-[10px] font-bold whitespace-nowrap z-50 pointer-events-none shadow-lg"
                    style={{
                        top:             tooltip.top,
                        transform:       "translateY(-50%)",
                        backgroundColor: tooltip.flag.bgColor   || "#475569",
                        color:           tooltip.flag.textColor || "#fff",
                    }}
                >
                    {tooltip.flag.label}
                    {/* Arrow pointing right → toward the pill */}
                    <span
                        className="absolute left-full top-1/2 -translate-y-1/2"
                        style={{
                            width: 0, height: 0,
                            borderTop:    "4px solid transparent",
                            borderBottom: "4px solid transparent",
                            borderLeft:   `5px solid ${tooltip.flag.bgColor || "#475569"}`,
                        }}
                    />
                </div>
            )}

            {/* Pill container */}
            <div
                ref={pillRef}
                className="flex-1 min-h-0 bg-white/95 backdrop-blur-sm rounded-xl shadow-md border border-slate-200/50 flex flex-col items-center w-11 overflow-hidden"
            >
                {/* Scroll-up indicator */}
                <div className="shrink-0 w-full flex items-center justify-center py-1.5 border-b border-slate-100/50">
                    <CircleChevronUp
                        size={16}
                        className={isScrollEnabled ? "text-blue-500 animate-pulse" : "text-slate-200"}
                    />
                </div>

                {/* Flag icons */}
                <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex flex-col gap-1.5 p-1.5 items-center w-full">
                    {activeFlags.map(flag => {
                        const Icon = flag.icon;
                        return (
                            <div
                                key={flag.id}
                                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all cursor-pointer hover:scale-110 hover:shadow-md"
                                style={flag.bgColor
                                    ? { backgroundColor: flag.bgColor, color: flag.textColor }
                                    : { backgroundColor: "#f1f5f9", color: "#94a3b8" }
                                }
                                onMouseEnter={e => handleIconMouseEnter(flag, e)}
                                onMouseLeave={() => setTooltip(null)}
                            >
                                <Icon size={13} />
                            </div>
                        );
                    })}
                </div>

                {/* Scroll-down indicator */}
                <div className="shrink-0 w-full flex items-center justify-center py-1.5 border-t border-slate-100/50">
                    <CircleChevronDown
                        size={16}
                        className={isScrollEnabled ? "text-blue-500 animate-pulse" : "text-slate-200"}
                    />
                </div>
            </div>
        </div>
    );
};

export default FABPreview;
