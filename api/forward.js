export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const scriptUrl = "https://script.google.com/macros/s/AKfycbxTUqUYhz9sNpp1SFTdwS4eK4z6_Rb_I49lU17vPdPiNJM1d9AHKvHYO4y8NgHntN97zA/exec"; // AppScript URL

    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();
    res.status(200).send(text);
  } catch (error) {
    console.error("Error forwarding request:", error);
    res.status(500).json({ error: error.message });
  }
}