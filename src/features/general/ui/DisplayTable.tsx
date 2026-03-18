import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Search, FileSpreadsheet, ChevronDown, FileText } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { DisplayTablePagination } from './DisplayTablePagination';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ToolbarButtonDef {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
    className?: string;
    hide?: boolean;
    disabled?: boolean;
}

export interface DisplayTableColumn<T> {
    header: string;
    accessorKey?: keyof T;
    render?: (row: T, rowIndex: number) => React.ReactNode;
    className?: string;
    headerClassName?: string;
    disableFilter?: boolean;
}

interface DisplayTableProps<T> {
    data: T[];
    columns: DisplayTableColumn<T>[];
    onRowClick?: (row: T) => void;
    selectedRowPredicate?: (row: T) => boolean;
    className?: string;
    title?: string;
    enableGlobalSearch?: boolean;
    enableColumnFilters?: boolean;
    enablePagination?: boolean;
    initialPageSize?: number;
    pageSizeOptions?: number[];
    toolbarButtons?: ToolbarButtonDef[];
    emptyMessage?: string;
    enableExport?: boolean;
    exportFileName?: string;
    exportButtonClassName?: string;
    headerExtra?: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DisplayTable<T>({
    data,
    columns,
    onRowClick,
    selectedRowPredicate,
    className,
    title,
    enableGlobalSearch = false,
    enableColumnFilters = false,
    enablePagination = false,
    initialPageSize = 10,
    pageSizeOptions = [2, 3, 5, 10, 20, 50],
    toolbarButtons = [],
    emptyMessage = "No entries found.",
    enableExport = false,
    exportFileName = "export",
    exportButtonClassName,
    headerExtra,
}: DisplayTableProps<T>) {
    // ── State ──────────────────────────────────────────────────────────
    const [globalFilter, setGlobalFilter] = useState("");
    const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);

