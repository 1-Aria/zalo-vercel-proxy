export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Replace this with your Apps Script Web App URL
      const scriptUrl = "https://script.google.com/macros/s/AKfycbxTUqUYhz9sNpp1SFTdwS4eK4z6_Rb_I49lU17vPdPiNJM1d9AHKvHYO4y8NgHntN97zA/exec";

      // Forward the payload to your Apps Script
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });

      const text = await response.text();

      // Return OK to Zalo immediately
      res.status(200).send("OK");
    } catch (err) {
      console.error("Forwarding error:", err);
      res.status(500).send("Error forwarding to Apps Script");
    }
  } else {
    res.status(405).send("Method not allowed");
  }
}
