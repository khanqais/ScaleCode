-- ScaleCode Database Setup Instructions
-- Copy and run these commands in your Supabase SQL Editor

-- 1. First, run the database schema from database_schema.sql if you haven't already

-- 2. Then run these additional helpful functions and views

-- Function to update problem counts in folders
CREATE OR REPLACE FUNCTION update_folder_problem_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the folder's problem count when a problem is inserted/deleted
    IF TG_OP = 'INSERT' THEN
        -- Don't need to do anything as we use COUNT in queries
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Don't need to do anything as we use COUNT in queries
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a view for folder statistics
CREATE OR REPLACE VIEW folder_stats AS
SELECT 
    f.id,
    f.name,
    f.description,
    f.color,
    f.user_id,
    COUNT(p.id) as problem_count,
    AVG(p.difficulty) as avg_difficulty,
    MAX(p.created_at) as last_problem_added
FROM folders f
LEFT JOIN problems p ON f.id = p.folder_id
GROUP BY f.id, f.name, f.description, f.color, f.user_id;

-- Create a view for user statistics
CREATE OR REPLACE VIEW detailed_user_stats AS
SELECT 
    u.id as user_id,
    u.clerk_id,
    COUNT(DISTINCT f.id) as total_folders,
    COUNT(DISTINCT p.id) as total_problems,
    COUNT(DISTINCT ra.id) as total_attempts,
    AVG(p.difficulty) as avg_problem_difficulty,
    AVG(ra.score) as avg_revision_score,
    COUNT(DISTINCT DATE(ra.created_at)) as revision_days,
    MAX(ra.created_at) as last_revision
FROM users u
LEFT JOIN folders f ON u.id = f.user_id
LEFT JOIN problems p ON u.id = p.user_id  
LEFT JOIN revision_attempts ra ON u.id = ra.user_id
GROUP BY u.id, u.clerk_id;

-- Create indexes for better performance on common queries
CREATE INDEX IF NOT EXISTS idx_problems_difficulty_desc ON problems(difficulty DESC);
CREATE INDEX IF NOT EXISTS idx_revision_attempts_score ON revision_attempts(score);
CREATE INDEX IF NOT EXISTS idx_revision_attempts_created_at ON revision_attempts(created_at DESC);

-- Sample data (optional - remove if you don't want sample data)
-- This will only work after you've signed in at least once with Clerk

/*
-- Example: Insert sample folders for the first user (uncomment and modify user_id)
INSERT INTO folders (user_id, name, description, color) VALUES
(
    (SELECT id FROM users LIMIT 1),
    'Graph Algorithms',
    'Problems involving graph traversal, shortest paths, and graph theory',
    '#3B82F6'
),
(
    (SELECT id FROM users LIMIT 1),
    'Two Pointer Technique', 
    'Array and string problems using two pointer approach',
    '#10B981'
),
(
    (SELECT id FROM users LIMIT 1),
    'Dynamic Programming',
    'Problems that can be solved using dynamic programming principles',
    '#8B5CF6'
),
(
    (SELECT id FROM users LIMIT 1),
    'Binary Search',
    'Search algorithm problems and variations',
    '#F59E0B'
);
*/

-- Grant necessary permissions (if needed)
GRANT SELECT ON folder_stats TO authenticated;
GRANT SELECT ON detailed_user_stats TO authenticated;