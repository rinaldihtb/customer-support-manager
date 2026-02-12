const ticketService = require('../services/ticket.service')

const createTicket = async (req, res, next) => {
    try {
        // Generate
        const result = await ticketService.createTicket(req.body)
        res.status(201).send(result)

        next();
    } catch (error) {
        res.status(400).json({ status: 304, message: error.message })
    }
}

const listTicket = async (req, res, next) => {
    let params = {
        pagination: { page: req.query.page || 1, limit: req.query.limit || 10 },
    }
    const result = await ticketService.listTicket(params)

    res.status(200).send(result)
    next();
}

const getTicket = async (req, res, next) => {
    const { id } = req.params
    const result = await ticketService.getTicket(id)
    console.log(result)

    res.status(200).send(result)
    next();
}

const resolveTicket = async (req, res, next) => {
    const { id } = req.params
    const result = await ticketService.resolveTicket(id)

    res.status(201).send(result)
    next();
}

module.exports = { createTicket, listTicket, getTicket, resolveTicket }