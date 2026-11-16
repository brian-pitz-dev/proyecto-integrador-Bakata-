import { CalendarDays, UtensilsCrossed, TrendingUp, Sparkles } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/calendario", label: "Calendario", Icon: CalendarDays },
  { href: "/nutricion", label: "Nutrición", Icon: UtensilsCrossed },
  { href: "/progreso", label: "Progreso", Icon: TrendingUp },
  { href: "/coach", label: "Coach", Icon: Sparkles },
] as const;
