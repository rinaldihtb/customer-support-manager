const { GoogleGenerativeAI } = require("@google/generative-ai");

const llmClient = new GoogleGenerativeAI(process.env.LLM_API_KEY)

module.exports = llmClient