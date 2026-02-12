const ticketMessageService = require('../services/ticket-message.service')


const createTicketMessage = async (req, res, next) => {
    try {

        // Generate
        const result = await ticketMessageService.createTicketMessage(req.body)
        res.status(201).send(result)

        next();
    } catch (error) {
        res.status(400).json({ status: 304, message: error.message })
    }
}

const updateMessage = async (req, res, next) => {
    try {
        // Generate
        const { id } = req.params;
        const result = await ticketMessageService.updateMessage(id, req.body)
        res.status(201).send(result)

        next();
    } catch (error) {
        res.status(400).json({ status: 304, message: error.message })
    }
}

const publishMessage = async (req, res, next) => {
    try {
        // Generate
        const { id } = req.params;
        const result = await ticketMessageService.publishMessage(id)
        res.status(201).send(result)

        next();
    } catch (error) {
        res.status(400).json({ status: 304, message: error.message })
    }
}

module.exports = { updateMessage, createTicketMessage, publishMessage }