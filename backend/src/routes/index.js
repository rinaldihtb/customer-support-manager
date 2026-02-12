const express = require('express');
const router = express.Router();
const { createTicket, listTicket, getTicket, resolveTicket } = require('../controllers/ticket.controller');
const { updateMessage, publishMessage, createTicketMessage } = require('../controllers/ticket-message.controller');



router.post('/ticket', createTicket)
router.get('/ticket', listTicket)
router.get('/ticket/:id', getTicket)
router.patch('/ticket/:id/resolve', resolveTicket)
router.patch('/ticket-message/:id', updateMessage)
router.post('/ticket-message/:id', createTicketMessage)
router.patch('/ticket-message/:id/publish', publishMessage)
router.get('/health', (req, res, next) => {
    res.json({ status: 200, message: "Success" })
})
router.get('/', (req, res) => {
    res.send("Invalid")
})

module.exports = router