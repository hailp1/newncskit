-- Migration: Create Question Bank Table
-- Date: 2024-11-05
-- Description: Create question_bank table for storing question templates with theoretical model associations

\c ncskit;

-- Create enum types for question types
CREATE TYPE question_type AS ENUM (
    'likert',
    'multiple_choice',
    'text',
    'numeric',
    'boolean',
    'rating',
    'ranking'
);

-- Create question_bank table
CREATE TABLE IF NOT EXISTS question_bank (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    text_vi TEXT, -- Vietnamese translation
    type question_type NOT NULL,
    
    -- Model Association
    theoretical_model VARCHAR(200) NOT NULL,
    research_variable VARCHAR(200) NOT NULL,
    construct VARCHAR(200) NOT NULL,
    
    -- Question Configuration
    options JSONB, -- For multiple choice questions: ["Option 1", "Option 2", ...]
    scale JSONB, -- For likert/rating: {"min": 1, "max": 7, "labels": ["Strongly Disagree", ..., "Strongly Agree"]}
    validation_rules JSONB DEFAULT '{}'::jsonb, -- Validation rules for the question
    
    -- Metadata
    source TEXT NOT NULL, -- Academic source/reference
    reliability DECIMAL(4,3), -- Cronbach's alpha if available (0.000-1.000)
    tags TEXT[] DEFAULT '{}',
    category VARCHAR(100),
    subcategory VARCHAR(100),
    
    -- Status and versioning
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    parent_question_id UUID REFERENCES question_bank(id), -- For question variations
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    -- Constraints
    CONSTRAINT valid_reliability CHECK (reliability IS NULL OR (reliability >= 0 AND reliability <= 1))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_question_bank_theoretical_model ON question_bank(theoretical_model);
CREATE INDEX IF NOT EXISTS idx_question_bank_research_variable ON question_bank(research_variable);
CREATE INDEX IF NOT EXISTS idx_question_bank_construct ON question_bank(construct);
CREATE INDEX IF NOT EXISTS idx_question_bank_type ON question_bank(type);
CREATE INDEX IF NOT EXISTS idx_question_bank_category ON question_bank(category);
CREATE INDEX IF NOT EXISTS idx_question_bank_is_active ON question_bank(is_active);
CREATE INDEX IF NOT EXISTS idx_question_bank_tags ON question_bank USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_question_bank_options ON question_bank USING GIN (options);
CREATE INDEX IF NOT EXISTS idx_question_bank_scale ON question_bank USING GIN (scale);
CREATE INDEX IF NOT EXISTS idx_question_bank_validation_rules ON question_bank USING GIN (validation_rules);
CREATE INDEX IF NOT EXISTS idx_question_bank_created_by ON question_bank(created_by);

-- Create composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_question_bank_model_variable ON question_bank(theoretical_model, research_variable);
CREATE INDEX IF NOT EXISTS idx_question_bank_model_construct ON question_bank(theoretical_model, construct);
CREATE INDEX IF NOT EXISTS idx_question_bank_active_model ON question_bank(is_active, theoretical_model) WHERE is_active = true;

-- Create trigger for updated_at
CREATE TRIGGER update_question_bank_updated_at 
    BEFORE UPDATE ON question_bank 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE question_bank IS 'Repository of question templates associated with theoretical models and research variables';
COMMENT ON COLUMN question_bank.theoretical_model IS 'Name of the theoretical model (e.g., TAM, TPB, SERVQUAL)';
COMMENT ON COLUMN question_bank.research_variable IS 'Specific research variable being measured';
COMMENT ON COLUMN question_bank.construct IS 'Theoretical construct or dimension';
COMMENT ON COLUMN question_bank.options IS 'JSON array of options for multiple choice questions';
COMMENT ON COLUMN question_bank.scale IS 'JSON object defining scale properties for likert/rating questions';
COMMENT ON COLUMN question_bank.validation_rules IS 'JSON object with validation rules (required, min/max length, etc.)';
COMMENT ON COLUMN question_bank.source IS 'Academic source or reference where the question originated';
COMMENT ON COLUMN question_bank.reliability IS 'Cronbach alpha or other reliability measure if available';
COMMENT ON COLUMN question_bank.parent_question_id IS 'Reference to parent question for variations or translations';