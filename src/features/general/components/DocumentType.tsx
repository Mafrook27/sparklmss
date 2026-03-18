import { useState, useMemo, useCallback } from "react";
import {
    PlusCircle, Settings, Edit2, Trash2, Save,
    TableProperties, ArrowUpDown,
} from "lucide-react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/components/ui/popover";
import { DisplayTable, type DisplayTableColumn } from "../ui/DisplayTable";
import { INITIAL_DOC_TYPES, type DocumentTypeItem, type QueueItem } from "../config/generalconfig";
import DraggableConfig from "../ui/DraggableConfig";

const READONLY_ID = 7;

const DRAGGABLE_INITIAL_DATA = {
    active: INITIAL_DOC_TYPES
        .filter((d) => d.isActive)
        .sort((a, b) => a.order - b.order)
        .map((d) => ({ id: String(d.id), label: d.name })),
    inactive: INITIAL_DOC_TYPES
        .filter((d) => !d.isActive)
        .map((d) => ({ id: String(d.id), label: d.name })),
};

const validateName = (val: string): string | null => {
    if (!val.trim()) return "* Please enter document type.";
    if (/^[-_]+$/.test(val.trim())) return "* Cannot contain only '-' or '_'.";
    if (/^[-_]/.test(val.trim()) || /[-_]$/.test(val.trim()))
        return "* Cannot start or end with '-' or '_'.";
    return null;
};

