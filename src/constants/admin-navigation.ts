import {
    Building2,
    HandCoins,
    LayoutDashboard,
    Upload,
    UserRoundCheck,
    Megaphone,
    Users,
    FileText,
    Scale,
    BadgeDollarSign,
    ClipboardList,
} from "lucide-react";
import type { NavItem } from "@/types/admin";

export const ADMIN_NAV_ITEMS: NavItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "properties", label: "Properties", icon: Building2 },
    { id: "property-requests", label: "Listing Requests", icon: ClipboardList },
    { id: "subscribers", label: "Subscribers", icon: UserRoundCheck },
    { id: "offers", label: "Offers", icon: HandCoins },
    { id: "ads", label: "Advertisements", icon: Megaphone },
    { id: "legals", label: "Legal Consultants", icon: Scale },
    { id: "financials", label: "Financial Consultants", icon: BadgeDollarSign },
    { id: "imports", label: "Telegram Import", icon: Upload },
];

export const ADMIN_SETTINGS_ITEMS: NavItem[] = [
    { id: "users", label: "Users & Roles", icon: Users },
    { id: "audit-logs", label: "Audit Logs", icon: FileText },
];