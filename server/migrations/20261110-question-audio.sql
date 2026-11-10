CREATE TABLE IF NOT EXISTS question_audio (
    hash TEXT PRIMARY KEY,
    audio BYTEA NOT NULL CHECK (octet_length(audio) BETWEEN 1 AND 100000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
