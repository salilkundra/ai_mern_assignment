const axios = require('axios');
const Prompt = require('../models/Prompt');

// Logic for OpenRouter AI call
exports.askAI = async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
      model: "google/gemma-3-27b-it:free",
      messages: [{ role: "user", content: prompt }],
    }, {
      headers: { 
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    res.json({ answer: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "AI processing failed", details: error.message });
  }
};

// Logic for Saving to MongoDB
exports.saveChat = async (req, res) => {
  try {
    const { prompt, response } = req.body;
    const newEntry = new Prompt({ prompt, response });
    await newEntry.save();
    res.status(201).json({ message: "Successfully saved to database" });
  } catch (error) {
    res.status(500).json({ error: "Failed to save data" });
  }
};

// Logic for fetching latest history
exports.getHistory = async (req, res) => {
  try {
    const history = await Prompt.find().sort({ createdAt: -1 }).limit(6);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
};