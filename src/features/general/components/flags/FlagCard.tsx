import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Info, Pencil } from "lucide-react";
import type { FlagItem, ColumnType } from "./types";

interface FlagCardProps {
    item:   FlagItem;
    type:   ColumnType;
    onInfo: () => void;
    onEdit: () => void;
}

const FlagCard = ({ item, type, onInfo, onEdit }: FlagCardProps) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: item.id });

    const Icon = item.icon;

    const cardCls = isDragging
        ? "border-blue-400 bg-blue-50 shadow-lg ring-2 ring-blue-200"
        : type === "active"
            ? "border-green-200 bg-white shadow-sm hover:border-green-400 hover:shadow-md"
            : "border-red-200 bg-white shadow-sm hover:border-red-400 hover:shadow-md";

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
            className={`group flex items-center gap-2 lg:gap-3 px-2.5 lg:px-3 py-2 lg:py-2.5 rounded-lg border transition-all duration-200 ${cardCls}`}
        >
            {/* Drag handle */}
            <button
                {...attributes}
                {...listeners}
                title="Drag to reorder"
                className="p-0.5 text-slate-200 hover:text-slate-400 cursor-grab active:cursor-grabbing transition-colors shrink-0"
            >
                <GripVertical size={15} />
            </button>

            {/* Flag icon */}
            <div
                className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center shrink-0"
                style={item.bgColor
                    ? { backgroundColor: item.bgColor, color: item.textColor }
                    : { backgroundColor: "#f1f5f9", color: "#64748b" }
                }
            >
                <Icon size={14} />
            </div>

            {/* Label + description */}
            <div className="flex-1 min-w-0">
                <p className="text-xs lg:text-sm font-semibold text-slate-800 truncate leading-snug">{item.label}</p>
                <p className="text-[10px] lg:text-[11px] text-slate-400 truncate leading-tight mt-0.5">{item.description}</p>
            </div>

            {/* Action buttons — appear on row hover */}
            <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <button
                    onClick={onInfo}
                    title="View details"
                    className="p-1 lg:p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                    <Info size={14} />
                </button>
                <div className="w-px h-3 bg-slate-200 mx-0.5" />
                <button
                    onClick={onEdit}
                    title="Edit flag"
                    className="p-1 lg:p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                    <Pencil size={14} />
                </button>
            </div>
        </div>
    );
};

export default FlagCard;
