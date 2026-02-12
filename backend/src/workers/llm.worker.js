const { parentPort, workerData } = require('worker_threads')
const { clasifyTicket } = require('../services/llm.service');
const logger = require('../config/logger');

async function runClasifyTicket() {
    try {
        const { ticket } = workerData
        const response = await clasifyTicket(ticket);

        parentPort.postMessage({ success: true, data: JSON.parse(response) })
    } catch (error) {
        logger.error("LLM Error", error.message);
        parentPort.postMessage({ success: false, data: error.message });
    }
}

runClasifyTicket()