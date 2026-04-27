/**
 * GET /api/config
 * Returns the saved color theme config from Netlify Blobs.
 * Falls back to default colors if nothing has been saved yet.
 */

import { getStore } from "@netlify/blobs";

const DEFAULT_CONFIG = {
  primaryColor: "#2e6b35",
  categoryColors: {
    meeting: "#2e6b35",
    social:  "#e07b2a",
    cleanup: "#4a90a4",
    safety:  "#c0392b",
    kids:    "#8e44ad",
    other:   "#7f8c8d"
  }
};

export default async (req) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-cache",
  };

  try {
    const store  = getStore("grant-beach-events");
    const config = await store.get("site-config", { type: "json" });

    if (config && config.primaryColor) {
      // Merge with defaults so new keys are always present
      return new Response(JSON.stringify({ ...DEFAULT_CONFIG, ...config,
        categoryColors: { ...DEFAULT_CONFIG.categoryColors, ...(config.categoryColors || {}) }
      }), { status: 200, headers });
    }

    return new Response(JSON.stringify(DEFAULT_CONFIG), { status: 200, headers });
  } catch (err) {
    console.error("get-config error:", err);
    return new Response(JSON.stringify(DEFAULT_CONFIG), { status: 200, headers });
  }
};

export const config = { path: "/api/config" };
