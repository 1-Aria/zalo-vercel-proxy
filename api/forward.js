export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      await fetch("https://script.google.com/macros/s/AKfycbxTUqUYhz9sNpp1SFTdwS4eK4z6_Rb_I49lU17vPdPiNJM1d9AHKvHYO4y8NgHntN97zA/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body)
      });
      res.status(200).send("OK");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error");
    }
  } else {
    res.status(200).send("Webhook active");
  }
}
