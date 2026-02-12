const { Worker } = require('worker_threads')
const path = require('path')
const logger = require('../config/logger')
const ticketMessageRepository = require('../repositories/ticketMessage.repository')
const _ = require('lodash')


const createTicketMessage = async (data) => {
    try {
        const { user_type, message, ticket_id } = data
        // if (!user_type) {
        //     throw new Error("Name can't be empty")
        // }
        if (!ticket_id) {
            throw new Error("Name can't be empty")
        }
        if (!message) {
            throw new Error("description can't be empty")
        }

        const ticket = await ticketMessageRepository.createTicketMessage(data)

        return ticket
    } catch (error) {
        logger.error('Failed to create ticket', error)
        throw new Error(error)
    }
}

const updateMessage = async (id, data) => {
    try {
        if (!ticketMessageRepository.getTicketMessage(id)) {
            throw new Error('Invalid Id')
        }
        // Update ticket
        return await ticketMessageRepository.updateMessage(id, data)
    } catch (error) {
        logger.error('Failed to update the ticket message', error)
    }
}

const publishMessage = async (id) => {
    try {
        if (!ticketMessageRepository.getTicketMessage(id)) {
            throw new Error('Invalid Id')
        }
        // Update ticket
        return await ticketMessageRepository.publishMessage(id)
    } catch (error) {
        logger.error('Failed to update the ticket message', error)
    }
}

module.exports = { updateMessage, publishMessage, createTicketMessage }