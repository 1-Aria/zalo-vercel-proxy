export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const scriptUrl = "https://script.google.com/macros/s/AKfycbx5eUTlDBXu95ZE9pYqo4rOlYNXRBbOifJM819CXGvUmhgS4GgvpwCqvVMa1LeEdAoGYQ/exec"; // AppScript URL

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