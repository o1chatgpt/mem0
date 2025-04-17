-- Create collaboration_sessions table
CREATE TABLE IF NOT EXISTS collaboration_sessions (
  id UUID PRIMARY KEY,
  file_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active_users JSONB DEFAULT '[]'::JSONB,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create collaboration_operations table
CREATE TABLE IF NOT EXISTS collaboration_operations (
  id UUID PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES collaboration_sessions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  operation_type TEXT NOT NULL,
  operation_data JSONB NOT NULL,
  
  -- Add index for faster queries
  CONSTRAINT valid_operation_type CHECK (operation_type IN ('insert', 'delete'))
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_file_id ON collaboration_sessions(file_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_is_active ON collaboration_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_collaboration_operations_session_id ON collaboration_operations(session_id);
