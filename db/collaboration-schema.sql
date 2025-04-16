-- Create collaboration_sessions table
CREATE TABLE IF NOT EXISTS collaboration_sessions (
  id UUID PRIMARY KEY,
  file_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  active_users JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create collaboration_operations table
CREATE TABLE IF NOT EXISTS collaboration_operations (
  id UUID PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES collaboration_sessions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  operation_type TEXT NOT NULL,
  operation_data JSONB NOT NULL,
  
  -- Add index for faster queries
  CONSTRAINT valid_operation_type CHECK (operation_type IN ('insert', 'delete', 'cursor', 'selection'))
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_file_id ON collaboration_sessions(file_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_operations_session_id ON collaboration_operations(session_id);

-- Add RLS policies
ALTER TABLE collaboration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_operations ENABLE ROW LEVEL SECURITY;

-- Create policies for collaboration_sessions
CREATE POLICY "Allow read access to all authenticated users"
  ON collaboration_sessions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow insert access to all authenticated users"
  ON collaboration_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update access to all authenticated users"
  ON collaboration_sessions
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create policies for collaboration_operations
CREATE POLICY "Allow read access to all authenticated users"
  ON collaboration_operations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow insert access to all authenticated users"
  ON collaboration_operations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
