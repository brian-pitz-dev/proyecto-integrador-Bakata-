"use client";

import { useState } from "react";
import { Select } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Week } from "@/lib/training-plan";

/** `w.start` es ISO YYYY-MM-DD: se parsea el string directo, sin pasar por `Date`, para no arrastrar el desfase de timezone (ver lib/date.ts fromISO). */
function monthKey(iso: string): string {
  const [year, month] = iso.split("-");
  return `${year}-${Number(month) - 1}`;
}

interface WeekSelectorProps {
  weeks: Week[];
  selectedWeek: number;
  onSelectWeek: (weekNum: number) => void;
}

/** Selector de mes → semanas del mes, con marca visual de evento/preparación (FR-019/020/021). */
export function WeekSelector({ weeks, selectedWeek, onSelectWeek }: WeekSelectorProps) {
  const selectedWeekObj = weeks.find((w) => w.num === selectedWeek) ?? weeks[0];
  const [selectedMonth, setSelectedMonth] = useState(() => monthKey(selectedWeekObj.start));

  const monthsInPlan = Array.from(new Set(weeks.map((w) => monthKey(w.start)))).map((key) => {
    const [year, month] = key.split("-").map(Number);
    return { key, label: new Date(year, month, 1).toLocaleDateString("es-AR", { month: "long" }) };
  });

  const weeksOfMonth = weeks.filter((w) => monthKey(w.start) === selectedMonth);

  return (
    <div className="grid gap-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Select.Root
          value={selectedMonth}
          onValueChange={(value) => value && setSelectedMonth(value)}
          items={Object.fromEntries(monthsInPlan.map(({ key, label }) => [key, label]))}
        >
          <Select.Trigger
            aria-label="Mes"
            className="flex w-fit cursor-pointer items-center gap-2.5 rounded-full border border-border bg-card py-2 pr-3.5 pl-4 text-sm font-medium text-foreground capitalize shadow-sm transition-colors outline-none hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring/40 data-[popup-open]:border-primary/50"
          >
            <Select.Value />
            <Select.Icon className="text-muted-foreground transition-transform in-data-[popup-open]:rotate-180">
              <ChevronDown className="size-4" aria-hidden="true" />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner
              alignItemWithTrigger={false}
              side="bottom"
              align="start"
              sideOffset={8}
              className="z-50 outline-none"
            >
              <Select.Popup className="min-w-(--anchor-width) origin-(--transform-origin) rounded-2xl bg-card p-1.5 text-sm shadow-[0_12px_32px_-6px_rgba(92,53,116,0.25)] ring-1 ring-foreground/5 transition-[transform,opacity] duration-150 outline-none data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 dark:shadow-[0_12px_32px_-6px_rgba(10,4,20,0.7)] dark:ring-white/10">
                <Select.List>
                  {monthsInPlan.map(({ key, label }) => (
                    <Select.Item
                      key={key}
                      value={key}
                      className="flex cursor-pointer items-center justify-between gap-6 rounded-xl px-3 py-2 font-medium text-foreground capitalize outline-none select-none data-[highlighted]:bg-primary/10 data-[selected]:text-primary dark:data-[highlighted]:bg-white/10 dark:data-[selected]:text-[#d6b8f2]"
                    >
                      <Select.ItemText>{label}</Select.ItemText>
                      <Select.ItemIndicator>
                        <Check className="size-4" aria-hidden="true" />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>

        <div className="flex flex-wrap gap-1.5">
          {weeksOfMonth.map((w) => (
            <button
              key={w.num}
              type="button"
              onClick={() => onSelectWeek(w.num)}
              title={w.phaseLabel}
              aria-pressed={w.num === selectedWeek}
              className={cn(
                "min-w-16 rounded-full border px-4 py-2 text-sm font-medium tabular-nums transition-colors",
                w.num === selectedWeek
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                w.isEventWeek && "ring-2 ring-destructive/50",
                w.isPrepWeek && !w.isEventWeek && "ring-2 ring-accent/60",
              )}
            >
              Sem {w.num}
            </button>
          ))}
        </div>
      </div>

      {weeksOfMonth.some((w) => w.isEventWeek || w.isPrepWeek) && (
        <p className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full ring-2 ring-destructive/50" /> Semana de evento
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full ring-2 ring-accent/60" /> Semana previa
          </span>
        </p>
      )}
    </div>
  );
}
