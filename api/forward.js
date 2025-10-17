export default async function handler(req, res) {
  if (req.method === "POST") {
    console.log("Zalo webhook received:", req.body);
    return res.status(200).json({ status: "ok" });
  } else if (req.method === "GET") {
    return res.status(200).send("Webhook active");
  } else {
    return res.status(405).send("Method Not Allowed");
  }
}
