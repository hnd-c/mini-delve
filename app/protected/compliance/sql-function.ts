export const CHECK_RLS_STATUS_SQL = `
CREATE OR REPLACE FUNCTION check_rls_status()
RETURNS TABLE (
    table_name text,
    has_rls boolean
)
LANGUAGE sql
AS $$
  SELECT 
      c.relname as table_name,
      c.relrowsecurity as has_rls
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
  AND c.relkind = 'r';
$$;`;

export const CHECK_PITR_STATUS_SQL = `
CREATE OR REPLACE FUNCTION check_pitr_status()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
BEGIN
    SELECT json_build_object(
        'enabled', COALESCE(
            (SELECT setting::bool 
             FROM pg_settings 
             WHERE name = 'archive_mode'), 
            false
        ),
        'wal_level', (
            SELECT setting 
            FROM pg_settings 
            WHERE name = 'wal_level'
        ),
        'archive_command', (
            SELECT setting 
            FROM pg_settings 
            WHERE name = 'archive_command'
        )
    ) INTO result;
    
    RETURN result;
END;
$$;`;