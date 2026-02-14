const llmClient = require("../../config/llm")
const _ = require("lodash");
const logger = require("../../config/logger");
const ticketMessageRepositories = require('../../repositories/ticketMessage.repository')
const ticketRepositories = require('../../repositories/ticket.repository')

const buildService = (provider) => {
    try {
        switch (provider) {
            default:
                const service = require('./gemini.service')
                return service
        }
    } catch (error) {
        throw new Error("Unable to find the LLM model")
    }
}

const clasifyTicket = async (ticket) => {
    const llmResponse = buildService("GEMINI");
    try {
        const modelResponse = await llmResponse.clasifyTicket(ticket)
        const { response } = modelResponse

        await ticketRepositories.updateTicket(_.merge(ticket, modelResponse))
        await ticketMessageRepositories.createTicketMessage({ ticket_id: ticket.id, message: response })
    } catch (error) {
        logger.error("Classification failed, Will retry again later", error)
        throw new Error("Classification failed, Will retry again later", error)
    }
}

module.exports = { clasifyTicket }