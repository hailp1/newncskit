-- ============================================================================
-- Blog Permissions Enhancement
-- Created: 2024-01-08
-- Description: Enhanced blog post permissions for admin/moderator roles
-- This migration can run independently and creates all necessary dependencies
-- ============================================================================

-- ============================================================================
-- PART 0: CREATE REQUIRED TABLES IF NOT EXISTS
-- ============================================================================

-- Ensure profiles table exists with role column
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add role column if profiles exists but doesn't have role
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'role') THEN
      ALTER TABLE profiles ADD COLUMN role VARCHAR(20) DEFAULT 'user' 
        CHECK (role IN ('user', 'admin', 'moderator'));
    END IF;
  END IF;
END $$;

-- Table: posts (create if not exists)
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  excerpt TEXT,
  content TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  category VARCHAR(100),
  tags JSONB DEFAULT '[]',
  featured_image VARCHAR(255),
  meta_description TEXT,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes if not exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_posts_author') THEN
    CREATE INDEX idx_posts_author ON posts(author_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_posts_status') THEN
    CREATE INDEX idx_posts_status ON posts(status);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_posts_slug') THEN
    CREATE INDEX idx_posts_slug ON posts(slug);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_posts_published') THEN
    CREATE INDEX idx_posts_published ON posts(published_at DESC);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 1: POST PERMISSIONS TABLE
-- ============================================================================

-- Table: post_permissions
CREATE TABLE IF NOT EXISTS post_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  permission_type VARCHAR(50) NOT NULL CHECK (
    permission_type IN ('view', 'edit', 'delete', 'publish', 'moderate')
  ),
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  UNIQUE(post_id, user_id, permission_type)
);

CREATE INDEX idx_post_permissions_post ON post_permissions(post_id);
CREATE INDEX idx_post_permissions_user ON post_permissions(user_id);
CREATE INDEX idx_post_permissions_type ON post_permissions(permission_type);
CREATE INDEX idx_post_permissions_expires ON post_permissions(expires_at);

-- ============================================================================
-- PART 2: POST ACTIVITY LOG
-- ============================================================================

-- Table: post_activity_log
CREATE TABLE IF NOT EXISTS post_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL CHECK (
    action IN ('created', 'updated', 'deleted', 'published', 'unpublished', 
               'scheduled', 'archived', 'status_changed', 'permission_granted', 
               'permission_revoked', 'viewed')
  ),
  old_status VARCHAR(20),
  new_status VARCHAR(20),
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_post_activity_log_post ON post_activity_log(post_id);
CREATE INDEX idx_post_activity_log_user ON post_activity_log(user_id);
CREATE INDEX idx_post_activity_log_action ON post_activity_log(action);
CREATE INDEX idx_post_activity_log_created ON post_activity_log(created_at DESC);

-- ============================================================================
-- PART 3: POST CATEGORIES & TAGS
-- ============================================================================

-- Table: post_categories
CREATE TABLE IF NOT EXISTS post_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  name_vi VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  description_vi TEXT,
  parent_id INTEGER REFERENCES post_categories(id) ON DELETE SET NULL,
  icon VARCHAR(50),
  color VARCHAR(20),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_post_categories_parent ON post_categories(parent_id);
CREATE INDEX idx_post_categories_slug ON post_categories(slug);

-- Table: post_tags
CREATE TABLE IF NOT EXISTS post_tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_post_tags_slug ON post_tags(slug);

-- Table: post_category_mapping
CREATE TABLE IF NOT EXISTS post_category_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  category_id INTEGER REFERENCES post_categories(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, category_id)
);

CREATE INDEX idx_post_category_mapping_post ON post_category_mapping(post_id);
CREATE INDEX idx_post_category_mapping_category ON post_category_mapping(category_id);

-- Table: post_tag_mapping
CREATE TABLE IF NOT EXISTS post_tag_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  tag_id INTEGER REFERENCES post_tags(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, tag_id)
);

CREATE INDEX idx_post_tag_mapping_post ON post_tag_mapping(post_id);
CREATE INDEX idx_post_tag_mapping_tag ON post_tag_mapping(tag_id);

-- ============================================================================
-- PART 4: POST COMMENTS & INTERACTIONS
-- ============================================================================

-- Table: post_comments
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (
    status IN ('pending', 'approved', 'rejected', 'spam', 'deleted')
  ),
  moderated_by UUID REFERENCES auth.users(id),
  moderated_at TIMESTAMP WITH TIME ZONE,
  moderation_notes TEXT,
  like_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_post_comments_post ON post_comments(post_id);
CREATE INDEX idx_post_comments_user ON post_comments(user_id);
CREATE INDEX idx_post_comments_parent ON post_comments(parent_comment_id);
CREATE INDEX idx_post_comments_status ON post_comments(status);
CREATE INDEX idx_post_comments_created ON post_comments(created_at DESC);

-- Table: post_likes
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_post_likes_user ON post_likes(user_id);

