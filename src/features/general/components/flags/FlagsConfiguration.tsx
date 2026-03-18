import { useState } from "react";
import {
    DndContext, DragOverlay, closestCenter,
    KeyboardSensor, PointerSensor,
    useSensor, useSensors,
    defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import type { DragStartEvent, DragOverEvent, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { GripVertical, Eye, Save, X } from "lucide-react";

import Column      from "./Column";
import FABPreview  from "./FABPreview";
import InfoModal   from "./InfoModal";
import EditModal   from "./EditModal";
import { ALL_FLAGS, INITIAL_ACTIVE_IDS, INITIAL_INACTIVE_IDS, byIds } from "./data";
import type { FlagItem, FlagState, ColumnType } from "./types";

const FlagsConfiguration = () => {
    const [flags, setFlags] = useState<FlagState>({
        active:   byIds(INITIAL_ACTIVE_IDS),
        inactive: byIds(INITIAL_INACTIVE_IDS),
    });

    const [dndActiveId, setDndActiveId] = useState<string | null>(null);
    const [infoFlag,    setInfoFlag]    = useState<FlagItem | null>(null);
    const [editTarget,  setEditTarget]  = useState<FlagItem | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    // ── DnD helpers ───────────────────────────────────────────────────────────

    const getColumn = (id: string): ColumnType | null => {
        if (id === "active" || id === "inactive") return id;
        if (flags.active.some(f => f.id === id))   return "active";
        if (flags.inactive.some(f => f.id === id)) return "inactive";
        return null;
    };

    const handleDragStart = ({ active }: DragStartEvent) => {
        setDndActiveId(active.id as string);
    };

    const handleDragOver = ({ active, over }: DragOverEvent) => {
        if (!over) return;
        const activeCol = getColumn(active.id as string);
        const overCol   = getColumn(over.id   as string);
        if (!activeCol || !overCol || activeCol === overCol) return;

        setFlags(prev => {
            const fromList = [...prev[activeCol]];
            const toList   = [...prev[overCol]];
            const fromIdx  = fromList.findIndex(f => f.id === active.id);
            const [moved]  = fromList.splice(fromIdx, 1);

            const toIdx = toList.findIndex(f => f.id === over.id);
            toList.splice(toIdx >= 0 ? toIdx : toList.length, 0, moved);

            return { ...prev, [activeCol]: fromList, [overCol]: toList };
        });
    };

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        if (over && active.id !== over.id) {
            const activeCol = getColumn(active.id as string);
            const overCol   = getColumn(over.id   as string);
            if (activeCol && overCol && activeCol === overCol) {
                setFlags(prev => ({
                    ...prev,
                    [activeCol]: arrayMove(
                        prev[activeCol],
                        prev[activeCol].findIndex(f => f.id === active.id),
                        prev[activeCol].findIndex(f => f.id === over.id),
                    ),
                }));
            }
        }
        setDndActiveId(null);
    };

    const dndActiveItem = dndActiveId
        ? [...flags.active, ...flags.inactive].find(f => f.id === dndActiveId)
        : null;

    // ── Edit save ─────────────────────────────────────────────────────────────

    const handleEditSave = (newDescription: string) => {
        if (!editTarget) return;
        const col: ColumnType = flags.active.some(f => f.id === editTarget.id) ? "active" : "inactive";
        setFlags(prev => ({
            ...prev,
            [col]: prev[col].map(f => f.id === editTarget.id ? { ...f, description: newDescription } : f),
        }));
        setEditTarget(null);
    };

    // ── Toolbar actions ───────────────────────────────────────────────────────

    const handleSubmit = () => {
        const payload = [
            ...flags.active.map((f, i)   => ({ FlagName1: f.id, FlagDescription: f.description, IsActive: "1", FlagOrder: i + 1 })),
            ...flags.inactive.map((f, i) => ({ FlagName1: f.id, FlagDescription: f.description, IsActive: "0", FlagOrder: i + 1 })),
        ];
        console.log("FlagsConfiguration → submit:", payload);
        // TODO: wire to API call
    };

    const handleReset = () => {
        setFlags({ active: byIds(INITIAL_ACTIVE_IDS), inactive: byIds(INITIAL_INACTIVE_IDS) });
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm h-full overflow-hidden">

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-2 px-3 md:px-5 py-2.5 border-b border-slate-100 shrink-0 flex-wrap">
                <div>
                    <h2 className="text-base font-bold text-slate-900">Flag Configuration</h2>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Drag to reorder · move between columns to activate / deactivate
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSubmit}
                        className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm uppercase tracking-wider"
                    >
                        <Save size={13} /> Submit
                    </button>
                    <button
                        onClick={handleReset}
                        className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-red-200 hover:text-red-500 rounded-lg transition-colors uppercase tracking-wider"
                    >
                        <X size={13} /> Reset
                    </button>
                </div>
            </div>

            {/* Body: DnD columns + preview */}
            <div className="flex gap-3 p-3 md:p-4 flex-1 min-h-0">

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex-1 min-w-0 min-h-0 grid grid-cols-2 gap-3 md:gap-4">
                        <Column
                            title="Active Flags"
                            items={flags.active}
                            type="active"
                            onInfo={setInfoFlag}
                            onEdit={setEditTarget}
                        />
                        <Column
                            title="Inactive Flags"
                            items={flags.inactive}
                            type="inactive"
                            onInfo={setInfoFlag}
                            onEdit={setEditTarget}
                        />
                    </div>

                    {/* Drag ghost */}
                    <DragOverlay
                        dropAnimation={{
                            sideEffects: defaultDropAnimationSideEffects({
                                styles: { active: { opacity: "0.5" } },
                            }),
                        }}
                    >
                        {dndActiveItem && (
                            <div className="flex items-center gap-2.5 px-3 py-2.5 bg-white border-2 border-blue-400 rounded-lg shadow-2xl cursor-grabbing opacity-95 scale-105">
                                <GripVertical size={15} className="text-slate-300" />
                                <div
                                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                    style={dndActiveItem.bgColor
                                        ? { backgroundColor: dndActiveItem.bgColor, color: dndActiveItem.textColor }
                                        : { backgroundColor: "#f1f5f9", color: "#64748b" }
                                    }
                                >
                                    <dndActiveItem.icon size={13} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-slate-800 truncate">{dndActiveItem.label}</p>
                                    <p className="text-[10px] text-slate-400 truncate">{dndActiveItem.description}</p>
                                </div>
                            </div>
                        )}
                    </DragOverlay>
                </DndContext>

                {/* Preview panel — hidden below lg breakpoint */}
                <div className="hidden lg:flex w-40 xl:w-48 shrink-0 flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden h-full min-h-[280px]">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2 shrink-0">
                        <Eye size={14} className="text-blue-600" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Preview</span>
                    </div>

                    <div className="flex-1 min-h-0 flex flex-col items-center p-3">
                        <FABPreview activeFlags={flags.active} />
                        {flags.active.length === 0 && (
                            <p className="text-[10px] text-slate-400 text-center italic mt-2">
                                No active flags to preview
                            </p>
                        )}
                    </div>

                    <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between shrink-0">
                        <span className="text-[10px] text-slate-400 font-medium">Active flags</span>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            {flags.active.length} / {ALL_FLAGS.length}
                        </span>
                    </div>
                </div>

            </div>

            {/* Modals */}
            {infoFlag   && <InfoModal  flag={infoFlag}   onClose={() => setInfoFlag(null)} />}
            {editTarget && <EditModal  flag={editTarget} onSave={handleEditSave} onClose={() => setEditTarget(null)} />}

        </div>
    );
};

export default FlagsConfiguration;
