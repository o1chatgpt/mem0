CREATE OR REPLACE FUNCTION ensure_uuid_extension()
RETURNS void AS $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
END;
$$ LANGUAGE plpgsql;
