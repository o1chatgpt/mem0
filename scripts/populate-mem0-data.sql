-- Populate mem0 data for testing
-- Assumes user ID 1 exists and categories have been created

-- Set variables
DO $$
DECLARE
  user_id INTEGER := 1;
  ai_member_id_1 INTEGER := 1;
  ai_member_id_2 INTEGER := 2;
  ai_member_id_3 INTEGER := 3;
BEGIN

-- Update category prompt templates
UPDATE fm_memory_categories
SET prompt_template = 'You are a file management expert assistant with memory capabilities.
Focus on helping the user with file organization, uploads, downloads, and management tasks.
When responding to queries about files and folders, prioritize efficiency, organization, and best practices.
Suggest file naming conventions, folder structures, and organization tips when relevant.
Remember the user''s preferences for file organization and apply them consistently.'
WHERE name = 'File Operations' AND user_id = user_id;

UPDATE fm_memory_categories
SET prompt_template = 'You are a technical assistant with memory capabilities.
Focus on providing precise, technically accurate information and solutions.
When responding to technical queries, prioritize accuracy, clarity, and educational value.
Include relevant code examples, technical explanations, and troubleshooting steps when appropriate.
Remember the user''s technical environment and adapt your responses accordingly.'
WHERE name = 'Technical' AND user_id = user_id;

UPDATE fm_memory_categories
SET prompt_template = 'You are a priority-focused assistant with memory capabilities.
Focus on high-priority information and tasks that the user has marked as important.
When responding, emphasize urgency, accuracy, and thoroughness for critical matters.
Be particularly attentive to deadlines, critical requirements, and essential details.
Proactively remind the user of important deadlines and requirements they''ve mentioned before.'
WHERE name = 'Important' AND user_id = user_id;

-- Add File Operations memories
INSERT INTO fm_memories (content, user_id, ai_member_id, category, created_at)
VALUES
  ('User prefers organizing files by project name rather than date.', user_id, ai_member_id_1, 'File Operations', NOW() - INTERVAL '2 days'),
  ('User typically works with PDF and DOCX files for their research papers.', user_id, ai_member_id_1, 'File Operations', NOW() - INTERVAL '5 days'),
  ('User asked how to batch rename files with sequential numbering.', user_id, ai_member_id_1, 'File Operations', NOW() - INTERVAL '7 days'),
  ('User mentioned having trouble finding files after uploading them.', user_id, ai_member_id_1, 'File Operations', NOW() - INTERVAL '10 days'),
  ('User prefers the list view over grid view for file browsing.', user_id, ai_member_id_1, 'File Operations', NOW() - INTERVAL '12 days'),
  ('User frequently searches for files containing ''quarterly report'' in the filename.', user_id, ai_member_id_1, 'File Operations', NOW() - INTERVAL '15 days'),
  ('User wants to automatically organize screenshots into a dedicated folder.', user_id, ai_member_id_1, 'File Operations', NOW() - INTERVAL '18 days'),
  ('User asked about the maximum file size limit for uploads.', user_id, ai_member_id_1, 'File Operations', NOW() - INTERVAL '20 days'),
  ('User mentioned they need to share large video files with their team.', user_id, ai_member_id_1, 'File Operations', NOW() - INTERVAL '22 days'),
  ('User prefers to sort files by most recently modified.', user_id, ai_member_id_1, 'File Operations', NOW() - INTERVAL '25 days');

-- Add Preferences memories
INSERT INTO fm_memories (content, user_id, ai_member_id, category, created_at)
VALUES
  ('User prefers dark mode for the interface.', user_id, ai_member_id_2, 'Preferences', NOW() - INTERVAL '1 days'),
  ('User wants notifications when file uploads complete.', user_id, ai_member_id_2, 'Preferences', NOW() - INTERVAL '3 days'),
  ('User prefers to see file sizes in MB rather than KB.', user_id, ai_member_id_2, 'Preferences', NOW() - INTERVAL '6 days'),
  ('User asked how to change the default sort order for files.', user_id, ai_member_id_2, 'Preferences', NOW() - INTERVAL '9 days'),
  ('User wants to hide file extensions for common file types.', user_id, ai_member_id_2, 'Preferences', NOW() - INTERVAL '11 days'),
  ('User prefers to open PDF files in a new tab rather than downloading them.', user_id, ai_member_id_2, 'Preferences', NOW() - INTERVAL '14 days'),
  ('User asked about keyboard shortcuts for common actions.', user_id, ai_member_id_2, 'Preferences', NOW() - INTERVAL '17 days'),
  ('User wants to customize the columns shown in the file list.', user_id, ai_member_id_2, 'Preferences', NOW() - INTERVAL '19 days'),
  ('User prefers to use grid view with medium-sized thumbnails.', user_id, ai_member_id_2, 'Preferences', NOW() - INTERVAL '21 days'),
  ('User wants to set Google Drive as their default storage location.', user_id, ai_member_id_2, 'Preferences', NOW() - INTERVAL '24 days');

