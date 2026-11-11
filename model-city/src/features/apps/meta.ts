import {
  Boxes,
  Building2,
  CreditCard,
  Cpu,
  Database,
  FlaskConical,
  Globe,
  LayoutDashboard,
  type LucideIcon,
  Mail,
  MessageSquare,
  Scale,
  Settings,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";
import type { StringKey } from "@/lib/i18n";

export type AppId =
  | "dashboard"
  | "research"
  | "data"
  | "training"
  | "compute"
  | "product"
  | "web"
  | "pricing"
  | "social"
  | "investors"
  | "team"
  | "market"
  | "legal"
  | "office"
  | "mail"
  | "settings";

export interface AppMeta {
  id: AppId;
  labelKey: StringKey;
  icon: LucideIcon;
  w: number;
  h: number;
  group: "build" | "grow" | "company" | "system";
}

export const APPS: AppMeta[] = [
  { id: "dashboard", labelKey: "app.dashboard", icon: LayoutDashboard, w: 940, h: 620, group: "build" },
  { id: "research", labelKey: "app.research", icon: FlaskConical, w: 900, h: 620, group: "build" },
  { id: "data", labelKey: "app.data", icon: Database, w: 860, h: 580, group: "build" },
  { id: "training", labelKey: "app.training", icon: Cpu, w: 940, h: 640, group: "build" },
  { id: "compute", labelKey: "app.compute", icon: Boxes, w: 820, h: 560, group: "build" },
  { id: "product", labelKey: "app.product", icon: Store, w: 900, h: 600, group: "build" },
  { id: "web", labelKey: "app.web", icon: Globe, w: 1000, h: 660, group: "build" },
  { id: "pricing", labelKey: "app.pricing", icon: CreditCard, w: 940, h: 620, group: "grow" },
  { id: "social", labelKey: "app.social", icon: MessageSquare, w: 900, h: 620, group: "grow" },
  { id: "investors", labelKey: "app.investors", icon: TrendingUp, w: 940, h: 640, group: "company" },
  { id: "team", labelKey: "app.team", icon: Users, w: 900, h: 620, group: "company" },
  { id: "market", labelKey: "app.market", icon: TrendingUp, w: 900, h: 600, group: "company" },
  { id: "legal", labelKey: "app.legal", icon: Scale, w: 880, h: 600, group: "company" },
  { id: "office", labelKey: "app.office", icon: Building2, w: 860, h: 560, group: "company" },
  { id: "mail", labelKey: "app.mail", icon: Mail, w: 900, h: 600, group: "company" },
  { id: "settings", labelKey: "app.settings", icon: Settings, w: 880, h: 620, group: "system" },
];

export const APP_BY_ID: Record<AppId, AppMeta> = APPS.reduce((acc, app) => {
  acc[app.id] = app;
  return acc;
}, {} as Record<AppId, AppMeta>);

export const DOCK_ORDER: AppId[] = [
  "dashboard",
  "research",
  "data",
  "training",
  "compute",
  "product",
  "web",
  "pricing",
  "social",
  "investors",
  "team",
  "market",
  "legal",
  "office",
  "mail",
  "settings",
];
