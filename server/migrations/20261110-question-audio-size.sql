ALTER TABLE question_audio
    DROP CONSTRAINT IF EXISTS question_audio_audio_check,
    ADD CONSTRAINT question_audio_audio_check CHECK (octet_length(audio) BETWEEN 1 AND 300000);
