import {
    LayoutGrid, UserCog, Flag, Tag, NotebookTabs, FileText,
    Settings2, LayoutDashboard, Calculator, Database, Banknote,
    CheckCircle, Clock, ThumbsUp, RotateCcw, PieChart, Users,
    Activity, BarChart3, Megaphone, ListTodo, Wallet, UserCheck,
    Camera, LineChart
} from "lucide-react";

export interface QueueItem {
    id: string;
    label: string;
    description?: string;
    icon?: any;
}

export interface GeneralTab {
    id: string;
    label: string;
    icon: any;
}

export const GENERAL_TABS: GeneralTab[] = [
    { id: "queue-config", label: "Queue config", icon: LayoutGrid },
    { id: "collection-agent-queue", label: "Collection Agent Queue", icon: UserCog },
    { id: "flags", label: "Flags", icon: Flag },
    { id: "tags", label: "Tags", icon: Tag },
    { id: "notes-topic", label: "Notes Topic", icon: NotebookTabs },
    { id: "document-type", label: "Document Type", icon: FileText },
    { id: "general-config", label: "General Config", icon: Settings2 },
    { id: "dashboard-menus-config", label: "Dashboard Menu Config", icon: LayoutDashboard },
    { id: "cash-register", label: "Cash Register", icon: Calculator },
];

export const INITIAL_QUEUES = {
    active: [
        { id: "bankruptcy", label: "Bankruptcy", description: "Bankruptcy Processed", icon: Database },
        { id: "funded", label: "Funded", description: "Loans Funded", icon: Banknote },
        { id: "paying-as-agreed", label: "Paying as Agreed", description: "Meeting Terms", icon: CheckCircle },
        { id: "due-today", label: "Due Today", description: "Payments Due", icon: Clock },
        { id: "paid-off", label: "Paid Off", description: "Completed Loans", icon: ThumbsUp },
        { id: "originated", label: "Originated", description: "New Originations", icon: CheckCircle },
        { id: "pending-review", label: "Pending Review", description: "Under Assessment", icon: Clock },
        { id: "ready-to-fund", label: "Ready to Fund", description: "Awaiting Funding", icon: Banknote },
    ],
    inactive: [
        { id: "past-due-1-30", label: "Past Due(1 to 30 days)", description: "Short-term Overdue", icon: Banknote },
        { id: "past-due-31-90", label: "Past Due(31 to 90 days)", description: "Mid-term Overdue", icon: Banknote },
        { id: "past-due-91-150", label: "Past Due(91 to 150 days)", description: "Long-term Overdue", icon: Banknote },
        { id: "past-due-above-150", label: "Past Due(above 150 days)", description: "Severe Overdue", icon: Banknote },
        { id: "archived-leads", label: "Archived Leads", description: "Archived Records", icon: Database },
        { id: "incomplete-docs", label: "Incomplete Documents", description: "Missing Paperwork", icon: FileText },
    ]
};

export const COLLECTION_AGENT_QUEUES = {
    active: [
        { id: "charge-off-arrangement", label: "Charge Off Arrangement", description: "Debt Settlement Plans", icon: ThumbsUp },
        { id: "returns-report", label: "Returns Report", description: "Payment Return Analytics", icon: RotateCcw },
        { id: "payments-cleared-report", label: "Payments Cleared Report", description: "Successful Transactions", icon: Banknote },
        { id: "pdc-report", label: "PDC Report", description: "Post Dated Checks", icon: FileText },
        { id: "reports", label: "Reports", description: "Collection Performance", icon: PieChart },
    ],
    active_count: 5,
    inactive: [
        { id: "charge-off", label: "Charge Off", description: "Uncollectible Debt", icon: Users },
    ]
};

export const DASHBOARD_MENUS = {
    active: [
        { id: "daily-vitals", label: "Daily Vitals", description: "System Health Stats", icon: Activity },
        { id: "product-activity", label: "Product Activity", description: "Loan Product Trends", icon: BarChart3 },
        { id: "campaign-activity", label: "Campaign Activity", description: "Marketing Performance", icon: Megaphone },
        { id: "call-queue-dashboard", label: "Call Queue Dashboard", description: "Dialer Queue Stats", icon: ListTodo },
        { id: "collection-dashboard", label: "Collection Dashboard", description: "Recovery Metrics", icon: Wallet },
        { id: "user-login-activity", label: "User Login Activity", description: "Active Sessions", icon: UserCheck },
        { id: "portfolio-snapshot", label: "Portfolio Snapshot", description: "Current Standing", icon: Camera },
        { id: "projections", label: "Projections", description: "Future Estimates", icon: LineChart },
    ],
    inactive: []
};

export interface NoteTopic {
    id: number;
    topic: string;
}

export interface TagItem {
    id: number;
    tag: string;
}

export const INITIAL_NOTES_TOPICS: NoteTopic[] = [
    { id: 1, topic: "General" },
    { id: 2, topic: "Payment" },
    { id: 3, topic: "Extensions" },
    { id: 4, topic: "Complaint" },
    { id: 5, topic: "Collection" },
    { id: 6, topic: "Bank Verification" },
    { id: 7, topic: "General Verification" },
    { id: 8, topic: "Returns" },
    { id: 9, topic: "Dev" },
];

export const INITIAL_TAGS: TagItem[] = [
    { id: 1, tag: "BankVerification" },
    { id: 2, tag: "Frau" },
    { id: 3, tag: "Recovery" },
    { id: 4, tag: "Returns" },
    { id: 5, tag: "Priority" },
    { id: 6, tag: "Follow-up" },
    { id: 7, tag: "Store9" },
];

export interface DocumentTypeItem {
    id: number;
    name: string;
    isActive: boolean;
    order: number;
}

export const INITIAL_DOC_TYPES: DocumentTypeItem[] = [
    { id: 1,  name: "W2",                  isActive: true,  order: 1 },
    { id: 2,  name: "Bank Statement",      isActive: true,  order: 2 },
    { id: 3,  name: "Pay Stub",            isActive: true,  order: 3 },
    { id: 4,  name: "Utility Bill",        isActive: true,  order: 4 },
    { id: 5,  name: "Government ID",       isActive: true,  order: 5 },
    { id: 6,  name: "Driver License",      isActive: true,  order: 6 },
    { id: 7,  name: "General",             isActive: true,  order: 7 },
    { id: 8,  name: "Tax Return",          isActive: false, order: 0 },
    { id: 9,  name: "Employment Letter",   isActive: false, order: 0 },
    { id: 10, name: "Social Security Card",isActive: false, order: 0 },
];
