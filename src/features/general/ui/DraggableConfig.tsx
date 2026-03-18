import { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import {
    DndContext,
    DragOverlay,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    defaultDropAnimationSideEffects,
    useDroppable,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Info, Pencil, Plus, Save, X } from 'lucide-react';
import { type QueueItem } from '../config/generalconfig';
import QueueInfoModal from '../components/queue/QueueInfoModal';
import QueueEditModal from '../components/queue/QueueEditModal';

// ─── Sortable Item Component ───────────────────────────────────────────
interface SortableItemProps {
    id: string;
    item: QueueItem;
    type: 'active' | 'inactive';
    hideItemActions?: boolean;
    onInfo?: () => void;
    onEdit?: () => void;
}

const SortableItem = ({ id, item, type, hideItemActions, onInfo, onEdit }: SortableItemProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const Icon = item.icon;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
                group flex items-center gap-2 lg:gap-3 p-2 lg:p-2.5 rounded-lg border transition-all duration-200
                ${isDragging
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : type === 'active'
                        ? 'border-green-200 bg-white shadow-sm hover:border-green-400'
                        : 'border-red-200 bg-white shadow-sm hover:border-red-400'
                }
`}
        >
            <button
                {...attributes}
                {...listeners}
                className="p-0.5 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing transition-colors shrink-0"
                title="Drag to reorder"
            >
                <GripVertical size={15} />
            </button>

            <div className={`shrink-0 ${type === 'active' ? 'text-green-600' : 'text-red-400'}`}>
                {Icon && <Icon size={16} />}
            </div>

            <div className="flex-1 min-w-0">
                <span className="text-xs lg:text-sm font-semibold text-slate-900 truncate block leading-snug">
                    {item.label}
                </span>
                {item.description && (
                    <span className="text-[10px] lg:text-[11px] text-slate-400 truncate block leading-tight mt-0.5">
                        {item.description}
                    </span>
                )}
            </div>

            {!hideItemActions && (
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
                        title="Edit queue"
                        className="p-1 lg:p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                        <Pencil size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};

// ─── Column Component ───────────────────────────────────────────────
interface ColumnProps {
    title: string;
    items: QueueItem[];
    type: 'active' | 'inactive';
    hideItemActions?: boolean;
    onInfo?: (item: QueueItem) => void;
    onEdit?: (item: QueueItem) => void;
}

const Column = ({ title, items, type, hideItemActions, onInfo, onEdit }: ColumnProps) => {
    const { setNodeRef } = useDroppable({ id: type });

    return (
        <div className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full min-h-[280px]">
            <div className={`px-3 lg:px-4 py-2.5 lg:py-3 flex items-center justify-between relative shrink-0 ${
                type === 'active' ? 'bg-green-600' : 'bg-red-500'
            }`}>
                <h3 className="text-xs font-bold text-white uppercase tracking-widest">{title}</h3>
                <span className="text-[10px] font-semibold bg-white/20 text-white px-1.5 py-0.5 rounded-full leading-none">
                    {items.length}
                </span>
            </div>
            <div
                ref={setNodeRef}
                className={`p-2.5 lg:p-3 flex-1 bg-[#f8fafc]/50 flex flex-col [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${items.length === 0 ? 'overflow-hidden' : 'overflow-y-auto'}`}
            >
                <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-1.5">
                        {items.map((item) => (
                            <SortableItem
                                key={item.id}
                                id={item.id}
                                item={item}
                                type={type}
                                hideItemActions={hideItemActions}
                                onInfo={() => onInfo?.(item)}
                                onEdit={() => onEdit?.(item)}
                            />
                        ))}
                    </div>
                    {items.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center relative overflow-hidden group/empty rounded-xl">
                            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                            <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white/50"></div>

                            <div className="relative z-10 flex flex-col items-center max-w-[200px]">
                                <div className="mb-4 relative">
                                    <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-40 group-hover/empty:opacity-60 transition-opacity"></div>
                                    <div className="size-12 rounded-xl bg-white border border-blue-50 shadow-sm flex items-center justify-center text-blue-500 relative z-10 group-hover/empty:scale-110 group-hover/empty:rotate-3 transition-transform duration-500">
                                        <Plus size={24} strokeWidth={1.5} />
                                    </div>
                                </div>
                                <h3 className="text-sm font-semibold text-slate-900 mb-1">
                                    No {title.toLowerCase()}
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                    Drag items here to {type === 'active' ? 'activate' : 'deactivate'} them.
                                </p>
                            </div>
                        </div>
                    )}
                </SortableContext>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────
interface DraggableConfigProps {
    title: string;
    subtitle?: string;
    initialData: {
        active: QueueItem[];
        inactive: QueueItem[];
    };
    onSave?: (data: { active: QueueItem[]; inactive: QueueItem[] }) => void;
    onCancel?: () => void;
    className?: string;
    hideItemActions?: boolean;
    showItemModals?: boolean;
}

interface ModalTarget {
    item: QueueItem;
    type: 'active' | 'inactive';
}

const DraggableConfig = ({ title, subtitle, initialData, onSave, onCancel, className, hideItemActions, showItemModals }: DraggableConfigProps) => {
    const [queues, setQueues]       = useState(initialData);
    const [activeId, setActiveId]   = useState<string | null>(null);
    const [infoTarget, setInfoTarget] = useState<ModalTarget | null>(null);
    const [editTarget, setEditTarget] = useState<ModalTarget | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleDragOver = (event: any) => {
        const { active, over } = event;
        if (!over) return;

        const overId = over.id;
        const activeId = active.id;

        const activeColumn = queues.active.some(i => i.id === activeId) ? 'active' : 'inactive';

        let overColumn: 'active' | 'inactive' | null = null;
        if (overId === 'active' || overId === 'inactive') {
            overColumn = overId;
        } else {
            overColumn = queues.active.some(i => i.id === overId) ? 'active' : 'inactive';
        }

        if (overColumn && activeColumn !== overColumn) {
            setQueues(prev => {
                const activeItems = [...prev[activeColumn]];
                const overItems = [...prev[overColumn]];
                const activeIndex = activeItems.findIndex(i => i.id === activeId);
                const [movedItem] = activeItems.splice(activeIndex, 1);

                const overIndex = overItems.findIndex(i => i.id === overId);
                const insertIndex = overIndex >= 0 ? overIndex : overItems.length;
                overItems.splice(insertIndex, 0, movedItem);

                return {
                    ...prev,
                    [activeColumn]: activeItems,
                    [overColumn]: overItems,
                };
            });
        }
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const overId = over.id;
            const activeId = active.id;

            const activeColumn = queues.active.some(i => i.id === activeId) ? 'active' : 'inactive';

            let overColumn: 'active' | 'inactive' | null = null;
            if (overId === 'active' || overId === 'inactive') {
                overColumn = overId;
            } else {
                overColumn = queues.active.some(i => i.id === overId) ? 'active' : 'inactive';
            }

            if (activeColumn === overColumn) {
                setQueues(prev => ({
                    ...prev,
                    [activeColumn]: arrayMove(
                        prev[activeColumn],
                        prev[activeColumn].findIndex(i => i.id === activeId),
                        prev[activeColumn].findIndex(i => i.id === overId)
                    ),
                }));
            }
        }
        setActiveId(null);
    };

    const handleEditSave = (updates: { label: string; description: string }) => {
        if (!editTarget) return;
        const updateInList = (list: QueueItem[]) =>
            list.map(i => i.id === editTarget.item.id ? { ...i, ...updates } : i);
        setQueues(prev => ({
            active:   updateInList(prev.active),
            inactive: updateInList(prev.inactive),
        }));
        setEditTarget(null);
    };

    const handleInfo = (item: QueueItem, type: 'active' | 'inactive') => {
        setEditTarget(null);
        setInfoTarget({ item, type });
    };

    const handleEdit = (item: QueueItem, type: 'active' | 'inactive') => {
        setInfoTarget(null);
        setEditTarget({ item, type });
    };

    const activeItem = activeId
        ? [...queues.active, ...queues.inactive].find(i => i.id === activeId)
        : null;

    const showActions = showItemModals && !hideItemActions;

    return (
        <>
            <div className={cn("flex flex-col gap-3 p-3 md:p-4 bg-white rounded-xl border border-slate-200 shadow-sm h-full overflow-hidden", className)}>
                <div className="flex items-center justify-between shrink-0 gap-2 flex-wrap">
                    <div className="space-y-0.5 min-w-0 flex-1">
                        <h2 className="text-sm font-bold text-slate-900 truncate">{title}</h2>
                        {subtitle && <p className="text-[11px] text-slate-500 font-medium">{subtitle}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => onSave?.(queues)}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm uppercase tracking-wider"
                        >
                            <Save size={12} /> Submit
                        </button>
                        <button
                            onClick={() => { setQueues(initialData); onCancel?.(); }}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-red-200 hover:text-red-500 rounded-lg transition-colors uppercase tracking-wider"
                        >
                            <X size={12} /> Cancel
                        </button>
                    </div>
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex-1 min-h-0 grid grid-cols-2 gap-3 md:gap-4">
                        <Column
                            title="Active Queues"
                            items={queues.active}
                            type="active"
                            hideItemActions={!showActions}
                            onInfo={showActions ? (item) => handleInfo(item, 'active') : undefined}
                            onEdit={showActions ? (item) => handleEdit(item, 'active') : undefined}
                        />
                        <Column
                            title="Inactive Queues"
                            items={queues.inactive}
                            type="inactive"
                            hideItemActions={!showActions}
                            onInfo={showActions ? (item) => handleInfo(item, 'inactive') : undefined}
                            onEdit={showActions ? (item) => handleEdit(item, 'inactive') : undefined}
                        />
                    </div>

                    <DragOverlay dropAnimation={{
                        sideEffects: defaultDropAnimationSideEffects({
                            styles: { active: { opacity: '0.5' } },
                        }),
                    }}>
                        {activeId && activeItem ? (
                            <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg shadow-xl opacity-90 scale-105 cursor-grabbing">
                                <GripVertical size={16} className="text-slate-400" />
                                <div className="flex items-center gap-2 flex-1">
                                    {activeItem.icon && (
                                        <activeItem.icon
                                            size={16}
                                            className={queues.active.some(i => i.id === activeId) ? "text-green-600" : "text-red-500"}
                                        />
                                    )}
                                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">{activeItem.label}</span>
                                </div>
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>

            {/* Modals */}
            {infoTarget && (
                <QueueInfoModal
                    item={infoTarget.item}
                    type={infoTarget.type}
                    onClose={() => setInfoTarget(null)}
                />
            )}
            {editTarget && (
                <QueueEditModal
                    item={editTarget.item}
                    type={editTarget.type}
                    onSave={handleEditSave}
                    onClose={() => setEditTarget(null)}
                />
            )}
        </>
    );
};

export default DraggableConfig;
