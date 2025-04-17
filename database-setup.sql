-- Create AI family members table
CREATE TABLE IF NOT EXISTS ai_family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  avatar_url TEXT,
  personality TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  memory_id VARCHAR(255)
);

-- Create files table
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  path TEXT NOT NULL,
  size BIGINT NOT NULL,
  type VARCHAR(100) NOT NULL,
  extension VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id VARCHAR(255) NOT NULL,
  parent_folder_id UUID REFERENCES files(id) ON DELETE CASCADE,
  is_folder BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  metadata JSONB
);

-- Create file tags table
CREATE TABLE IF NOT EXISTS file_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  color VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id VARCHAR(255) NOT NULL
);

-- Create file_tag_relations junction table
CREATE TABLE IF NOT EXISTS file_tag_relations (
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES file_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (file_id, tag_id)
);

-- Create file shares table
CREATE TABLE IF NOT EXISTS file_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  share_token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL,
  is_password_protected BOOLEAN DEFAULT FALSE,
  password_hash VARCHAR(255),
  access_count INTEGER DEFAULT 0
);

-- Create file memories table to store AI memories about files
CREATE TABLE IF NOT EXISTS file_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  memory_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  memory_type VARCHAR(100),
  relevance_score FLOAT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_parent_folder_id ON files(parent_folder_id);
CREATE INDEX IF NOT EXISTS idx_file_tags_user_id ON file_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_file_memories_file_id ON file_memories(file_id);

-- Insert some default tags
INSERT INTO file_tags (name, color, user_id)
VALUES 
  ('Important', 'red', 'default_user'),
  ('Work', 'blue', 'default_user'),
  ('Personal', 'green', 'default_user'),
  ('Archive', 'gray', 'default_user')
ON CONFLICT DO NOTHING;

-- Insert some default AI family members
INSERT INTO ai_family_members (name, description, avatar_url, personality, user_id)
VALUES 
  ('Lyra', 'Creative file organization assistant', '/avatars/lyra.png', 'Lyra is enthusiastic and creative, specializing in organizing files for creative projects.', 'default_user'),
  ('Cecilia', 'Document management specialist', '/avatars/cecilia.png', 'Cecilia is methodical and precise, focusing on efficient document categorization and retrieval.', 'default_user')
ON CONFLICT DO NOTHING;
