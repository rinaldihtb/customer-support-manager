const { openAIClient } = require("../../config/llm")
const logger = require("../../config/logger");

const clasifyTicket = async (ticket) => {
    return openAIClient;
}

module.exports = { clasifyTicket }