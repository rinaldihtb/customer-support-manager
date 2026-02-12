const { Worker } = require('worker_threads')
const path = require('path')
const logger = require('../config/logger')
const ticketRepository = require('../repositories/ticket.repository')
const ticketMessageRepository = require('../repositories/ticketMessage.repository')
const _ = require('lodash')

const createTicket = async (data) => {
    try {
        const { customer_name, customer_email, description } = data
        if (!customer_name) {
            throw new Error("Name can't be empty")
        }
        if (!customer_email) {
            throw new Error("Name can't be empty")
        }
        if (!description) {
            throw new Error("description can't be empty")
        }

        const ticket = await ticketRepository.createTicket(data)

        // Proceed LLM worker
        const worker = new Worker(path.resolve(__dirname, '../workers/llm.worker.js'), {
            workerData: { ticket }
        })

        worker.on('message', (result) => {
            logger.info("Clasifying worker is finished", [
                { message: result }
            ])
        })

        worker.on('error', (error) => {
            logger.error("Clasifying worker error", {
                message: error
            })
        });

        worker.on('exit', (code) => {
            if (code !== 0) logger.error(`Worker stopped with exit code ${code}`);
        });


        return ticket
    } catch (error) {
        logger.error('Failed to create ticket', error)
        throw new Error(error)
    }
}

const listTicket = async (params = { pagination: { page: 1, limit: 10 } }) => {
    try {
        const countTickets = await ticketRepository.countTickets();
        return {
            meta: {
                total: countTickets,
                totalPages: Math.ceil(countTickets / parseInt(params.pagination.limit)),
                page: parseInt(params.pagination.page),
                limit: parseInt(params.pagination.limit)
            },
            data: await ticketRepository.getTickets({ ...params, ...{ sorts: { "created_at": "ASC" }, filters: {} } }) || []
        }
    } catch (error) {
        logger.error('Failed to fetch tickets', error)
    }
}

const getTicket = async (id) => {
    try {
        const ticket = await ticketRepository.getTicket(id)
        const ticketMessages = await ticketMessageRepository.getTicketMessages({ ticketId : id })
        ticket.messages = ticketMessages

        return ticket;
    } catch (error) {
        logger.error('Failed to fetch ticket', error)
    }
}

const resolveTicket = async (id) => {
    try {
        if (!getTicket(id)) {
            throw new Error('Invalid Id')
        }
        // Update ticket
        return await ticketRepository.resolveTicket(id)
    } catch (error) {
        logger.error('Failed to resolve the ticket', error)
    }
}

module.exports = { createTicket, listTicket, getTicket, resolveTicket }