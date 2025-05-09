CREATE OR REPLACE FUNCTION get_server_version()
RETURNS text AS $$
BEGIN
  RETURN current_setting('server_version');
END;
$$ LANGUAGE plpgsql;
