/**
 * GET /api/events
 * Returns the current event list from Netlify Blobs.
 * Falls back to SAMPLE_EVENTS if no events have been saved yet.
 *
 * Fix: sample data is inlined here rather than read from the file system,
 * which broke when esbuild bundled the function (import.meta.url path issue).
 */

import { getStore } from "@netlify/blobs";

// Fallback data used before leadership publishes their first set of events.
const SAMPLE_EVENTS = [
  {
    title: "Monthly Neighborhood Meeting",
    date: "2026-04-28",
    time: "6:30 PM",
    endTime: "8:00 PM",
    location: "Grant Beach Community Center, 1000 N Broadway Ave",
    category: "meeting",
    description: "Monthly association meeting. Agenda includes park maintenance updates, summer event planning, and Q&A with the 5th Ward Council representative.",
    link: ""
  },
  {
    title: "Spring Park Cleanup Day",
    date: "2026-05-02",
    time: "9:00 AM",
    endTime: "12:00 PM",
    location: "Grant Beach Park",
    category: "cleanup",
    description: "Bring gloves and a smile! We'll be clearing debris, spreading mulch, and planting native flowers along the park trail. Trash bags provided.",
    link: "https://www.facebook.com/grantbeachna"
  },
  {
    title: "National Night Out Kickoff Planning",
    date: "2026-05-12",
    time: "6:00 PM",
    endTime: "7:30 PM",
    location: "Zoom (link sent to members)",
    category: "safety",
    description: "Virtual planning session for our National Night Out event in August.",
    link: ""
  },
  {
    title: "Kids Nature Walk",
    date: "2026-05-16",
    time: "10:00 AM",
    endTime: "11:30 AM",
    location: "Grant Beach Park – Pavilion 2",
    category: "kids",
    description: "A guided nature walk for kids ages 5–12. Led by Springfield Conservation volunteers.",
    link: "https://www.facebook.com/grantbeachna"
  },
  {
    title: "Neighborhood Potluck & Social",
    date: "2026-05-23",
    time: "5:00 PM",
    endTime: "8:00 PM",
    location: "Grant Beach Park – Pavilion 1",
    category: "social",
    description: "Bring a dish to share and meet your neighbors! Tables and grills provided. RSVP helpful but not required.",
    link: "https://www.facebook.com/grantbeachna"
  },
  {
    title: "Monthly Neighborhood Meeting",
    date: "2026-05-26",
    time: "6:30 PM",
    endTime: "8:00 PM",
    location: "Grant Beach Community Center, 1000 N Broadway Ave",
    category: "meeting",
    description: "Monthly association meeting. Summer park programming, neighborhood watch updates.",
    link: ""
  },
  {
    title: "Safety & Security Town Hall",
    date: "2026-06-09",
    time: "7:00 PM",
    endTime: "8:30 PM",
    location: "Grant Beach Community Center",
    category: "safety",
    description: "SPD Crime Prevention Unit presents neighborhood crime stats and discusses the new Neighbors app partnership.",
    link: ""
  },
  {
    title: "Summer Splash Family Day",
    date: "2026-06-20",
    time: "11:00 AM",
    endTime: "3:00 PM",
    location: "Grant Beach Aquatic Center",
    category: "kids",
    description: "Free admission for Grant Beach residents! Splash pad, swimming lessons demo, and ice cream social. Bring your ID as proof of address.",
    link: "https://www.facebook.com/grantbeachna"
  }
];

export default async (req) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-cache",
  };

  try {
    const store = getStore("grant-beach-events");
    const events = await store.get("event-list", { type: "json" });

    if (events && Array.isArray(events) && events.length > 0) {
      return new Response(JSON.stringify(events), { status: 200, headers });
    }

    // Nothing saved yet — return sample data
    return new Response(JSON.stringify(SAMPLE_EVENTS), { status: 200, headers });

  } catch (err) {
    console.error("get-events error:", err);
    // On any error (including Blobs not yet configured), return sample data
    return new Response(JSON.stringify(SAMPLE_EVENTS), { status: 200, headers });
  }
};

export const config = { path: "/api/events" };
