-- Add password column to distributors and agents tables
ALTER TABLE distributors ADD COLUMN password VARCHAR(255) AFTER email;
ALTER TABLE agents ADD COLUMN password VARCHAR(255) AFTER email;
