export default function handler(_req, res) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    databaseUrl: Boolean(process.env.DATABASE_URL),
    neonAuthBaseUrl: Boolean(process.env.NEON_AUTH_BASE_URL || process.env.VITE_NEON_AUTH_URL),
    neonDataApiUrl: Boolean(process.env.NEON_DATA_API_URL || process.env.VITE_NEON_DATA_API_URL),
  });
}
