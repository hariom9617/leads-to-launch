"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { IndianRupee, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { DbAudit, DbLead } from "@/lib/db-types";

function leadName(leadId: string, leads: DbLead[]) {
  return leads.find((l) => l.id === leadId)?.name ?? leadId;
}

function PageSpeedRing({ score }: { score: number }) {
  const color =
    score === 0
      ? "stroke-[color:var(--destructive)]"
      : score < 50
      ? "stroke-[color:var(--destructive)]"
      : score < 70
      ? "stroke-[color:var(--chart-4)]"
      : "stroke-[color:var(--accent-foreground)]";
  const textColor =
    score === 0
      ? "text-[color:var(--destructive)]"
      : score < 50
      ? "text-[color:var(--destructive)]"
      : score < 70
      ? "text-[color:var(--chart-4)]"
      : "text-[color:var(--accent-foreground)]";
  const c = 2 * Math.PI * 22;
  const offset = c - (score / 100) * c;
  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg viewBox="0 0 56 56" className="h-full w-full -rotate-90">
        <circle cx="28" cy="28" r="22" className="stroke-muted fill-none" strokeWidth="5" />
        <motion.circle
          cx="28" cy="28" r="22" fill="none" strokeWidth="5" strokeLinecap="round"
          className={color}
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums ${textColor}`}>
        {score || "—"}
      </div>
    </div>
  );
}

function Flag({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`flex items-center gap-1 text-[11px] ${ok ? "text-[color:var(--accent-foreground)]" : "text-muted-foreground/60"}`}>
      {ok
        ? <CheckCircle2 className="h-3 w-3" strokeWidth={1.75} />
        : <XCircle className="h-3 w-3" strokeWidth={1.75} />
      }
      {label}
    </span>
  );
}

export function AuditsGrid({
  audits,
  leads,
  loading,
}: {
  audits: DbAudit[];
  leads: DbLead[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-56 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (audits.length === 0) {
    return (
      <Card>
        <div className="py-16 text-center text-sm text-muted-foreground">
          No audits saved yet. Run Phase 2 in the pipeline to generate audits.
        </div>
      </Card>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {audits.map((audit, i) => (
        <motion.div
          key={audit.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium leading-snug">
                {leadName(audit.lead_id, leads)}
              </CardTitle>
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground mt-0.5">
                {audit.has_website ? "Has website" : "No website"}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Score + revenue */}
              <div className="flex items-center gap-4">
                <PageSpeedRing score={audit.pagespeed_score} />
                <div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Est. lost / mo</div>
                  <div className="font-display text-xl tabular-nums flex items-center mt-0.5">
                    <IndianRupee className="h-3.5 w-3.5" strokeWidth={1.5} />
                    {audit.est_lost_revenue_per_month.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              {/* Flags */}
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <Flag ok={audit.mobile_friendly} label="Mobile" />
                <Flag ok={audit.https} label="HTTPS" />
                <Flag ok={audit.has_schema} label="Schema" />
                {audit.load_time_ms > 0 && (
                  <span className="text-[11px] text-muted-foreground">
                    {(audit.load_time_ms / 1000).toFixed(1)}s load
                  </span>
                )}
              </div>

              {/* Gaps */}
              <div className="flex flex-wrap gap-1">
                {audit.gaps.slice(0, 3).map((g) => (
                  <Badge
                    key={g}
                    variant="outline"
                    className="text-[10px] font-normal text-[color:var(--destructive)] border-[color:var(--destructive)]/30 bg-[color:var(--destructive)]/5"
                  >
                    {g}
                  </Badge>
                ))}
                {audit.gaps.length > 3 && (
                  <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">
                    +{audit.gaps.length - 3} more
                  </Badge>
                )}
              </div>

              {/* Biggest gap */}
              <div className="rounded-md bg-muted/60 p-2.5 text-xs border border-border">
                <div className="flex items-start gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-[color:var(--chart-4)] mt-0.5 shrink-0" strokeWidth={1.75} />
                  <span className="text-muted-foreground italic leading-relaxed">{audit.biggest_gap}</span>
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground text-right">
                {new Date(audit.created_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
