/**
 * POST /api/update-config
 * Saves color theme config to Netlify Blobs.
 * Requires the X-Admin-Pin header to match ADMIN_PIN env var.
 */

import { getStore } from "@netlify/blobs";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Pin",
};

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  // Validate PIN
  const submittedPin = req.headers.get("X-Admin-Pin");
  const expectedPin  = process.env.ADMIN_PIN;
  if (!expectedPin) {
    return new Response(JSON.stringify({ error: "ADMIN_PIN not configured." }), {
      status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
  if (!submittedPin || submittedPin.trim() !== expectedPin.trim()) {
    return new Response(JSON.stringify({ error: "Invalid PIN." }), {
      status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  let body;
  try { body = await req.json(); }
  catch {
    return new Response(JSON.stringify({ error: "Invalid JSON." }), {
      status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  // Validate colors
  if (!HEX_RE.test(body.primaryColor)) {
    return new Response(JSON.stringify({ error: "primaryColor must be a 6-digit hex value." }), {
      status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
  for (const [cat, color] of Object.entries(body.categoryColors || {})) {
    if (!HEX_RE.test(color)) {
      return new Response(JSON.stringify({ error: `Category "${cat}" has an invalid color.` }), {
        status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }
  }

  try {
    const store = getStore("grant-beach-events");
    await store.setJSON("site-config", body);
    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("update-config error:", err);
    return new Response(JSON.stringify({ error: "Failed to save config." }), {
      status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
};

export const config = { path: "/api/update-config" };
