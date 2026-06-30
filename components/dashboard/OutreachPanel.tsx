"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check, MessageCircle, Mail, Camera } from "lucide-react";
import { toast } from "sonner";
import type { DbOutreachDraft, DbLead } from "@/lib/db-types";

const CHANNEL_ICONS: Record<string, typeof MessageCircle> = {
  whatsapp: MessageCircle,
  email: Mail,
  instagram: Camera,
};

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  email: "Email",
  instagram: "Instagram",
};

function leadName(leadId: string, leads: DbLead[]) {
  return leads.find((l) => l.id === leadId)?.name ?? leadId;
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <Button size="sm" variant="outline" onClick={copy} className="h-8 px-3">
      {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
      {copied ? "Copied" : (label ?? "Copy")}
    </Button>
  );
}

export function OutreachPanel({
  drafts,
  leads,
  loading,
}: {
  drafts: DbOutreachDraft[];
  leads: DbLead[];
  loading: boolean;
}) {
  const channels = ["all", ...Array.from(new Set(drafts.map((d) => d.channel)))];
  const languages = ["all", ...Array.from(new Set(drafts.map((d) => d.language)))];

  const [channelFilter, setChannelFilter] = useState("all");
  const [langFilter, setLangFilter] = useState("all");

  const filtered = drafts.filter((d) => {
    if (channelFilter !== "all" && d.channel !== channelFilter) return false;
    if (langFilter !== "all" && d.language !== langFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (drafts.length === 0) {
    return (
      <Card>
        <div className="py-16 text-center text-sm text-muted-foreground">
          No outreach drafts saved yet. Run Phase 5 in the pipeline to generate messages.
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Filter</span>
        <Select value={channelFilter} onValueChange={setChannelFilter}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {channels.map((c) => (
              <SelectItem key={c} value={c}>
                {c === "all" ? "All channels" : (CHANNEL_LABELS[c] ?? c)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={langFilter} onValueChange={setLangFilter}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages.map((l) => (
              <SelectItem key={l} value={l}>
                {l === "all" ? "All languages" : l.charAt(0).toUpperCase() + l.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          {filtered.length} draft{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Draft cards */}
      {filtered.map((draft) => {
        const ChannelIcon = CHANNEL_ICONS[draft.channel] ?? MessageCircle;
        return (
          <Card key={draft.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <CardTitle className="text-base font-medium">{leadName(draft.lead_id, leads)}</CardTitle>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Badge variant="secondary" className="text-xs font-normal flex items-center gap-1">
                      <ChannelIcon className="h-3 w-3" strokeWidth={1.5} />
                      {CHANNEL_LABELS[draft.channel] ?? draft.channel}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-xs font-normal capitalize"
                    >
                      {draft.language}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(draft.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-4">
                {/* First message */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">First message</span>
                    <CopyButton text={draft.first_message} />
                  </div>
                  <Textarea
                    readOnly
                    value={draft.first_message}
                    className="font-mono text-xs min-h-[180px] resize-none bg-muted/30 cursor-default"
                  />
                </div>
                {/* Follow-up */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Day-3 follow-up</span>
                    <CopyButton text={draft.follow_up} />
                  </div>
                  <Textarea
                    readOnly
                    value={draft.follow_up}
                    className="font-mono text-xs min-h-[180px] resize-none bg-muted/30 cursor-default"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
