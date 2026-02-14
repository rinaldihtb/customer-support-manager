const { Worker, UnrecoverableError } = require('bullmq')
const { clasifyTicket } = require('../services/llm/llm.service');
const logger = require('../config/logger');
const redis = require("../config/redis")

const runClasifyTicket = () => {
    try {
        const worker = new Worker('ticket-tasks', async (job) => {
            const ticketService = require('../services/ticket.service')
            console.info(`Running JOB for`, job.data, job.attemptsMade)
            if (job.name === 'ai-clasify-ticket') {
                try {
                    ticket = await ticketService.getTicket(job.data.ticketId)
                    if ((ticket.messages && ticket.messages.length > 0) || (Date.now() - job.timestamp > process.env.REDIS_JOB_FAILED_EXPIRY_TIME * 1000)) {
                        logger.info("Stopping job: Condition met or Expired");
                        return;
                    }
                    await clasifyTicket(ticket);
                    logger.info("Job Completed for ", job.data.ticketId);
                } catch (error) {
                    logger.error("Logic failed, allowing BullMQ to retry...", error.message);
                    throw error;
                }
            }
        }, { connection: redis })
    } catch (error) {
        logger.error("Classification failed:", error);
    }
}

const initWorkers = () => {
    runClasifyTicket();
}

module.exports = initWorkers;