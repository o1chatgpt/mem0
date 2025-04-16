-- Create extension for vector operations if not exists
CREATE EXTENSION IF NOT EXISTS vector;

-- Vector embeddings table
CREATE TABLE IF NOT EXISTS vector_embeddings (
  id TEXT PRIMARY KEY,
  vector VECTOR(1536), -- Adjust dimension based on your embedding model
  metadata JSONB DEFAULT '{}',
  text TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_vector_embeddings_vector ON vector_embeddings USING ivfflat (vector vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_vector_embeddings_user_id ON vector_embeddings(user_id);

-- Function to search vector embeddings by similarity
CREATE OR REPLACE FUNCTION search_vector_embeddings(
  query_vector VECTOR(1536),
  user_id TEXT,
  similarity_threshold FLOAT DEFAULT 0.7,
  match_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  id TEXT,
  vector VECTOR(1536),
  metadata JSONB,
  text TEXT,
  user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ve.id,
    ve.vector,
    ve.metadata,
    ve.text,
    ve.user_id,
    ve.created_at,
    1 - (ve.vector <=> query_vector) AS similarity
  FROM vector_embeddings ve
  WHERE ve.user_id = user_id
  AND 1 - (ve.vector <=> query_vector) >= similarity_threshold
  ORDER BY similarity DESC
  LIMIT match_limit;
END;
$$ LANGUAGE plpgsql;
