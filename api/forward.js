export default async function handler(req, res) {
  if (req.method === "POST") {
    // Respond to Zalo immediately
    res.status(200).send("OK");

    // Then handle the forward in the background
    try {
      await fetch("https://script.google.com/macros/s/AKfycbxTUqUYhz9sNpp1SFTdwS4eK4z6_Rb_I49lU17vPdPiNJM1d9AHKvHYO4y8NgHntN97zA/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body)
      });
      console.log("Forwarded event to Google Sheets");
    } catch (err) {
      console.error("Forward error:", err);
    }

    return; // stop here
  }

  // For GET or other methods
  res.status(200).send("Webhook active");
}
