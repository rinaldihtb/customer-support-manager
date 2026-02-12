const db = require('../config/db');

const createTicket = async (data) => {
    const query = `
        INSERT INTO tickets (subject, customer_name, customer_email, description, status) 
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;

    const { rows } = await db.query(query, [data.subject, data.customer_name, data.customer_email, data.description, "OPEN"]);
    return rows[0] || null;
}

const updateTicket = async (data) => {
    const query = `
        UPDATE tickets SET category = $1, urgency_level = $2, sentiment_score = $3, updated_at = $4
        WHERE id = $5
        RETURNING *
    `;

    const { rows } = await db.query(query, [data.category, data.urgency_level, data.sentiment_score, new Date(), data.id]);
    return rows[0];
}

const resolveTicket = async (data) => {
    const query = `
        UPDATE tickets SET status = $1, completed_at = $2, updated_at = $3 
        RETURNING *
    `;

    const { rows } = await db.query(query, ["CLOSED", new Date(), new Date()]);
    return rows[0];
}

const countTickets = async (config = { filters: {} }) => {
    let query = "SELECT * from tickets "
    const { rowCount } = await db.query(query);
    return rowCount || [];
}

const getTickets = async (config = { filters: {}, sorts: {}, pagination: { limit: 5, page: 1 } }) => {
    const { page, limit } = config.pagination;
    const sorts = config.sorts;
    let query = "SELECT * from tickets "
    if (sorts.created_at) {
        query += ` ORDER BY created_at ${sorts.created_at} `
    }
    if (config.pagination) {
        query += ` LIMIT $1 OFFSET $2`
    }
    const { rows } = await db.query(query, [limit, limit * (page - 1)]);
    return rows || [];
}

const getTicket = async (id) => {
    const query = "SELECT * from tickets WHERE id = $1"
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
}

module.exports = { getTickets, createTicket, updateTicket, getTicket, resolveTicket, countTickets }