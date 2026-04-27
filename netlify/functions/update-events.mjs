/**
 * POST /api/update-events
 * Saves an updated event list to Netlify Blobs.
 * Requires the X-Admin-Pin header to match the ADMIN_PIN environment variable.
 *
 * Setup: In Netlify → Site Settings → Environment Variables, add:
 *   ADMIN_PIN = <your chosen 4-6 digit PIN>
 */

import { getStore } from "@netlify/blobs";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Pin",
};

export default async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  // Validate PIN
  const submittedPin = req.headers.get("X-Admin-Pin");
  const expectedPin = process.env.ADMIN_PIN;

  if (!expectedPin) {
    console.error("ADMIN_PIN environment variable is not set.");
    return new Response(
      JSON.stringify({ error: "Server configuration error: ADMIN_PIN not set." }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }

  if (!submittedPin || submittedPin.trim() !== expectedPin.trim()) {
    return new Response(JSON.stringify({ error: "Invalid PIN." }), {
      status: 401,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  // Parse and validate body
  let events;
  try {
    events = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  if (!Array.isArray(events)) {
    return new Response(JSON.stringify({ error: "Body must be a JSON array of events." }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  // Validate each event has required fields
  const required = ["title", "date", "location", "category"];
  for (const [i, ev] of events.entries()) {
    for (const field of required) {
      if (!ev[field]) {
        return new Response(
          JSON.stringify({ error: `Event #${i + 1} is missing required field: "${field}"` }),
          { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }
    }
  }

  // Save to Netlify Blobs
  try {
    const store = getStore("grant-beach-events");
    await store.setJSON("event-list", events);

    return new Response(
      JSON.stringify({ success: true, saved: events.length }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("update-events error:", err);
    return new Response(JSON.stringify({ error: "Failed to save events. Please try again." }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
};

export const config = { path: "/api/update-events" };
