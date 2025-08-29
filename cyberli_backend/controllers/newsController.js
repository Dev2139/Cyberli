const axios = require('axios');
const History = require('../models/History');

const HF_API_URL =
  'https://api-inference.huggingface.co/models/mrm8488/bert-tiny-finetuned-fake-news-detection';
const GOOGLE_API_URL =
  'https://factchecktools.googleapis.com/v1alpha1/claims:search';

const analyzeNews = async (req, res) => {
  try {
    const { text, url } = req.body;

    if (!text && !url) {
      return res
        .status(400)
        .json({ message: 'Please provide either text or a URL.' });
    }

    let inputText = text;
    let sourceDomain = null;

    // Extract domain if URL provided
    if (url) {
      try {
        const domain = new URL(url).hostname.replace('www.', '');
        sourceDomain = domain;
        inputText = url; // Use URL as input
      } catch (err) {
        return res.status(400).json({ message: 'Invalid URL format.' });
      }
    }

    let truthScore = 0;
    try {
      const hfResponse = await axios.post(
        HF_API_URL,
        { inputs: inputText },
        {
          headers: {
            Authorization: `Bearer ${process.env.HF_API_KEY}`,
          },
        }
      );
      truthScore = hfResponse?.data?.[0]?.[0]?.score || 0; // Adjust based on response
    } catch (hfError) {
      console.error('Hugging Face error:', hfError.response?.data || hfError.message);
    }

    let factCheckResult = 'Not Found';
    try {
      const googleResponse = await axios.get(GOOGLE_API_URL, {
        params: {
          query: inputText,
          key: process.env.GOOGLE_API_KEY,
        },
      });
   
      if (googleResponse.data?.claims?.length > 0) {
        factCheckResult = googleResponse.data.claims[0].text;
      }
    } catch (googleError) {
      console.error('Google Fact Check error:', googleError.response?.data || googleError.message);
    }

    


    res.json({
      input: inputText,
      result: {
        truthScore,
        factCheckResult,
      },

    });
  } catch (error) {
    console.error('Analysis error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Error analyzing news', error: error.message });
  }
};

module.exports = { analyzeNews };