// ─── Pill toggle rendered inside the blue header ──────────────────────────────
interface PillToggleProps<T extends string> {
    value: T;
    onChange: (v: T) => void;
    options: { value: T; label: string; icon?: React.ReactNode; activeColor?: string }[];
}
function PillToggle<T extends string>({ value, onChange, options }: PillToggleProps<T>) {
    return (
        <div className="flex items-center bg-black/20 rounded-md p-0.5 gap-0.5">
            {options.map((opt) => {
                const selected = value === opt.value;
                return (
                    <button
                        key={opt.value}
                        onClick={() => onChange(opt.value)}
                        className={`flex items-center gap-1.5 px-3 h-7 rounded text-xs font-semibold transition-all whitespace-nowrap ${
                            selected
                                ? `bg-white shadow-sm ${opt.activeColor ?? "text-blue-600"}`
                                : "text-white/70 hover:text-white hover:bg-white/10"
                        }`}
                    >
                        {opt.icon}
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const DocumentType = () => {
    const [data, setData] = useState<DocumentTypeItem[]>(INITIAL_DOC_TYPES);
    const [viewMode, setViewMode] = useState<"table" | "reorder">("table");

    // ── Inline table state ──
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState("");
    const [editingItem, setEditingItem] = useState<DocumentTypeItem | null>(null);
    const [editValue, setEditValue] = useState("");
    const [inlineError, setInlineError] = useState<string | null>(null);

    // ─── DraggableConfig save ─────────────────────────────────────────────────
    const handleDraggableSave = useCallback(
        (result: { active: QueueItem[]; inactive: QueueItem[] }) => {
            setData((prev) => {
                const activeMap = new Map(result.active.map((item, idx) => [Number(item.id), idx + 1]));
                const inactiveSet = new Set(result.inactive.map((item) => Number(item.id)));
                return prev.map((item) => {
                    if (activeMap.has(item.id)) return { ...item, isActive: true, order: activeMap.get(item.id)! };
                    if (inactiveSet.has(item.id)) return { ...item, isActive: false, order: 0 };
                    return item;
                });
            });
        },
        []
    );

    // ─── Table CRUD ───────────────────────────────────────────────────────────
    const handleDelete = useCallback((id: number) => {
        setData((prev) => prev.filter((item) => item.id !== id));
    }, []);

    const handleEdit = useCallback((item: DocumentTypeItem) => {
        setEditingItem(item);
        setEditValue(item.name);
        setInlineError(null);
        setIsAdding(false);
    }, []);

    const handleCancelEdit = useCallback(() => {
        setEditingItem(null);
        setEditValue("");
        setInlineError(null);
    }, []);

    const handleInlineUpdate = useCallback(() => {
        const err = validateName(editValue);
        if (err) { setInlineError(err); return; }
        setData((prev) =>
            prev.map((item) =>
                item.id === editingItem!.id ? { ...item, name: editValue.trim() } : item
            )
        );
        handleCancelEdit();
    }, [editingItem, editValue, handleCancelEdit]);

    const handleToggleInlineAdd = useCallback(() => {
        if (isAdding) {
            setIsAdding(false);
            setNewName("");
            setInlineError(null);
        } else {
            setIsAdding(true);
            setEditingItem(null);
        }
    }, [isAdding]);

    const handleInlineAdd = useCallback(() => {
        const err = validateName(newName);
        if (err) { setInlineError(err); return; }
        const newId = Math.max(...data.map((d) => d.id), 0) + 1;
        setData((prev) => [
            { id: newId, name: newName.trim(), isActive: false, order: 0 },
            ...prev,
        ]);
        setNewName("");
        setInlineError(null);
        setIsAdding(false);
    }, [newName, data]);

    // ─── Table data ───────────────────────────────────────────────────────────
    const tableData = useMemo(() => {
        const sorted = [...data].reverse();
        if (isAdding)
            return [{ id: -1, name: "", isActive: false, order: 0 }, ...sorted];
        return sorted;
    }, [data, isAdding]);

    // ─── Columns ──────────────────────────────────────────────────────────────
    const columns: DisplayTableColumn<DocumentTypeItem>[] = useMemo(
        () => [
            {
                header: "#",
                className: "w-12 text-center text-slate-500",
                headerClassName: "w-12 text-center",
                render: (_row, rowIndex) => {
                    if (_row.id === -1) return <span className="text-blue-600 font-bold">*</span>;
                    return rowIndex + (isAdding ? 0 : 1);
                },
            },
            {
                header: "Type",
                accessorKey: "name",
                className: "font-medium text-slate-700 p-0",
                render: (row) => {
                    const isNew = row.id === -1;
                    const isEditing = editingItem?.id === row.id;

                    if (isNew || isEditing) {
                        return (
                            <div className="px-4 py-1.5 flex flex-col justify-center bg-blue-50/50">
                                <input
                                    autoFocus
                                    maxLength={50}
                                    className={`w-full bg-white border ${
                                        inlineError ? "border-red-400" : "border-blue-400"
                                    } rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-all`}
                                    value={isNew ? newName : editValue}
                                    onChange={(e) => {
                                        if (isNew) setNewName(e.target.value);
                                        else setEditValue(e.target.value);
                                        setInlineError(null);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") isNew ? handleInlineAdd() : handleInlineUpdate();
                                        if (e.key === "Escape") isNew ? handleToggleInlineAdd() : handleCancelEdit();
                                    }}
                                    placeholder="Enter Document Type"
                                />
                                {inlineError && (
                                    <span className="text-[10px] text-red-500 mt-0.5">{inlineError}</span>
                                )}
                            </div>
                        );
                    }

                    return (
                        <div className="px-4 py-3 flex items-center gap-2">
                            <span>{row.name}</span>
                            {row.id === READONLY_ID && (
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide bg-slate-100 px-1.5 py-0.5 rounded">
                                    Default
                                </span>
                            )}
                            {row.isActive ? (
                                <span className="text-[9px] font-bold text-green-600 uppercase tracking-wide bg-green-50 px-1.5 py-0.5 rounded">
                                    Active
                                </span>
                            ) : (
                                <span className="text-[9px] font-bold text-red-500 uppercase tracking-wide bg-red-50 px-1.5 py-0.5 rounded">
                                    Inactive
                                </span>
                            )}
                        </div>
                    );
                },
            },
            {
                header: "Actions",
                headerClassName: "text-center w-20",
                className: "text-center w-20",
                render: (row) => {
                    const isNew = row.id === -1;
                    const isEditing = editingItem?.id === row.id;
                    if (row.id === READONLY_ID) return null;

                    return (
                        <Popover>
                            <PopoverTrigger asChild>
                                <button className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors" title="Actions">
                                    <Settings size={16} className="text-blue-600 cursor-pointer" />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent
                                side="bottom" align="end" sideOffset={8}
                                className="w-auto p-2 bg-white/80 backdrop-blur-xl border border-indigo-200/50 rounded-xl flex items-center gap-1.5 shadow-[0_20px_50px_rgba(79,70,229,0.15)] z-50 animate-in fade-in-0 zoom-in-95 duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
                            >
                                {isNew || isEditing ? (
                                    <PopoverPrimitive.Close asChild>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); isNew ? handleInlineAdd() : handleInlineUpdate(); }}
                                            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 active:scale-95 text-white rounded-lg transition-all text-xs font-semibold tracking-wide cursor-pointer shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                                        >
                                            <Save size={13} strokeWidth={2.5} /> {isEditing ? "Update" : "Add"}
                                        </button>
                                    </PopoverPrimitive.Close>
                                ) : (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEdit(row); }}
                                        className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 active:scale-95 text-white rounded-lg transition-all text-xs font-semibold tracking-wide cursor-pointer shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                                    >
                                        <Edit2 size={13} strokeWidth={2.5} /> Edit
                                    </button>
                                )}
                                <div className="w-px h-4 bg-indigo-100/30 mx-0.5" />
                                <PopoverPrimitive.Close asChild>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (isNew) handleToggleInlineAdd();
                                            else if (isEditing) handleCancelEdit();
                                            else handleDelete(row.id);
                                        }}
                                        className={`flex items-center gap-1.5 px-3.5 py-2 active:scale-95 rounded-lg transition-all text-xs font-semibold tracking-wide cursor-pointer ${
                                            isNew || isEditing
                                                ? "text-slate-400 hover:bg-indigo-50/50 hover:text-indigo-600"
                                                : "text-red-400 hover:bg-red-50 hover:text-red-500"
                                        }`}
                                    >
                                        {isNew || isEditing ? "Cancel" : <><Trash2 size={13} strokeWidth={2.5} /> Delete</>}
                                    </button>
                                </PopoverPrimitive.Close>
                            </PopoverContent>
                        </Popover>
                    );
                },
            },
        ],
        [isAdding, editingItem, editValue, newName, inlineError,
            handleEdit, handleDelete, handleCancelEdit,
            handleInlineAdd, handleInlineUpdate, handleToggleInlineAdd]
    );

    // ─── Shared header pills ──────────────────────────────────────────────────
    const viewPill = (
        <PillToggle
            value={viewMode}
            onChange={(v) => {
                setViewMode(v);
                if (v === "reorder") { setIsAdding(false); setInlineError(null); }
            }}
            options={[
                { value: "table",   label: "Table",   icon: <TableProperties size={12} /> },
                { value: "reorder", label: "Reorder", icon: <ArrowUpDown size={12} /> },
            ]}
        />
    );

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col h-full overflow-hidden">

            {/* ── Table View ── */}
            {viewMode === "table" && (
                <DisplayTable<DocumentTypeItem>
                    className="h-full"
                    data={tableData}
                    columns={columns}
                    title="Document Type"
                    enableGlobalSearch
                    enableColumnFilters
                    enablePagination
                    initialPageSize={10}
                    pageSizeOptions={[10, 25, 50, 100]}
                    emptyMessage="No document types found."
                    headerExtra={viewPill}
                    toolbarButtons={[
                        {
                            label: isAdding ? "Cancel" : "Add",
                            icon: <PlusCircle size={14} />,
                            onClick: handleToggleInlineAdd,
                            className: isAdding
                                ? "bg-red-600 border-red-600 text-white hover:bg-red-700"
                                : "bg-green-600 border-green-600 text-white hover:bg-green-700",
                        },
                    ]}
                />
            )}

            {/* ── Reorder View ── */}
            {viewMode === "reorder" && (
                <div className="flex flex-col rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full">
                    {/* Blue header — matches DisplayTable exactly */}
                    <div className="bg-blue-600 px-4 py-3 flex items-center justify-between shrink-0">
                        <h3 className="text-white text-sm font-bold">
                            Document Type — Reorder
                        </h3>
                        <div className="flex items-center gap-2">
                            {viewPill}
                        </div>
                    </div>
                    {/* DraggableConfig — strip its own card border so it sits flat inside */}
                    <div className="flex-1 overflow-auto bg-white p-4">
                        <DraggableConfig
                            title="Document Type Configuration"
                            subtitle="Drag to reorder · move between columns to activate / deactivate"
                            initialData={DRAGGABLE_INITIAL_DATA}
                            onSave={handleDraggableSave}
                            className="border-0 shadow-none rounded-none bg-transparent"
                            hideItemActions
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentType;
