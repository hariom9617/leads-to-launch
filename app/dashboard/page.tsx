"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { LeadsTable } from "@/components/dashboard/LeadsTable";
import { AuditsGrid } from "@/components/dashboard/AuditsGrid";
import { PromptsPanel } from "@/components/dashboard/PromptsPanel";
import { OutreachPanel } from "@/components/dashboard/OutreachPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DbLead, DbAudit, DbPrompt, DbOutreachDraft } from "@/lib/db-types";

export default function DashboardPage() {
  const [leads, setLeads] = useState<DbLead[]>([]);
  const [audits, setAudits] = useState<DbAudit[]>([]);
  const [prompts, setPrompts] = useState<DbPrompt[]>([]);
  const [drafts, setDrafts] = useState<DbOutreachDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);

  async function fetchAll() {
    setLoading(true);
    const [l, a, p, d] = await Promise.all([
      supabase.from("leads").select("*").order("created_at", { ascending: false }),
      supabase.from("audits").select("*").order("created_at", { ascending: false }),
      supabase.from("prompts").select("*").order("created_at", { ascending: false }),
      supabase.from("outreach_drafts").select("*").order("created_at", { ascending: false }),
    ]);
    if (l.data) setLeads(l.data as DbLead[]);
    if (a.data) setAudits(a.data as DbAudit[]);
    if (p.data) setPrompts(p.data as DbPrompt[]);
    if (d.data) setDrafts(d.data as DbOutreachDraft[]);
    setLoading(false);
    setRefreshedAt(new Date());
  }

  useEffect(() => { fetchAll(); }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Page-level toolbar: refresh + last updated */}
      <div className="border-b border-border bg-background/80 sticky top-[57px] z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <div className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
            Database · all saved records
          </div>
          <div className="flex items-center gap-3">
            {refreshedAt && (
              <span className="text-[11px] text-muted-foreground hidden sm:block">
                Updated {refreshedAt.toLocaleTimeString()}
              </span>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={fetchAll}
              disabled={loading}
              className="h-8"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <StatsBar
          leadsCount={leads.length}
          auditsCount={audits.length}
          promptsCount={prompts.length}
          draftsCount={drafts.length}
          loading={loading}
        />

        <Tabs defaultValue="leads" className="mt-8">
          <TabsList className="mb-6 h-10">
            <TabsTrigger value="leads" className="text-xs uppercase tracking-[0.12em]">
              Leads ({leads.length})
            </TabsTrigger>
            <TabsTrigger value="audits" className="text-xs uppercase tracking-[0.12em]">
              Audits ({audits.length})
            </TabsTrigger>
            <TabsTrigger value="prompts" className="text-xs uppercase tracking-[0.12em]">
              Prompts ({prompts.length})
            </TabsTrigger>
            <TabsTrigger value="outreach" className="text-xs uppercase tracking-[0.12em]">
              Outreach ({drafts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leads">
            <LeadsTable leads={leads} loading={loading} />
          </TabsContent>

          <TabsContent value="audits">
            <AuditsGrid audits={audits} leads={leads} loading={loading} />
          </TabsContent>

          <TabsContent value="prompts">
            <PromptsPanel prompts={prompts} leads={leads} loading={loading} />
          </TabsContent>

          <TabsContent value="outreach">
            <OutreachPanel drafts={drafts} leads={leads} loading={loading} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
