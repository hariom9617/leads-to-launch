"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, FileSearch, Sparkles, Send } from "lucide-react";

const stats = [
  { key: "leadsCount",   label: "Leads scraped",   icon: Users,       color: "text-[color:var(--chart-1)]" },
  { key: "auditsCount",  label: "Sites audited",    icon: FileSearch,  color: "text-[color:var(--chart-2)]" },
  { key: "promptsCount", label: "Prompts generated",icon: Sparkles,    color: "text-[color:var(--chart-4)]" },
  { key: "draftsCount",  label: "Outreach drafts",  icon: Send,        color: "text-[color:var(--accent-foreground)]" },
] as const;

type Props = {
  leadsCount: number;
  auditsCount: number;
  promptsCount: number;
  draftsCount: number;
  loading: boolean;
};

export function StatsBar({ leadsCount, auditsCount, promptsCount, draftsCount, loading }: Props) {
  const values: Record<string, number> = { leadsCount, auditsCount, promptsCount, draftsCount };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map(({ key, label, icon: Icon, color }) => (
        <Card key={key}>
          <CardContent className="pt-6 pb-5">
            <div className="flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">{label}</div>
              <Icon className={`h-4 w-4 ${color}`} strokeWidth={1.5} />
            </div>
            {loading ? (
              <Skeleton className="h-9 w-16 mt-2" />
            ) : (
              <div className="font-display text-4xl tabular-nums mt-2 leading-none">{values[key]}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
