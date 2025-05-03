-- Create extension for full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Files table
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  path VARCHAR(1024) NOT NULL,
  type VARCHAR(50) NOT NULL,
  size BIGINT NOT NULL DEFAULT 0,
  content TEXT,
  url VARCHAR(1024),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  favorite BOOLEAN NOT NULL DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  access_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, path, name)
);

-- Create index for file search
CREATE INDEX IF NOT EXISTS idx_files_path ON files(path);
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_favorite ON files(user_id, favorite);
CREATE INDEX IF NOT EXISTS idx_files_type ON files(user_id, type);

-- Memories table
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for full-text search on memories
CREATE INDEX IF NOT EXISTS idx_memories_content_trgm ON memories USING GIN (content gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);

-- Function to increment file access count
CREATE OR REPLACE FUNCTION increment_file_access(file_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE files
  SET access_count = access_count + 1,
      updated_at = NOW()
  WHERE id = file_id;
END;
$$ LANGUAGE plpgsql;

-- Search function for memories
CREATE OR REPLACE FUNCTION search_memories(search_query TEXT, user_uuid UUID, result_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.content,
    m.metadata,
    m.created_at,
    similarity(m.content, search_query) AS similarity
  FROM memories m
  WHERE m.user_id = user_uuid
  ORDER BY similarity DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;
