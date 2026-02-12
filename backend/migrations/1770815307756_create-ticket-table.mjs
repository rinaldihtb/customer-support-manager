/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    pgm.createType("ticket_status", ['OPEN', 'CLOSED'])
    pgm.createType("ticket_urgency", ['HIGH', 'MEDIUM', 'LOW'])
    pgm.createType("ticket_category", ['BILLING', 'TECHNICAL', 'FEATURE_REQUEST'])
    pgm.createTable('tickets', {
        id: 'id',
        subject: { type: "varchar", notNull: true },
        customer_name: { type: "varchar", notNull: true },
        customer_email: { type: "varchar", notNull: false },
        status: { type: "ticket_status", notNull: true, default: "OPEN" },
        category: { type: "ticket_category", notNull: false },
        urgency_level: { type: "ticket_urgency", notNull: true, default: "LOW" },
        sentiment_score: { type: "int", notNull: true, default: 1 },
        description: { type: "text", notNull: true, default: "" },
        created_at: { type: "timestamp", default: pgm.func('CURRENT_TIMESTAMP') },
        updated_at: { type: "timestamp", default: pgm.func('CURRENT_TIMESTAMP') },
        completed_at: { type: "timestamp", default: null },
    })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable("tickets")
    pgm.dropType("ticket_status");
    pgm.dropType("ticket_urgency");
    pgm.dropType("ticket_category");
};
