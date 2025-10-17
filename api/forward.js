// Vercel Serverless function: forwards Zalo payload to your Apps Script URL
export default async function handler(req, res) {
  try {
    // Only accept POST for forwarding; respond OK for others
    if (req.method !== "POST") {
      return res.status(200).send("OK");
    }

    // Replace the URL below with your Apps Script Web App URL
    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxTUqUYhz9sNpp1SFTdwS4eK4z6_Rb_I49lU17vPdPiNJM1d9AHKvHYO4y8NgHntN97zA/exec"; // <-- REPLACE

    // req.body is already parsed by Vercel for JSON content-type
    const body = req.body;

    // Forward the body to Apps Script
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    // Respond quickly to Zalo
    return res.status(200).json({ status: "forwarded" });
  } catch (err) {
    console.error("Forward error:", err);
    return res.status(500).json({ error: String(err) });
  }
}
