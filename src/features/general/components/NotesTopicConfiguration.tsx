import { useState, useMemo, useCallback } from "react";
import { PlusCircle, Settings, Edit2, Trash2, Save } from "lucide-react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/components/ui/popover";
import { DisplayTable, type DisplayTableColumn } from "../ui/DisplayTable";
import { INITIAL_NOTES_TOPICS, type NoteTopic } from "../config/generalconfig";

const NotesTopicConfiguration = () => {
    const [data, setData] = useState<NoteTopic[]>(INITIAL_NOTES_TOPICS);
    const [isAdding, setIsAdding] = useState(false);
    const [newTopic, setNewTopic] = useState("");
    const [editingTopic, setEditingTopic] = useState<NoteTopic | null>(null);
    const [editValue, setEditValue] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleDelete = useCallback((id: number) => {
        setData((prev) => prev.filter((item) => item.id !== id));
    }, []);

    const handleEdit = useCallback((topic: NoteTopic) => {
        setEditingTopic(topic);
        setEditValue(topic.topic);
        setError(null);
        setIsAdding(false); // Close add row if editing
    }, []);

    const handleCancelEdit = useCallback(() => {
        setEditingTopic(null);
        setEditValue("");
        setError(null);
    }, []);

    const handleAdd = useCallback(() => {
        if (editingTopic) {
            if (!editValue.trim()) return;
            setData((prev) =>
                prev.map((item) =>
                    item.id === editingTopic.id ? { ...item, topic: editValue.trim() } : item
                )
            );
            handleCancelEdit();
        } else {
            if (!newTopic.trim()) {
                setError("* Please enter Topic.");
                return;
            }
            const newId = Math.max(...data.map((d) => d.id), 0) + 1;
            setData((prev) => [{ id: newId, topic: newTopic.trim() }, ...prev]);
            setNewTopic("");
            setError(null);
            setIsAdding(false);
        }
    }, [newTopic, editValue, data, editingTopic, handleCancelEdit]);

    const handleToggleAdd = useCallback(() => {
        if (isAdding) {
            setIsAdding(false);
            setNewTopic("");
            setError(null);
        } else {
            setIsAdding(true);
            setEditingTopic(null); // Close edit if adding
        }
    }, [isAdding]);

    const tableData = useMemo(() => {
        const sortedData = [...data].reverse();
        if (isAdding) {
            return [{ id: -1, topic: "" }, ...sortedData];
        }
        return sortedData;
    }, [data, isAdding]);

    const columns: DisplayTableColumn<NoteTopic>[] = useMemo(
        () => [
            {
                header: "#",
                className: "w-12 text-center text-slate-500",
                headerClassName: "w-12 text-center",
                render: (_row: NoteTopic, rowIndex: number) => {
                    if (_row.id === -1) return <span className="text-blue-600 font-bold">*</span>;
                    return rowIndex + (isAdding ? 0 : 1);
                },
            },
            {
                header: "Topic",
                accessorKey: "topic",
                className: "font-medium text-slate-700 p-0",
                render: (row: NoteTopic) => {
                    const isNew = row.id === -1;
                    const isEditing = editingTopic?.id === row.id;

                    if (isNew || isEditing) {
                        return (
                            <div className="px-4 py-1.5 h-full flex flex-col justify-center bg-blue-50/50">
                                <input
                                    autoFocus
                                    className={`w-full bg-white border ${error && (isNew || isEditing) ? "border-red-400" : "border-blue-400"
                                        } rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm animate-in fade-in zoom-in-95 duration-200`}
                                    value={isNew ? newTopic : editValue}
                                    onChange={(e) => {
                                        if (isNew) {
                                            setNewTopic(e.target.value);
                                        } else {
                                            setEditValue(e.target.value);
                                        }
                                        setError(null);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleAdd();
                                        if (e.key === "Escape") {
                                            if (isNew) handleToggleAdd();
                                            else handleCancelEdit();
                                        }
                                    }}
                                    placeholder="Enter Topic"
                                />
                                {error && (isNew || isEditing) && (
                                    <span className="text-[10px] text-red-500 mt-0.5">{error}</span>
                                )}
                            </div>
                        );
                    }
                    return <div className="px-4 py-3">{row.topic}</div>;
                },
            },
            {
                header: "Actions",
                headerClassName: "text-center w-24",
                className: "text-center w-24",
                render: (row: NoteTopic) => {
                    const isNew = row.id === -1;
                    const isEditing = editingTopic?.id === row.id;

                    return (
                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors group"
                                    title="Settings"
                                >
                                    <Settings size={16} className="text-blue-600 cursor-pointer" />    </button>
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
        [handleDelete, editingTopic, editValue, handleAdd, handleCancelEdit, handleEdit, isAdding, newTopic, handleToggleAdd, error]
    );

    return (
        <div className="flex flex-col lg:flex-row gap-4 items-stretch h-full overflow-hidden">
            <div className="flex-1 min-w-0 flex flex-col min-h-[400px] lg:min-h-0">
                <DisplayTable<NoteTopic>
                    className="h-full"
                    data={tableData}
                    columns={columns}
                    title="Notes Topic"
                    enableGlobalSearch
                    enableColumnFilters
                    enablePagination
                    initialPageSize={10}
                    pageSizeOptions={[10, 25, 50, 100]}
                    emptyMessage="No notes topics found."
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
        </div>
    );
};

export default NotesTopicConfiguration;