-- Add Technical memories
INSERT INTO fm_memories (content, user_id, ai_member_id, category, created_at)
VALUES
  ('User asked about the API rate limits for file operations.', user_id, ai_member_id_3, 'Technical', NOW() - INTERVAL '2 days'),
  ('User wanted to know if the system supports WebDAV protocol.', user_id, ai_member_id_3, 'Technical', NOW() - INTERVAL '4 days'),
  ('User asked about implementing custom metadata fields for their files.', user_id, ai_member_id_3, 'Technical', NOW() - INTERVAL '7 days'),
  ('User inquired about the encryption method used for stored files.', user_id, ai_member_id_3, 'Technical', NOW() - INTERVAL '10 days'),
  ('User asked how to use the batch processing API for file conversions.', user_id, ai_member_id_3, 'Technical', NOW() - INTERVAL '13 days'),
  ('User needed help with the JavaScript SDK for programmatic uploads.', user_id, ai_member_id_3, 'Technical', NOW() - INTERVAL '16 days'),
  ('User asked about webhook integration for file change notifications.', user_id, ai_member_id_3, 'Technical', NOW() - INTERVAL '18 days'),
  ('User wanted to know if the system supports delta sync for large files.', user_id, ai_member_id_3, 'Technical', NOW() - INTERVAL '21 days'),
  ('User inquired about CORS settings for cross-domain file access.', user_id, ai_member_id_3, 'Technical', NOW() - INTERVAL '23 days'),
  ('User asked about implementing custom authentication for shared links.', user_id, ai_member_id_3, 'Technical', NOW() - INTERVAL '26 days');

-- Add Important memories
INSERT INTO fm_memories (content, user_id, category, created_at)
VALUES
  ('User has a critical presentation due on October 15th that requires access to the design files.', user_id, 'Important', NOW() - INTERVAL '1 days'),
  ('User needs to ensure all financial documents are backed up by the end of each quarter.', user_id, 'Important', NOW() - INTERVAL '4 days'),
  ('User mentioned their team''s security audit requires all shared files to be password protected.', user_id, 'Important', NOW() - INTERVAL '8 days'),
  ('User has a 50GB storage limit that they''re approaching and needs to be notified at 45GB.', user_id, 'Important', NOW() - INTERVAL '11 days'),
  ('User must maintain version history for all contract documents for at least 3 years.', user_id, 'Important', NOW() - INTERVAL '14 days'),
  ('User''s company policy requires all shared links to expire after 30 days maximum.', user_id, 'Important', NOW() - INTERVAL '17 days'),
  ('User needs to ensure all files containing ''CONFIDENTIAL'' in the name are only shared internally.', user_id, 'Important', NOW() - INTERVAL '20 days'),
  ('User requires that all deleted files be recoverable for at least 60 days.', user_id, 'Important', NOW() - INTERVAL '22 days'),
  ('User mentioned their regulatory compliance requires all file access to be logged and auditable.', user_id, 'Important', NOW() - INTERVAL '25 days'),
  ('User needs to ensure automatic backup of the ''Projects'' folder every Friday at 5pm.', user_id, 'Important', NOW() - INTERVAL '28 days');

-- Add Conversations memories
INSERT INTO fm_memories (content, user_id, category, created_at)
VALUES
  ('User mentioned they''re working on a new marketing campaign for Q4.', user_id, 'Conversations', NOW() - INTERVAL '1 days'),
  ('User said they''re collaborating with the design team on the new product launch.', user_id, 'Conversations', NOW() - INTERVAL '3 days'),
  ('User talked about their frustration with the previous file organization system.', user_id, 'Conversations', NOW() - INTERVAL '6 days'),
  ('User mentioned they recently switched from Dropbox to our platform.', user_id, 'Conversations', NOW() - INTERVAL '9 days'),
  ('User said they have a team of 12 people who need access to the shared workspace.', user_id, 'Conversations', NOW() - INTERVAL '12 days'),
  ('User talked about their upcoming presentation to the executive board.', user_id, 'Conversations', NOW() - INTERVAL '15 days'),
  ('User mentioned they''re working remotely from Europe for the next month.', user_id, 'Conversations', NOW() - INTERVAL '18 days'),
  ('User said they appreciate the quick responses to their support questions.', user_id, 'Conversations', NOW() - INTERVAL '21 days'),
  ('User talked about their need to improve workflow efficiency in document processing.', user_id, 'Conversations', NOW() - INTERVAL '24 days'),
  ('User mentioned they''re in the healthcare industry and have specific compliance requirements.', user_id, 'Conversations', NOW() - INTERVAL '27 days');

-- Add uncategorized memories
INSERT INTO fm_memories (content, user_id, created_at)
VALUES
  ('User asked about the best way to organize their project files.', user_id, NOW() - INTERVAL '2 days'),
  ('User mentioned they need to share access with a new team member.', user_id, NOW() - INTERVAL '5 days'),
  ('User inquired about recovering a deleted file from last week.', user_id, NOW() - INTERVAL '8 days'),
  ('User asked if there''s a mobile app available for accessing files on the go.', user_id, NOW() - INTERVAL '11 days'),
  ('User wanted to know how to generate a shareable link for a folder.', user_id, NOW() - INTERVAL '14 days');

END $$;
