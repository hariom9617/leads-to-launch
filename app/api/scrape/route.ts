import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Lead, ScrapeInput } from "@/lib/types";

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const APIFY_ACTOR = process.env.APIFY_ACTOR ?? "compass~crawler-google-places";

async function loadSeed(): Promise<{ leads: Lead[] }> {
  const p = path.join(process.cwd(), "data", "leads-seed.json");
  const raw = await fs.readFile(p, "utf-8");
  const json = JSON.parse(raw);
  return { leads: json.leads as Lead[] };
}

export async function POST(req: Request) {
  const input = (await req.json()) as ScrapeInput;

  // No token = serve cached seed (matches user's input where possible)
  if (!APIFY_TOKEN) {
    const { leads } = await loadSeed();
    const sliced = leads.slice(0, Math.max(1, Math.min(input.count, leads.length)));
    return NextResponse.json({ source: "seed", leads: sliced });
  }

  try {
    const runRes = await fetch(
      `https://api.apify.com/v2/acts/${APIFY_ACTOR}/run-sync-get-dataset-items?token=${APIFY_TOKEN}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          searchStringsArray: [`${input.niche} in ${input.city}`],
          maxCrawledPlacesPerSearch: input.count,
          language: "en",
          // Visits each business's website and extracts any email addresses found there.
          // No extra Apify cost — included in the base place-scraped event.
          scrapeContacts: true,
        }),
      },
    );
    if (!runRes.ok) throw new Error(`Apify ${runRes.status}`);
    const items = (await runRes.json()) as Array<Record<string, unknown>>;

    const leads: Lead[] = items.slice(0, input.count).map((it, i) => {
      // Email: actor returns an array under `emails` when scrapeContacts=true.
      // Fall back to contactInfo[0].emails if present.
      const emailsArr =
        Array.isArray(it.emails) && it.emails.length > 0
          ? (it.emails as Array<{ email?: string } | string>)
          : Array.isArray((it.contactInfo as Array<{ emails?: string[] }>)?.[0]?.emails)
          ? ((it.contactInfo as Array<{ emails: string[] }>)[0].emails as unknown as Array<{ email?: string } | string>)
          : [];

      const email = emailsArr.length > 0
        ? typeof emailsArr[0] === "string"
          ? emailsArr[0]
          : (emailsArr[0] as { email?: string }).email ?? undefined
        : undefined;

      return {
        id: `live-${String(i + 1).padStart(2, "0")}`,
        name: String(it.title ?? it.name ?? "Unknown"),
        category: String(it.categoryName ?? input.niche),
        address: String(it.address ?? ""),
        city: input.city,
        phone: it.phone ? String(it.phone) : undefined,
        whatsapp: it.phone ? String(it.phone) : undefined,
        email,
        website: it.website ? String(it.website) : undefined,
        rating: typeof it.totalScore === "number" ? (it.totalScore as number) : undefined,
        reviewsCount: typeof it.reviewsCount === "number" ? (it.reviewsCount as number) : undefined,
        lat: typeof (it.location as { lat?: number })?.lat === "number" ? (it.location as { lat: number }).lat : 19.06,
        lng: typeof (it.location as { lng?: number })?.lng === "number" ? (it.location as { lng: number }).lng : 72.83,
        photosCount: typeof it.imagesCount === "number" ? (it.imagesCount as number) : undefined,
      };
    });

    return NextResponse.json({ source: "apify", leads });
  } catch (e) {
    const { leads } = await loadSeed();
    return NextResponse.json({ source: "seed-fallback", error: (e as Error).message, leads: leads.slice(0, input.count) });
  }
}
