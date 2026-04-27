/**
 * GET /api/events
 * Returns the current event list from Netlify Blobs.
 * Falls back to events-sample.json if no events have been saved yet.
 */

import { getStore } from "@netlify/blobs";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function getSampleEvents() {
  try {
    const samplePath = join(__dirname, "../../events-sample.json");
    return JSON.parse(readFileSync(samplePath, "utf8"));
  } catch {
    return [];
  }
}

export default async (req) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-cache",
  };

  try {
    const store = getStore("grant-beach-events");
    const events = await store.get("event-list", { type: "json" });

    if (events && Array.isArray(events)) {
      return new Response(JSON.stringify(events), { status: 200, headers });
    }

    // No events saved yet — return sample data
    return new Response(JSON.stringify(getSampleEvents()), { status: 200, headers });
  } catch (err) {
    console.error("get-events error:", err);
    // Fallback to sample events on any error
    return new Response(JSON.stringify(getSampleEvents()), { status: 200, headers });
  }
};

export const config = { path: "/api/events" };
