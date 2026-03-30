-- Create tables for the consumer to store data
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY,
    topic VARCHAR(255) NOT NULL,
    partition INT NOT NULL,
    offset BIGINT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(topic, partition, offset)
);

CREATE TABLE IF NOT EXISTS support_tickets (
    ticket_id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    current_page VARCHAR(500) NOT NULL,
    previous_page VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    current_error TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
