import type { AdminView } from "@/types/property";
import type { LucideIcon } from "lucide-react";
import type { AdminProperty } from "@/types/property";
import type { BuyerOffer } from "@/types/offer";

export interface NavItem {
    id: AdminView;
    label: string;
    icon: LucideIcon;
}

export interface AdminSidebarProps {
    activeView: AdminView;
    onNavigate: (view: AdminView) => void;
    mobileOpen: boolean;
    onCloseMobile: () => void;
}

export interface AdminHeaderProps {
    title: string;
    subtitle?: string;
    userEmail?: string;
    onMenuClick: () => void;
    onNavigate: (view: AdminView) => void;
    onSignOut: () => void;
    actions?: React.ReactNode;
}

export interface DashboardViewProps {
    properties: AdminProperty[];
    totalPropertiesCount?: number;
    offers: BuyerOffer[];
    onAddProperty: () => void;
}