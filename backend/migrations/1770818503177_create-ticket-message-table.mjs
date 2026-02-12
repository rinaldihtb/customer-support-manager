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
    pgm.createType("message_status", ['DRAFT', 'PUBLISHED'])
    pgm.createType("user_type", ['CUSTOMER', 'AGENT'])
    pgm.createTable('ticket_messages', {
        id: 'id',
        ticket_id: { type: 'int', notNull: true },
        user_type: { type: 'user_type', notNull: true },
        status: { type: 'message_status', notNull: true, default: 'DRAFT' },
        message: { type: 'text', notNull: true },
        created_at: { type: "timestamp", default: pgm.func('CURRENT_TIMESTAMP') },
        updated_at: { type: "timestamp", default: pgm.func('CURRENT_TIMESTAMP') },
    })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable('ticket_messages')
    pgm.dropType('message_status')
    pgm.dropType('user_type')
};
