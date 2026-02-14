const { GoogleGenerativeAI } = require("@google/generative-ai");
const { OpenAI } = require("openai");

const geminiClient = new GoogleGenerativeAI(process.env.LLM_API_KEY)
const openAIClient = new OpenAI({
    apiKey: process.env.LLM_API_KEY,
    baseURL: process.env.LLM_BASE_URL
})

module.exports = { geminiClient, openAIClient }