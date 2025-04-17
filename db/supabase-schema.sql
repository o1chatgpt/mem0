-- Enable the necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- Role definitions
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'viewer', 'ai_assistant');

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  email TEXT UNIQUE,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Family Members table
CREATE TABLE IF NOT EXISTS ai_family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  personality TEXT NOT NULL,
  avatar_url TEXT,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Memories table
CREATE TABLE IF NOT EXISTS ai_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ai_family_member_id UUID REFERENCES ai_family_members(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Files table with role-based access
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  type TEXT NOT NULL,
  size BIGINT NOT NULL,
  content TEXT,
  url TEXT,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_favorite BOOLEAN DEFAULT FALSE,
  access_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(owner_id, path, name)
);

-- File permissions table for role-based access
CREATE TABLE IF NOT EXISTS file_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ai_family_member_id UUID REFERENCES ai_family_members(id) ON DELETE CASCADE,
  permission_level TEXT NOT NULL CHECK (permission_level IN ('read', 'write', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(file_id, user_id),
  UNIQUE(file_id, ai_family_member_id),
  CHECK (
    (user_id IS NOT NULL AND ai_family_member_id IS NULL) OR
    (user_id IS NULL AND ai_family_member_id IS NOT NULL)
  )
);

-- Vector embeddings for semantic search
CREATE TABLE IF NOT EXISTS vector_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  embedding VECTOR(1536) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ai_family_member_id UUID REFERENCES ai_family_members(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (
    (user_id IS NOT NULL AND ai_family_member_id IS NULL) OR
    (user_id IS NULL AND ai_family_member_id IS NOT NULL)
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_files_owner_id ON files(owner_id);
CREATE INDEX IF NOT EXISTS idx_files_path ON files(path);
CREATE INDEX IF NOT EXISTS idx_ai_memories_ai_family_member_id ON ai_memories(ai_family_member_id);
CREATE INDEX IF NOT EXISTS idx_file_permissions_file_id ON file_permissions(file_id);
CREATE INDEX IF NOT EXISTS idx_file_permissions_user_id ON file_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_file_permissions_ai_family_member_id ON file_permissions(ai_family_member_id);

-- Create vector index for semantic search
CREATE INDEX IF NOT EXISTS idx_ai_memories_embedding ON ai_memories USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_vector_embeddings_embedding ON vector_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Function to search for similar vectors
CREATE OR REPLACE FUNCTION search_similar_vectors(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT,
  filter_user_id UUID DEFAULT NULL,
  filter_ai_family_member_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ve.id,
    ve.content,
    ve.metadata,
    1 - (ve.embedding <=> query_embedding) AS similarity
  FROM
    vector_embeddings ve
  WHERE
    (filter_user_id IS NULL OR ve.user_id = filter_user_id) AND
    (filter_ai_family_member_id IS NULL OR ve.ai_family_member_id = filter_ai_family_member_id) AND
    1 - (ve.embedding <=> query_embedding) > match_threshold
  ORDER BY
    similarity DESC
  LIMIT
    match_count;
END;
$$;

-- Function to search for similar AI memories
CREATE OR REPLACE FUNCTION search_ai_memories(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT,
  filter_ai_family_member_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  ai_family_member_id UUID,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    am.id,
    am.content,
    am.metadata,
    am.ai_family_member_id,
    1 - (am.embedding <=> query_embedding) AS similarity
  FROM
    ai_memories am
  WHERE
    (filter_ai_family_member_id IS NULL OR am.ai_family_member_id = filter_ai_family_member_id) AND
    1 - (am.embedding <=> query_embedding) > match_threshold
  ORDER BY
    similarity DESC
  LIMIT
    match_count;
END;
$$;

-- RLS (Row Level Security) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vector_embeddings ENABLE ROW LEVEL SECURITY;

-- Users can see their own data and admins can see all
CREATE POLICY users_policy ON users
  USING (role = 'admin' OR id = auth.uid());

-- AI family members can be seen by their creator and admins
CREATE POLICY ai_family_members_policy ON ai_family_members
  USING (role = 'admin' OR created_by = auth.uid());

-- AI memories can be seen by the creator of the AI family member and admins
CREATE POLICY ai_memories_policy ON ai_memories
  USING (
    role = 'admin' OR 
    EXISTS (
      SELECT 1 FROM ai_family_members afm 
      WHERE afm.id = ai_family_member_id AND afm.created_by = auth.uid()
    )
  );

-- Files can be seen by their owner and users with permissions
CREATE POLICY files_policy ON files
  USING (
    role = 'admin' OR 
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM file_permissions fp 
      WHERE fp.file_id = id AND fp.user_id = auth.uid()
    )
  );

-- File permissions can be managed by file owners and admins
CREATE POLICY file_permissions_policy ON file_permissions
  USING (
    role = 'admin' OR 
    EXISTS (
      SELECT 1 FROM files f 
      WHERE f.id = file_id AND f.owner_id = auth.uid()
    )
  );

-- Vector embeddings can be seen by their creator and admins
CREATE POLICY vector_embeddings_policy ON vector_embeddings
  USING (
    role = 'admin' OR 
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM ai_family_members afm 
      WHERE afm.id = ai_family_member_id AND afm.created_by = auth.uid()
    )
  );
