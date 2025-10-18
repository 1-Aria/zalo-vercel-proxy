export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const body = req.body;
    const sheetUrl = "https://script.google.com/macros/s/AKfycbxTUqUYhz9sNpp1SFTdwS4eK4z6_Rb_I49lU17vPdPiNJM1d9AHKvHYO4y8NgHntN97zA/exec"; // <-- replace this

    // Forward to Google Sheet
    await fetch(sheetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    // Return quickly to Zalo
    res.status(200).send("OK");
  } catch (error) {
    console.error("Forward error:", error);
    res.status(500).send("Error forwarding to Google Sheet");
  }
}
