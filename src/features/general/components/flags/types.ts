import type { LucideIcon } from "lucide-react";

export type ColumnType = "active" | "inactive";

export interface FlagItem {
    id:          string;
    label:       string;
    description: string;
    icon:        LucideIcon;
    bgColor:     string;
    textColor:   string;
}

export interface FlagState {
    active:   FlagItem[];
    inactive: FlagItem[];
}

export interface FlagTheme {
    bg:        string;
    tc:        string;
    ringBg:    string;
    accBg:     string;
    accBorder: string;
    badgeText: string;
}
