const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const PptxGenJS = require("pptxgenjs");

dotenv.config();

const app = express();
const port = 5000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Define Gemini API Key and URL
const GEMINI_API_KEY = "AIzaSyC4N2-8iJo75_yw6Yhzcdf0RVTvKNuv6KM";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + GEMINI_API_KEY;

// Endpoint to generate slides
app.post("/generate-slides", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "The 'prompt' field is required." });
    }

    // Predefined payload text with the user-provided content
    const payload = {
      contents: [
        {
          parts: [
            {
              text: `Create a professional PowerPoint presentation for the following content: "${prompt}". Ensure the content is well-structured and clear.`,
            },
          ],
        },
      ],
    };

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      return res
        .status(response.status)
        .json({ error: "Failed to generate slides from the Gemini API." });
    }

    const data = await response.json();

    if (!data?.candidates || data.candidates.length === 0) {
      return res.json({ slides: ["No slides generated."] });
    }

    const text = data.candidates[0]?.content?.parts?.[0]?.text || "No text available.";

    // Split the content into slides based on double newlines
    const slideContents = text.split("\n\n").map((slideText) => slideText.trim());

    // Generate a PowerPoint presentation
    const ppt = new PptxGenJS();
    slideContents.forEach((slideText) => {
      const slide = ppt.addSlide();
      slide.addText(slideText, { x: 0.5, y: 0.5, w: "90%", h: "80%", fontSize: 24 });
    });

    // Generate a base64-encoded file
    const base64File = await ppt.write("base64");

    // Send the base64 file content to the frontend
    res.status(200).json({ fileContent: base64File });
  } catch (error) {
    console.error("Error generating slides:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Serve index.html as the default page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
