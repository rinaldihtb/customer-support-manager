const llmClient = require("../../config/llm")
const _ = require("lodash");
const logger = require("../../config/logger");

const clasifyTicket = async (ticket) => {
    const model = await llmClient.geminiClient.getGenerativeModel(
        {
            model: "gemini-3-flash-preview",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "object",
                    properties: {
                        category: {
                            type: "string",
                            enum: ['BILLING', 'TECHNICAL', 'FEATURE_REQUEST']
                        },
                        urgency_level: {
                            type: "string",
                            enum: ['HIGH', 'MEDIUM', 'LOW'],
                        },
                        sentiment_score: {
                            type: "integer",
                            description: "A scale from 1 (lowest) to 10 (highest) based on user sentimental level"
                        },
                        response: {
                            type: "string",
                            description: "Provide a proper and polite response based on the context and from your analysis"
                        },
                        reasoning: { type: "string" }
                    },
                    required: ["category", "urgency_level", "sentiment_score"]
                },
            },
        }
    )

    const prompt = `Analyze this support ticket and classify it: ${JSON.stringify(_.pick(ticket, ['subject', 'description']))}`;
    try {
        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
    } catch (error) {
        throw new Error('Classification failed', error)
    }
}

module.exports = { clasifyTicket }