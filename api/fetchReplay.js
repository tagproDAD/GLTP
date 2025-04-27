export default async function handler(req, res) {
  const { uuid } = req.query;
  if (!uuid) {
    return res.status(400).json({ error: "Missing UUID" });
  }

  try {
    const response = await fetch(`https://tagpro.koalabeast.com/replays/data?uuid=${uuid}`);
    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch data" });
    }

    const data = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