-- Table: post_bookmarks
CREATE TABLE IF NOT EXISTS post_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_post_bookmarks_post ON post_bookmarks(post_id);
CREATE INDEX idx_post_bookmarks_user ON post_bookmarks(user_id);

-- ============================================================================
-- PART 5: HELPER FUNCTIONS
-- ============================================================================

-- Function: Get user role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS VARCHAR(20) AS $$
DECLARE
  user_role VARCHAR(20);
BEGIN
  SELECT role INTO user_role FROM profiles WHERE id = user_uuid;
  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check if user has admin or moderator role
CREATE OR REPLACE FUNCTION is_admin_or_moderator(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role(user_uuid) IN ('admin', 'moderator');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role(user_uuid) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check if user has specific post permission
CREATE OR REPLACE FUNCTION has_post_permission(
  user_uuid UUID, 
  post_id_param INTEGER, 
  permission_type_param VARCHAR
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM post_permissions 
    WHERE user_id = user_uuid 
    AND post_id = post_id_param 
    AND permission_type = permission_type_param
    AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Log post activity
CREATE OR REPLACE FUNCTION log_post_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO post_activity_log (post_id, user_id, action, new_status)
    VALUES (NEW.id, NEW.author_id, 'created', NEW.status);
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      INSERT INTO post_activity_log (post_id, user_id, action, old_status, new_status)
      VALUES (NEW.id, auth.uid(), 'status_changed', OLD.status, NEW.status);
    ELSE
      INSERT INTO post_activity_log (post_id, user_id, action)
      VALUES (NEW.id, auth.uid(), 'updated');
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO post_activity_log (post_id, user_id, action, old_status)
    VALUES (OLD.id, auth.uid(), 'deleted', OLD.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 6: TRIGGERS
-- ============================================================================

-- Trigger: Log post activity
DROP TRIGGER IF EXISTS trigger_log_post_activity ON posts;
CREATE TRIGGER trigger_log_post_activity
AFTER INSERT OR UPDATE OR DELETE ON posts
FOR EACH ROW EXECUTE FUNCTION log_post_activity();

-- Trigger: Update timestamps
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at 
BEFORE UPDATE ON posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_post_categories_updated_at ON post_categories;
CREATE TRIGGER update_post_categories_updated_at 
BEFORE UPDATE ON post_categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_post_comments_updated_at ON post_comments;
CREATE TRIGGER update_post_comments_updated_at 
BEFORE UPDATE ON post_comments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 7: ENHANCED RLS POLICIES
-- ============================================================================

-- Drop existing post policies if they exist
DROP POLICY IF EXISTS "Anyone can view published posts" ON posts;
DROP POLICY IF EXISTS "Authors can view their own posts" ON posts;
DROP POLICY IF EXISTS "Authors can create posts" ON posts;
DROP POLICY IF EXISTS "Authors can update their own posts" ON posts;
DROP POLICY IF EXISTS "Authors can delete their own posts" ON posts;
DROP POLICY IF EXISTS "Admins and moderators can view all posts" ON posts;
DROP POLICY IF EXISTS "Users with view permission can view posts" ON posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON posts;
DROP POLICY IF EXISTS "Admins can update all posts" ON posts;
DROP POLICY IF EXISTS "Moderators can update post status" ON posts;
DROP POLICY IF EXISTS "Users with edit permission can update posts" ON posts;
DROP POLICY IF EXISTS "Authors can delete their own draft posts" ON posts;
DROP POLICY IF EXISTS "Admins can delete any posts" ON posts;
DROP POLICY IF EXISTS "Users with delete permission can delete posts" ON posts;

-- New comprehensive RLS policies for posts

-- SELECT policies
CREATE POLICY "Anyone can view published posts" 
ON posts FOR SELECT 
USING (status = 'published');

CREATE POLICY "Authors can view their own posts" 
ON posts FOR SELECT 
USING (auth.uid() = author_id);

CREATE POLICY "Admins and moderators can view all posts" 
ON posts FOR SELECT 
USING (is_admin_or_moderator(auth.uid()));

CREATE POLICY "Users with view permission can view posts" 
ON posts FOR SELECT 
USING (has_post_permission(auth.uid(), id, 'view'));

-- INSERT policies
CREATE POLICY "Authenticated users can create posts" 
ON posts FOR INSERT 
WITH CHECK (auth.uid() = author_id);

-- UPDATE policies
CREATE POLICY "Authors can update their own posts" 
ON posts FOR UPDATE 
USING (auth.uid() = author_id);

CREATE POLICY "Admins can update all posts" 
ON posts FOR UPDATE 
USING (is_admin(auth.uid()));

CREATE POLICY "Moderators can update post status" 
ON posts FOR UPDATE 
USING (get_user_role(auth.uid()) = 'moderator');

CREATE POLICY "Users with edit permission can update posts" 
ON posts FOR UPDATE 
USING (has_post_permission(auth.uid(), id, 'edit'));

-- DELETE policies
CREATE POLICY "Authors can delete their own draft posts" 
ON posts FOR DELETE 
USING (auth.uid() = author_id AND status = 'draft');

CREATE POLICY "Admins can delete any posts" 
ON posts FOR DELETE 
USING (is_admin(auth.uid()));

CREATE POLICY "Users with delete permission can delete posts" 
ON posts FOR DELETE 
USING (has_post_permission(auth.uid(), id, 'delete'));

-- ============================================================================
-- PART 8: RLS FOR NEW TABLES
-- ============================================================================

-- Enable RLS
ALTER TABLE post_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_category_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tag_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_bookmarks ENABLE ROW LEVEL SECURITY;

-- post_permissions policies
CREATE POLICY "Admins can manage all post permissions" 
ON post_permissions FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own permissions" 
ON post_permissions FOR SELECT 
USING (auth.uid() = user_id);

-- post_activity_log policies
CREATE POLICY "Admins and moderators can view all activity logs" 
ON post_activity_log FOR SELECT 
USING (is_admin_or_moderator(auth.uid()));

CREATE POLICY "Authors can view their post activity logs" 
ON post_activity_log FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM posts 
    WHERE posts.id = post_activity_log.post_id 
    AND posts.author_id = auth.uid()
  )
);

-- post_categories policies
CREATE POLICY "Anyone can view active categories" 
ON post_categories FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage categories" 
ON post_categories FOR ALL 
USING (is_admin(auth.uid()));

-- post_tags policies
CREATE POLICY "Anyone can view tags" 
ON post_tags FOR SELECT 
USING (true);

CREATE POLICY "Admins and moderators can manage tags" 
ON post_tags FOR ALL 
USING (is_admin_or_moderator(auth.uid()));

-- post_comments policies
CREATE POLICY "Anyone can view approved comments" 
ON post_comments FOR SELECT 
USING (status = 'approved');

CREATE POLICY "Users can view their own comments" 
ON post_comments FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create comments" 
ON post_comments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON post_comments FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins and moderators can manage all comments" 
ON post_comments FOR ALL 
USING (is_admin_or_moderator(auth.uid()));

-- post_likes policies
CREATE POLICY "Users can view all likes" 
ON post_likes FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own likes" 
ON post_likes FOR ALL 
USING (auth.uid() = user_id);

-- post_bookmarks policies
CREATE POLICY "Users can manage their own bookmarks" 
ON post_bookmarks FOR ALL 
USING (auth.uid() = user_id);

-- profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- ============================================================================
-- PART 9: INITIAL DATA
-- ============================================================================

-- Insert default categories
INSERT INTO post_categories (name, name_vi, slug, description, description_vi, display_order) VALUES
('Research Methods', 'Phương pháp nghiên cứu', 'research-methods', 'Articles about research methodologies', 'Bài viết về phương pháp nghiên cứu', 1),
('Data Analysis', 'Phân tích dữ liệu', 'data-analysis', 'Statistical analysis and data science', 'Phân tích thống kê và khoa học dữ liệu', 2),
('Academic Writing', 'Viết học thuật', 'academic-writing', 'Tips for academic writing', 'Mẹo viết bài học thuật', 3),
('Tools & Software', 'Công cụ & Phần mềm', 'tools-software', 'Research tools and software guides', 'Hướng dẫn công cụ và phần mềm nghiên cứu', 4),
('News & Updates', 'Tin tức & Cập nhật', 'news-updates', 'Platform news and updates', 'Tin tức và cập nhật nền tảng', 5)
ON CONFLICT (slug) DO NOTHING;

-- Insert default tags
INSERT INTO post_tags (name, slug) VALUES
('Tutorial', 'tutorial'),
('Guide', 'guide'),
('Tips', 'tips'),
('Best Practices', 'best-practices'),
('Case Study', 'case-study'),
('Announcement', 'announcement')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE posts IS 'Blog posts and articles';
COMMENT ON TABLE post_permissions IS 'Granular permissions for blog posts';
COMMENT ON TABLE post_activity_log IS 'Audit trail for post-related actions';
COMMENT ON TABLE post_categories IS 'Blog post categories with hierarchy support';
COMMENT ON TABLE post_tags IS 'Blog post tags for classification';
COMMENT ON TABLE post_comments IS 'User comments on blog posts';
COMMENT ON TABLE post_likes IS 'User likes on blog posts';
COMMENT ON TABLE post_bookmarks IS 'User bookmarks for blog posts';

COMMENT ON FUNCTION get_user_role IS 'Get user role from profiles table';
COMMENT ON FUNCTION is_admin_or_moderator IS 'Check if user has admin or moderator role';
COMMENT ON FUNCTION is_admin IS 'Check if user has admin role';
COMMENT ON FUNCTION has_post_permission IS 'Check if user has specific permission on a post';
COMMENT ON FUNCTION log_post_activity IS 'Automatically log post-related activities';
