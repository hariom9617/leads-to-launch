"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import type { DbPrompt, DbLead } from "@/lib/db-types";

const PLATFORM_LABELS: Record<string, string> = {
  lovable: "Lovable",
  "claude-code": "Claude Code",
  bolt: "Bolt.new",
  codex: "Codex",
};

function leadName(leadId: string, leads: DbLead[]) {
  return leads.find((l) => l.id === leadId)?.name ?? leadId;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Prompt copied");
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <Button size="sm" variant="outline" onClick={copy} className="h-8 px-3">
      {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

export function PromptsPanel({
  prompts,
  leads,
  loading,
}: {
  prompts: DbPrompt[];
  leads: DbLead[];
  loading: boolean;
}) {
  const platforms = ["all", ...Array.from(new Set(prompts.map((p) => p.platform)))];
  const [platformFilter, setPlatformFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered =
    platformFilter === "all" ? prompts : prompts.filter((p) => p.platform === platformFilter);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <Card>
        <div className="py-16 text-center text-sm text-muted-foreground">
          No prompts saved yet. Run Phase 4 in the pipeline to generate site-builder prompts.
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-3">
        <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Platform</span>
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-40 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {platforms.map((p) => (
              <SelectItem key={p} value={p}>
                {p === "all" ? "All platforms" : (PLATFORM_LABELS[p] ?? p)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">{filtered.length} prompt{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Cards */}
      {filtered.map((prompt) => {
        const isExpanded = expandedId === prompt.id;
        return (
          <Card key={prompt.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <CardTitle className="text-base font-medium">{leadName(prompt.lead_id, leads)}</CardTitle>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="secondary" className="text-xs font-normal">
                      {PLATFORM_LABELS[prompt.platform] ?? prompt.platform}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(prompt.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setExpandedId(isExpanded ? null : prompt.id)}
                    className="h-8 px-3 text-xs"
                  >
                    {isExpanded ? "Collapse" : "Expand"}
                  </Button>
                  <CopyButton text={prompt.prompt} />
                </div>
              </div>
            </CardHeader>
            {isExpanded && (
              <CardContent>
                <pre className="text-xs leading-relaxed whitespace-pre-wrap font-mono bg-muted/30 rounded-md p-4 max-h-[480px] overflow-y-auto border border-border">
                  {prompt.prompt}
                </pre>
              </CardContent>
            )}
            {!isExpanded && (
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground line-clamp-2 font-mono leading-relaxed">
                  {prompt.prompt.slice(0, 200)}…
                </p>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
