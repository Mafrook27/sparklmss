import { useState, useMemo, useCallback } from "react";
import { PlusCircle, Settings, Edit2, Trash2, Save, Check } from "lucide-react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/components/ui/popover";
import { DisplayTable, type DisplayTableColumn } from "../ui/DisplayTable";
import { INITIAL_TAGS, type TagItem } from "../config/generalconfig";

const TagsConfiguration = () => {
    const [data, setData] = useState<TagItem[]>(INITIAL_TAGS);
    const [isAdding, setIsAdding] = useState(false);
    const [newTag, setNewTag] = useState("");
    const [editingTag, setEditingTag] = useState<TagItem | null>(null);
    const [editTagValue, setEditTagValue] = useState(""); // Dedicated state for editing
    const [error, setError] = useState<string | null>(null);
    const [configError, setConfigError] = useState<string | null>(null);

    // Config Tags State
    const [loanChecked, setLoanChecked] = useState(true);
    const [customerChecked, setCustomerChecked] = useState(true);

    const handleConfigSubmit = useCallback(() => {
        if (!loanChecked && !customerChecked) {
            setConfigError("* Please select checkbox");
            return;
        }
        setConfigError(null);
        // TODO: handle actual submit logic here
    }, [loanChecked, customerChecked]);

    const handleDelete = useCallback((id: number) => {
        setData((prev) => prev.filter((item) => item.id !== id));
    }, []);

    const handleEdit = useCallback((tag: TagItem) => {
        setEditingTag(tag);
        setEditTagValue(tag.tag); // Use the dedicated edit state
        setError(null);
        setIsAdding(false);
    }, []);

    const handleCancelEdit = useCallback(() => {
        setEditingTag(null);
        setEditTagValue("");
        setError(null);
    }, []);

    const handleAdd = useCallback(() => {
        if (editingTag) {
            if (!editTagValue.trim()) return;
            setData((prev) =>
                prev.map((item) =>
                    item.id === editingTag.id ? { ...item, tag: editTagValue.trim() } : item
                )
            );
            handleCancelEdit();
        } else {
            if (!newTag.trim()) {
                setError("* Please enter Tag.");
                return;
            }
            const newId = Math.max(...data.map((d) => d.id), 0) + 1;
            setData((prev) => [{ id: newId, tag: newTag.trim() }, ...prev]);
            setNewTag("");
            setError(null);
            setIsAdding(false);
        }
    }, [newTag, editTagValue, data, editingTag, handleCancelEdit]);

    const handleToggleAdd = useCallback(() => {
        if (isAdding) {
            setIsAdding(false);
            setNewTag("");
            setError(null);
        } else {
            setIsAdding(true);
            setEditingTag(null);
        }
    }, [isAdding]);

    const tableData = useMemo(() => {
        const sortedData = [...data].reverse();
        if (isAdding) {
            return [{ id: -1, tag: "" }, ...sortedData];
        }
        return sortedData;
    }, [data, isAdding]);

    const columns: DisplayTableColumn<TagItem>[] = useMemo(
        () => [
            {
                header: "#",
                className: "w-12 text-center text-slate-500",
                headerClassName: "w-12 text-center",
                render: (_row: TagItem, rowIndex: number) => {
                    if (_row.id === -1) return <span className="text-blue-600 font-bold">*</span>;
                    return rowIndex + (isAdding ? 0 : 1);
                },
            },
            {
                header: "Tags",
                accessorKey: "tag",
                className: "font-medium text-slate-700 p-0",
                render: (row: TagItem) => {
                    const isNew = row.id === -1;
                    const isEditing = editingTag?.id === row.id;

                    if (isNew || isEditing) {
                        return (
                            <div className="px-4 py-1.5 h-full flex flex-col justify-center bg-blue-50/50">
                                <input
                                    autoFocus
                                    className={`w-full bg-white border ${error && (isNew || isEditing) ? "border-red-400" : "border-blue-400"
                                        } rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-all`}
                                    value={isNew ? newTag : editTagValue}
                                    onChange={(e) => {
                                        if (isNew) setNewTag(e.target.value);
                                        else setEditTagValue(e.target.value);
                                        setError(null);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleAdd();
                                        if (e.key === "Escape") {
                                            if (isNew) handleToggleAdd();
                                            else handleCancelEdit();
                                        }
                                    }}
                                    placeholder="Enter Tag"
                                />
                                {error && (isNew || isEditing) && (
                                    <span className="text-[10px] text-red-500 mt-0.5">{error}</span>
                                )}
                            </div>
                        );
                    }
                    return <div className="px-4 py-3">{row.tag}</div>;
                },
            },
            {
                header: "Actions",
                headerClassName: "text-center w-24",
                className: "text-center w-24",
                render: (row: TagItem) => {
                    const isNew = row.id === -1;
                    const isEditing = editingTag?.id === row.id;

                    return (
                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors group"
                                    title="Settings"
                                >
                                    <Settings size={16} className="text-blue-600 cursor-pointer" />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent
                                side="bottom"
                                align="end"
                                sideOffset={8}
                                className="w-auto p-2 bg-white/80 backdrop-blur-xl border border-indigo-200/50 rounded-xl flex items-center gap-1.5 shadow-[0_20px_50px_rgba(79,70,229,0.15)] z-50 animate-in fade-in-0 mt-1 zoom-in-95 duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
                            >
                                {isNew || isEditing ? (
                                    <PopoverPrimitive.Close asChild>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAdd();
                                            }}
                                            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 active:scale-95 text-white rounded-lg transition-all duration-150 text-xs font-semibold tracking-wide cursor-pointer shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                                        >
                                            <Save size={13} strokeWidth={2.5} /> {isEditing ? "Update" : "Add"}
                                        </button>
                                    </PopoverPrimitive.Close>
                                ) : (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(row);
                                        }}
                                        className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 active:scale-95 text-white rounded-lg transition-all duration-150 text-xs font-semibold tracking-wide cursor-pointer shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                                    >
                                        <Edit2 size={13} strokeWidth={2.5} /> Edit
                                    </button>
                                )}
                                <div className="w-px h-4 bg-indigo-100/30 mx-0.5" />
                                <PopoverPrimitive.Close asChild>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (isNew) {
                                                handleToggleAdd();
                                            } else if (isEditing) {
                                                handleCancelEdit();
                                            } else {
                                                handleDelete(row.id);
                                            }
                                        }}
                                        className={`flex items-center gap-1.5 px-3.5 py-2 active:scale-95 rounded-lg transition-all duration-150 text-xs font-semibold tracking-wide cursor-pointer ${isNew || isEditing
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
        [handleDelete, handleEdit, editingTag, editTagValue, handleAdd, handleCancelEdit, isAdding, newTag, handleToggleAdd, error]
    );

    return (
        <div className="flex flex-col lg:flex-row gap-4 items-stretch h-full overflow-hidden">
            {/* ── Left: Table ── */}
            <div className="flex-1 min-w-0 flex flex-col min-h-[400px] lg:min-h-0">
                <DisplayTable<TagItem>
                    className="h-full"
                    data={tableData}
                    columns={columns}
                    title="Tags"
                    enableGlobalSearch
                    enableColumnFilters
                    enablePagination
                    initialPageSize={10}
                    pageSizeOptions={[10, 25, 50, 100]}
                    emptyMessage="No tags found."
                    toolbarButtons={[
                        {
                            label: isAdding ? "Cancel" : "Add",
                            icon: <PlusCircle size={14} />,
                            onClick: handleToggleAdd,
                            className: isAdding
                                ? "bg-red-600 border-red-600 text-white hover:bg-red-700"
                                : "bg-green-600 border-green-600 text-white hover:bg-green-700"
                        }
                    ]}
                />
            </div>

            {/* ── Right Panel: Configure ── */}
            <div className="w-full lg:w-72 xl:w-80 overflow-y-auto custom-scrollbar flex flex-col shrink-0 rounded-lg border bg-card shadow-sm h-full bg-white">
                {/* Section: Configure Tags */}
                <section className="p-4 pt-[13px] space-y-4">
                    <h2 className="text-[11px] font-bold text-muted-foreground flex items-center gap-2 uppercase tracking-widest">
                        <Settings size={14} className="text-primary" />
                        Configure Tags
                    </h2>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-2">
                            {/* Loan Toggle */}
                            <div
                                onClick={() => { setLoanChecked(!loanChecked); setConfigError(null); }}
                                className="flex items-center gap-3 px-2 py-1 bg-indigo-600 border border-indigo-700 rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors select-none"
                            >
                                <div className={`
                                    w-4 h-4 rounded-[4px] border transition-all flex items-center justify-center shrink-0
                                    ${loanChecked ? 'bg-white border-white shadow-sm' : 'bg-transparent border-indigo-400'}
                                `}>
                                    {loanChecked && <Check size={14} className="text-indigo-600 stroke-[3.5]" />}
                                </div>
                                <div className="flex-1">
                                    <span className="text-xs font-medium text-white">Loan</span>
                                </div>
                            </div>

                            {/* Customer Toggle */}
                            <div
                                onClick={() => { setCustomerChecked(!customerChecked); setConfigError(null); }}
                                className="flex items-center gap-3 px-2 py-1 bg-orange-600 border border-orange-700 rounded-lg cursor-pointer hover:bg-orange-700 transition-colors select-none"
                            >
                                <div className={`
                                    w-4 h-4 rounded-[4px] border transition-all flex items-center justify-center shrink-0
                                    ${customerChecked ? 'bg-white border-white shadow-sm' : 'bg-transparent border-orange-400'}
                                `}>
                                    {customerChecked && <Check size={14} className="text-orange-600 stroke-[3.5]" />}
                                </div>
                                <div className="flex-1">
                                    <span className="text-xs font-medium text-white">Customer</span>
                                </div>
                            </div>
                        </div>

                        {configError && (
                            <p className="text-[10px] text-red-500 font-medium -mt-2">{configError}</p>
                        )}

                        <div className="flex gap-2 pt-1">
                            <button
                                onClick={handleConfigSubmit}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold py-2 rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 uppercase tracking-wider"
                            >
                                Submit
                            </button>
                            <button
                                onClick={() => setConfigError(null)}
                                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-500 text-[11px] font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider font-bold"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default TagsConfiguration;
