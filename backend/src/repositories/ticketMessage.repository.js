const db = require('../config/db');

const createTicketMessage = async (data) => {
    console.log(data)
    const query = `
        INSERT INTO ticket_messages (ticket_id, user_type, status, message) 
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;

    const { rows } = await db.query(query, [data.ticket_id, "AGENT", "DRAFT", data.message]);
    return rows[0] || null;
}

const getTicketMessages = async (filter = { ticketId: null }) => {
    let query = "SELECT * from ticket_messages"
    if (filter.ticketId) {
        query += ` WHERE ticket_id = ${parseInt(filter.ticketId)}`
    }

    const { rows } = await db.query(query);
    return rows || [];
}

const updateMessage = async (id, data) => {
    const query = `
        UPDATE ticket_messages SET message = $1, updated_at = $2
        WHERE id = $3
        RETURNING *
    `;

    const { rows } = await db.query(query, [data.message, new Date(), id]);
    return rows[0];
}

const publishMessage = async (id) => {
    const query = `
        UPDATE ticket_messages SET status = $1, updated_at = $2
        WHERE id = $3
        RETURNING *
    `;

    const { rows } = await db.query(query, ["PUBLISHED", new Date(), id]);
    return rows[0];
}

const getTicketMessage = async (id) => {
    const query = "SELECT * from ticket_messages WHERE id = $1"
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
}

module.exports = { createTicketMessage, getTicketMessages, updateMessage, getTicketMessage, publishMessage }