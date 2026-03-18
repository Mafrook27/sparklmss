import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import FlagCard from "./FlagCard";
import type { FlagItem, ColumnType } from "./types";

interface ColumnProps {
    title:  string;
    items:  FlagItem[];
    type:   ColumnType;
    onInfo: (f: FlagItem) => void;
    onEdit: (f: FlagItem) => void;
}

const Column = ({ title, items, type, onInfo, onEdit }: ColumnProps) => {
    const { setNodeRef } = useDroppable({ id: type });

    const headerBg = type === "active" ? "bg-green-600" : "bg-red-500";
    const isEmpty  = items.length === 0;

    return (
        <div className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full min-h-[280px]">

            {/* Column header */}
            <div className={`px-3 lg:px-4 py-2.5 lg:py-3 flex items-center justify-between shrink-0 ${headerBg}`}>
                <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-white tracking-wide uppercase">{title}</h3>
                    <span className="text-[10px] font-semibold bg-white/20 text-white px-1.5 py-0.5 rounded-full leading-none">
                        {items.length}
                    </span>
                </div>
            </div>

            {/* Scrollable list */}
            <div
                ref={setNodeRef}
                className={`p-2.5 lg:p-3 flex-1 bg-[#f8fafc]/50 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex flex-col ${isEmpty ? "overflow-hidden" : "overflow-y-auto"}`}
            >
                <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>

                    <div className="space-y-1.5">
                        {items.map(item => (
                            <FlagCard
                                key={item.id}
                                item={item}
                                type={type}
                                onInfo={() => onInfo(item)}
                                onEdit={() => onEdit(item)}
                            />
                        ))}
                    </div>

                    {/* Empty state */}
                    {isEmpty && (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden group/empty rounded-xl">
                            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
                            <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white/50" />
                            <div className="relative z-10 flex flex-col items-center max-w-[200px]">
                                <div className="mb-4 relative">
                                    <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-40 group-hover/empty:opacity-60 transition-opacity" />
                                    <div className="size-12 rounded-xl bg-white border border-blue-50 shadow-sm flex items-center justify-center text-blue-500 relative z-10 group-hover/empty:scale-110 group-hover/empty:rotate-3 transition-transform duration-500">
                                        <Plus size={24} strokeWidth={1.5} />
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                    Drag flags here to {type === "active" ? "activate" : "deactivate"} them.
                                </p>
                            </div>
                        </div>
                    )}

                </SortableContext>
            </div>
        </div>
    );
};

export default Column;
