-- Function to create memories table
CREATE OR REPLACE FUNCTION create_memories_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Function to create memory categories table
CREATE OR REPLACE FUNCTION create_memory_categories_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS memory_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Add foreign key to memories table
  ALTER TABLE memories 
  ADD CONSTRAINT fk_category 
  FOREIGN KEY (category_id) 
  REFERENCES memory_categories(id) 
  ON DELETE SET NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to create file_memories junction table
CREATE OR REPLACE FUNCTION create_file_memories_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS file_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id TEXT NOT NULL,
    memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(file_id, memory_id)
  );
END;
$$ LANGUAGE plpgsql;
