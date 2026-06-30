/**
 * Typed helpers for all Supabase persistence.
 * Each function is fire-and-forget safe — they log errors but never throw,
 * so a DB failure never breaks the UI flow.
 */

import { supabase } from "./supabase";
import type { Lead, AuditResult } from "./types";

// ─── Leads ────────────────────────────────────────────────────────────────────

export async function saveLeads(leads: Lead[]): Promise<void> {
  if (leads.length === 0) return;

  const rows = leads.map((l) => ({
    id: l.id,
    name: l.name,
    category: l.category,
    address: l.address,
    city: l.city,
    phone: l.phone ?? null,
    whatsapp: l.whatsapp ?? null,
    email: l.email ?? null,
    website: l.website ?? null,
    rating: l.rating ?? null,
    reviews_count: l.reviewsCount ?? null,
    lat: l.lat,
    lng: l.lng,
    photos_count: l.photosCount ?? null,
    years_in_business: l.yearsInBusiness ?? null,
  }));

  const { error } = await supabase
    .from("leads")
    .upsert(rows, { onConflict: "id" });

  if (error) console.error("[db] saveLeads:", error.message);
}

// ─── Audits ───────────────────────────────────────────────────────────────────

export async function saveAudit(audit: AuditResult): Promise<void> {
  const { error } = await supabase.from("audits").upsert(
    {
      lead_id: audit.leadId,
      pagespeed_score: audit.pageSpeedScore,
      has_website: audit.hasWebsite,
      mobile_friendly: audit.mobileFriendly,
      https: audit.https,
      has_schema: audit.hasSchema,
      load_time_ms: audit.loadTimeMs,
      gaps: audit.gaps,
      biggest_gap: audit.biggestGap,
      est_lost_revenue_per_month: audit.estLostRevenuePerMonth,
    },
    { onConflict: "lead_id" },
  );

  if (error) console.error("[db] saveAudit:", error.message);
}

// ─── Prompts ──────────────────────────────────────────────────────────────────

export async function savePrompt(
  leadId: string,
  platform: string,
  prompt: string,
): Promise<void> {
  const { error } = await supabase.from("prompts").upsert(
    {
      lead_id: leadId,
      platform,
      prompt,
    },
    { onConflict: "lead_id,platform" },
  );

  if (error) console.error("[db] savePrompt:", error.message);
}

// ─── Outreach drafts ──────────────────────────────────────────────────────────

export async function saveOutreachDraft(
  leadId: string,
  channel: string,
  language: string,
  firstMessage: string,
  followUp: string,
): Promise<void> {
  const { error } = await supabase.from("outreach_drafts").upsert(
    {
      lead_id: leadId,
      channel,
      language,
      first_message: firstMessage,
      follow_up: followUp,
    },
    { onConflict: "lead_id,channel,language" },
  );

  if (error) console.error("[db] saveOutreachDraft:", error.message);
}
