import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, name, email, scope } = req.body;

    // Validate required fields
    if (!userId || !name || !email) {
      return res.status(400).json({
        error: "Missing required fields: userId, name, and email are required",
      });
    }

    // Log the received Microsoft data
    console.log("Microsoft calendar integration data received:", {
      userId,
      name,
      email,
      scope: scope || "Not provided",
    });

    // Here you can save the data to your database
    // For now, we'll just return a success response
    const microsoftIntegrationData = {
      userId,
      name,
      email,
      scope,
      integratedAt: new Date().toISOString(),
      status: "connected",
    };

    // TODO: Save to your database
    // Example:
    // await saveMicrosoftIntegration(microsoftIntegrationData);

    return res.status(200).json({
      success: true,
      message: "Microsoft calendar integration successful",
      data: microsoftIntegrationData,
    });
  } catch (error) {
    console.error("Error processing Microsoft calendar integration:", error);
    return res.status(500).json({
      error: "Internal server error during Microsoft integration",
    });
  }
}
