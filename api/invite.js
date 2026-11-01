import crypto from "node:crypto";

const safeEqual = (a = "", b = "") => {
  const aBuf = Buffer.from(String(a));
  const bBuf = Buffer.from(String(b));
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Método não permitido." });
  }

  const configuredKey = process.env.TRIP_ACCESS_KEY;
  if (!configuredKey) {
    return res.status(503).json({ ok: false, error: "Chave da viagem ainda não configurada." });
  }

  const accessKey = String(req.body?.accessKey ?? "");
  if (!accessKey || !safeEqual(accessKey, configuredKey)) {
    return res.status(401).json({ ok: false, error: "Chave da viagem inválida." });
  }

  return res.status(200).json({ ok: true });
}