    // Close export dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
                setShowExportMenu(false);
            }
        };
        if (showExportMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showExportMenu]);

    // ── Filterable columns ─────────────────────────────────────────────
    const filterableColumns = useMemo(
        () => columns.filter((col) => col.accessorKey && !col.disableFilter),
        [columns]
    );

    // ── Filtering ──────────────────────────────────────────────────────
    const filteredData = useMemo(() => {
        let result = data;

        if (globalFilter) {
            const term = globalFilter.toLowerCase();
            result = result.filter((row) =>
                filterableColumns.some((col) => {
                    const value = row[col.accessorKey!];
                    return value != null && String(value).toLowerCase().includes(term);
                })
            );
        }

        for (const col of filterableColumns) {
            const filterValue = columnFilters[String(col.accessorKey)];
            if (filterValue) {
                const term = filterValue.toLowerCase();
                result = result.filter((row) => {
                    const value = row[col.accessorKey!];
                    return value != null && String(value).toLowerCase().includes(term);
                });
            }
        }

        return result;
    }, [data, globalFilter, columnFilters, filterableColumns]);

    // ── Pagination ─────────────────────────────────────────────────────
    const displayData = useMemo(() => {
        if (!enablePagination) return filteredData;
        return filteredData.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize
        );
    }, [filteredData, enablePagination, currentPage, pageSize]);

    const updateGlobalFilter = (value: string) => {
        setGlobalFilter(value);
        setCurrentPage(1);
    };

    const updateColumnFilter = (key: string, value: string) => {
        setColumnFilters((prev) => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => setCurrentPage(page);
    const handlePageSizeChange = (size: number) => { setPageSize(size); setCurrentPage(1); };

    // ── Export ─────────────────────────────────────────────────────────
    const exportableColumns = useMemo(
        () => columns.filter((col) => col.accessorKey),
        [columns]
    );

    const triggerDownload = useCallback((blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, []);

    const handleExportCSV = useCallback(() => {
        const headers = exportableColumns.map((c) => c.header);
        const rows = filteredData.map((row) =>
            exportableColumns.map((c) => {
                const val = row[c.accessorKey!];
                const str = val != null ? String(val) : "";
                return `"${str.replace(/"/g, '""')}"`;
            })
        );
        const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        triggerDownload(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `${exportFileName}.csv`);
        setShowExportMenu(false);
    }, [filteredData, exportableColumns, exportFileName, triggerDownload]);

    const handleExportXLS = useCallback(() => {
        const headerCells = exportableColumns.map((c) => `<th>${c.header}</th>`).join("");
        const bodyRows = filteredData
            .map((row) => {
                const cells = exportableColumns
                    .map((c) => {
                        const val = row[c.accessorKey!];
                        return `<td>${val != null ? String(val) : ""}</td>`;
                    })
                    .join("");
                return `<tr>${cells}</tr>`;
            })
            .join("");
        const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body><table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></body></html>`;
        triggerDownload(
            new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" }),
            `${exportFileName}.xls`
        );
        setShowExportMenu(false);
    }, [filteredData, exportableColumns, exportFileName, triggerDownload]);

    const showHeader = enableGlobalSearch || toolbarButtons.length > 0 || !!title || enableExport;

    // ── Render ─────────────────────────────────────────────────────────
    return (
        <div className={cn("w-full border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white flex flex-col", className)}>

            {/* Blue header */}
            {showHeader && (
                <div className="bg-blue-600 px-3 md:px-4 py-2.5 flex items-center justify-between gap-2 shrink-0 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                        {title && (
                            <h3 className="text-white text-sm font-bold flex items-center gap-2 whitespace-nowrap">
                                {title}
                            </h3>
                        )}
                        {enableGlobalSearch && (
                            <div className="relative ml-2 w-36 sm:w-48 md:w-64">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-200 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={globalFilter}
                                    onChange={(e) => updateGlobalFilter(e.target.value)}
                                    className="h-8 w-full rounded-md border-0 bg-white/10 pl-8 pr-3 text-xs text-white placeholder:text-blue-200 focus:outline-none focus:ring-1 focus:ring-white/30"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {toolbarButtons.map((btn, idx) => (
                            <button
                                key={idx}
                                onClick={btn.onClick}
                                className={cn(
                                    "inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-white/20 text-white text-xs font-medium hover:bg-white/10 transition-colors",
                                    btn.className
                                )}
                            >
                                {btn.icon}
                                {btn.label}
                            </button>
                        ))}

                        {enableExport && (
                            <div className="relative" ref={exportRef}>
                                <button
                                    onClick={() => setShowExportMenu((prev) => !prev)}
                                    className={cn(
                                        "inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-white text-white text-xs font-medium hover:bg-white/10 transition-colors",
                                        exportButtonClassName
                                    )}
                                >
                                    <FileSpreadsheet className="w-3.5 h-3.5" />
                                    Export
                                    <ChevronDown className="w-3 h-3" />
                                </button>
                                {showExportMenu && (
                                    <div className="absolute right-0 mt-1 w-36 rounded-md border bg-white shadow-lg z-50 py-1">
                                        <button
                                            onClick={handleExportCSV}
                                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                                        >
                                            <FileText className="w-4 h-4 text-blue-600" />
                                            CSV
                                        </button>
                                        <button
                                            onClick={handleExportXLS}
                                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                                        >
                                            <FileSpreadsheet className="w-4 h-4 text-green-600" />
                                            XLS
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {headerExtra}
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="flex-1 overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-slate-800 text-slate-100 font-semibold uppercase tracking-wider text-[11px]">
                        <tr>
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className={cn(
                                        "px-4 py-3 border-r border-slate-700 last:border-r-0",
                                        col.headerClassName
                                    )}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {enableColumnFilters && (
                        <thead className="bg-muted/50 sticky top-0 z-[1]">
                            <tr className="border-b">
                                {columns.map((col, idx) => {
                                    const isFilterable = col.accessorKey && !col.disableFilter;
                                    const key = col.accessorKey ? String(col.accessorKey) : "";
                                    return (
                                        <th key={`filter-${idx}`} className="h-12 px-1.5 bg-muted/50 border-r border-slate-200 last:border-r-0">
                                            <div className="h-full flex items-center justify-center">
                                                {isFilterable ? (
                                                    <div className="relative w-full flex items-center">
                                                        <Search className="absolute left-2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                                                        <input
                                                            type="text"
                                                            placeholder="Filter..."
                                                            value={columnFilters[key] ?? ""}
                                                            onChange={(e) => updateColumnFilter(key, e.target.value)}
                                                            className="h-8 w-full rounded-md border border-input bg-background pl-7 pr-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                        />
                                                    </div>
                                                ) : null}
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                    )}

                    <tbody>
                        {displayData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-4 py-12 text-center text-sm text-muted-foreground bg-white"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            displayData.map((row, rowIdx) => {
                                const isSelected = selectedRowPredicate ? selectedRowPredicate(row) : false;
                                return (
                                    <tr
                                        key={rowIdx}
                                        onClick={() => onRowClick && onRowClick(row)}
                                        className={cn(
                                            "hover:bg-blue-50/50 transition even:bg-slate-50/50",
                                            onRowClick && "cursor-pointer",
                                            isSelected ? "bg-blue-100" : ""
                                        )}
                                    >
                                        {columns.map((col, colIdx) => (
                                            <td
                                                key={colIdx}
                                                className={cn(
                                                    "px-4 py-3 border-r border-slate-100 last:border-r-0",
                                                    col.className
                                                )}
                                            >
                                                {col.render
                                                    ? col.render(row, rowIdx)
                                                    : col.accessorKey
                                                        ? String(row[col.accessorKey])
                                                        : ""}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination footer */}
            {enablePagination && (
                <div>
                    <DisplayTablePagination
                        totalItems={filteredData.length}
                        pageSize={pageSize}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                        pageSizeOptions={pageSizeOptions}
                    />
                </div>
            )}
        </div>
    );
}
