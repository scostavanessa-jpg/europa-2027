export default async function handler(req, res) {
  try {
    const { origin = "SAO", destination = "MXP", date = "2027-10-08" } = req.query;

    // 🔐 1. GERAR TOKEN
    const tokenRes = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=client_credentials&client_id=${process.env.AMADEUS_API_KEY}&client_secret=${process.env.AMADEUS_API_SECRET}`
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return res.status(500).json({
        error: "Erro ao gerar token Amadeus",
        details: tokenData
      });
    }

    // ✈️ 2. BUSCAR VOOS
    const flightsRes = await fetch(
      `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${date}&adults=3&max=5`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`
        }
      }
    );

    const flightsData = await flightsRes.json();

    if (!flightsData.data) {
      return res.status(500).json({
        error: "Erro ao buscar voos",
        details: flightsData
      });
    }

    // 🧠 3. TRATAR DADOS (limpo pro seu app)
    const results = flightsData.data.map(f => ({
      price: Number(f.price.total),
      duration: f.itineraries[0].duration,
      stops: f.itineraries[0].segments.length - 1,
      airline: f.validatingAirlineCodes?.[0] || "N/A"
    }));

    // 📤 4. RETORNO FINAL
    return res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });

  } catch (err) {
    return res.status(500).json({
      error: "Erro interno",
      message: err.message
    });
  }
}