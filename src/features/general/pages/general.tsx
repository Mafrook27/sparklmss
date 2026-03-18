import { useState } from "react";
import { Menu, X } from "lucide-react";
import { GENERAL_TABS } from "../config/generalconfig";
import QueueConfiguration from "../components/QueueConfiguration";
import CollectionAgentQueueConfiguration from "../components/CollectionAgentQueueConfiguration";
import DashboardMenusConfiguration from "../components/DashboardMenusConfiguration";
import NotesTopicConfiguration from "../components/NotesTopicConfiguration";
import TagsConfiguration from "../components/TagsConfiguration";
import FlagsConfiguration from "../components/flags";
import GeneralConfiguration from "../components/GeneralConfiguration";
import DocumentType from "../components/DocumentType";
import CashRegister from "../components/CashRegister";

const General = () => {
    const [activeTab, setActiveTab]       = useState("queue-config");
    const [sidebarOpen, setSidebarOpen]   = useState(false);

    const renderContent = () => {
        switch (activeTab) {
            case "queue-config":             return <QueueConfiguration />;
            case "collection-agent-queue":   return <CollectionAgentQueueConfiguration />;
            case "dashboard-menus-config":   return <DashboardMenusConfiguration />;
            case "notes-topic":              return <NotesTopicConfiguration />;
            case "tags":                     return <TagsConfiguration />;
            case "flags":                    return <FlagsConfiguration />;
            case "document-type":            return <DocumentType />;
            case "general-config":           return <GeneralConfiguration />;
            case "cash-register":            return <CashRegister />;
            default: {
                const tab = GENERAL_TABS.find(t => t.id === activeTab);
                return (
                    <div className="flex flex-col items-center justify-center h-full bg-white rounded-xl border border-slate-200 border-dashed p-12 text-center">
                        <div className="p-4 bg-slate-50 rounded-2xl mb-4">
                            {tab && <tab.icon size={40} className="text-slate-300" />}
                        </div>
                        <h3 className="text-base font-semibold text-slate-800 mb-1.5">{tab?.label}</h3>
                        <p className="text-sm text-slate-500 max-w-xs">
                            This configuration module is coming soon.
                        </p>
                    </div>
                );
            }
        }
    };

    const activeTabLabel = GENERAL_TABS.find(t => t.id === activeTab)?.label ?? "";

    return (
        <div className="flex flex-col gap-3 p-3 md:p-4 lg:p-5 h-full font-display">

            {/* Page header */}
            <div className="flex items-center gap-3 shrink-0">
                {/* Mobile sidebar toggle */}
                <button
                    className="lg:hidden p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                    onClick={() => setSidebarOpen(v => !v)}
                    title="Toggle menu"
                >
                    {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
                </button>
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-slate-900 leading-none">General</h1>
                    <p className="text-[11px] text-slate-400 mt-0.5 lg:hidden">{activeTabLabel}</p>
                </div>
            </div>

            {/* Main layout */}
            <div className="flex gap-3 md:gap-4 lg:gap-5 items-stretch min-h-0 flex-1 relative">

                {/* Mobile overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-20 bg-black/30 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* ── Sidebar: Categories ── */}
                <div className={`
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    lg:translate-x-0 lg:static
                    fixed top-0 left-0 h-full z-30
                    w-[180px] xl:w-[210px]
                    shrink-0 flex flex-col rounded-lg border bg-white shadow-sm overflow-hidden
                    transition-transform duration-200
                `}>
                    <div className="px-3 py-2.5 border-b bg-slate-50 shrink-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Categories
                        </span>
                    </div>
                    <nav className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-2 space-y-0.5">
                        {GENERAL_TABS.map((tab) => {
                            const Icon  = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    title={tab.label}
                                    onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                                    className={`
                                        w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs transition-all duration-150 text-left
                                        ${isActive
                                            ? "bg-blue-600 text-white font-semibold shadow-sm"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        }
                                    `}
                                >
                                    <Icon
                                        size={15}
                                        className={`shrink-0 ${isActive ? "text-white" : "text-slate-400"}`}
                                    />
                                    <span className="truncate leading-tight">{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* ── Main Content Area ── */}
                <div className="flex-1 min-w-0 h-full overflow-hidden">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default General;
