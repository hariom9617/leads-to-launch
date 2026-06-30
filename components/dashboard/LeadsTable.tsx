"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin, Phone, MessageCircle, Mail, Globe, Star, Search } from "lucide-react";
import type { DbLead } from "@/lib/db-types";

export function LeadsTable({ leads, loading }: { leads: DbLead[]; loading: boolean }) {
  const [query, setQuery] = useState("");

  const filtered = leads.filter((l) => {
    const q = query.toLowerCase();
    return (
      !q ||
      l.name.toLowerCase().includes(q) ||
      l.city.toLowerCase().includes(q) ||
      l.category.toLowerCase().includes(q)
    );
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap pb-4">
        <CardTitle>All leads</CardTitle>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search name, city, niche…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Empty message={leads.length === 0 ? "No leads saved yet. Run the pipeline to scrape some." : "No leads match your search."} />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">#</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Reviews</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead className="pr-6">Saved</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((lead, i) => (
                  <TableRow key={lead.id}>
                    <TableCell className="pl-6 text-muted-foreground tabular-nums">{i + 1}</TableCell>
                    <TableCell>
                      <div className="font-medium">{lead.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {lead.address}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs font-normal">{lead.category}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex flex-col gap-0.5">
                        {lead.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3 shrink-0" /> {lead.phone}
                          </span>
                        )}
                        {lead.whatsapp && (
                          <span className="flex items-center gap-1 text-[color:var(--accent-foreground)]">
                            <MessageCircle className="h-3 w-3 shrink-0" /> WhatsApp
                          </span>
                        )}
                        {lead.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3 shrink-0" /> {lead.email}
                          </span>
                        )}
                        {!lead.phone && !lead.whatsapp && !lead.email && (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {lead.rating != null ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-[color:var(--chart-4)] text-[color:var(--chart-4)]" />
                          <span className="font-medium tabular-nums">{lead.rating.toFixed(1)}</span>
                          <span className="text-muted-foreground text-xs">({lead.reviews_count ?? 0})</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {lead.website ? (
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[color:var(--accent-foreground)] hover:underline"
                        >
                          <Globe className="h-3 w-3" /> Visit
                        </a>
                      ) : (
                        <Badge variant="outline" className="text-xs font-normal text-[color:var(--destructive)] border-[color:var(--destructive)]/40 bg-[color:var(--destructive)]/5">
                          No site
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="pr-6 text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Empty({ message }: { message: string }) {
  return (
    <div className="py-16 text-center text-sm text-muted-foreground px-6">{message}</div>
  );
}
