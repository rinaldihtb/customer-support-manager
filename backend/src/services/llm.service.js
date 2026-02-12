const llmClient = require("../config/llm")
const _ = require("lodash");
const logger = require("../config/logger");
const ticketMessageRepositories = require('../repositories/ticketMessage.repository')
const ticketRepositories = require('../repositories/ticket.repository')

const clasifyTicket = async (ticket) => {
    console.log("tikcet", ticket)
    const model = await llmClient.getGenerativeModel(
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
        const modelResponse = JSON.parse(result.response.text());

        // const modelResponse = {
        //     urgency_level: "HIGH",
        //     sentiment_score: 9,
        //     category: "BILLING",
        //     response: "Terbaik"
        // }
        const { response } = modelResponse

        await ticketRepositories.updateTicket(_.merge(ticket, modelResponse))
        await ticketMessageRepositories.createTicketMessage({ticket_id: ticket.id, message: response})
        return true;
    } catch (error) {
        logger.error("Classification failed:", error);
        throw new Error('Classification failed', error)
    }
}

module.exports = { clasifyTicket }