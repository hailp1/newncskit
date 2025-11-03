-- =====================================================
-- NCSKIT Research Management Platform - Seed Data
-- =====================================================

-- Insert sample institutions first
INSERT INTO institutions (id, name, short_name, country, city, type, website_url) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'NCSKIT University', 'NCSKIT', 'Vietnam', 'Ho Chi Minh City', 'university', 'https://ncskit.edu.vn'),
('550e8400-e29b-41d4-a716-446655440002', 'Tech Research Institute', 'TRI', 'Vietnam', 'Hanoi', 'research_institute', 'https://tri.vn'),
('550e8400-e29b-41d4-a716-446655440003', 'State University', 'SU', 'Vietnam', 'Da Nang', 'university', 'https://su.edu.vn')
ON CONFLICT (id) DO NOTHING;

-- Insert sample users
INSERT INTO users (
    id, email, first_name, last_name, display_name, 
    institution, department, position, 
    subscription_type, user_role, 
    research_domains, research_interests, expertise_areas
) VALUES
(
    '550e8400-e29b-41d4-a716-446655440011',
    'demo@ncskit.com',
    'Demo',
    'User',
    'Dr. Demo User',
    'NCSKIT University',
    'Computer Science',
    'Senior Researcher',
    'premium',
    'researcher',
    ARRAY['Computer Science', 'Artificial Intelligence'],
    ARRAY['Machine Learning', 'Healthcare AI', 'Natural Language Processing'],
    ARRAY['Deep Learning', 'Data Analysis', 'Research Methodology']
),
(
    '550e8400-e29b-41d4-a716-446655440012',
    'researcher@ncskit.com',
    'Research',
    'Scientist',
    'Prof. Research Scientist',
    'Tech Research Institute',
    'Data Science',
    'Principal Investigator',
    'institutional',
    'professor',
    ARRAY['Data Science', 'Statistics'],
    ARRAY['Statistical Analysis', 'Climate Research', 'Big Data'],
    ARRAY['Statistical Modeling', 'Data Visualization', 'Research Design']
),
(
    '550e8400-e29b-41d4-a716-446655440013',
    'student@ncskit.com',
    'Graduate',
    'Student',
    'Graduate Student',
    'State University',
    'Biology',
    'PhD Student',
    'free',
    'student',
    ARRAY['Biology', 'Biotechnology'],
    ARRAY['Molecular Biology', 'Genetics', 'Bioinformatics'],
    ARRAY['Laboratory Techniques', 'Data Analysis']
),
(
    '550e8400-e29b-41d4-a716-446655440014',
    'admin@ncskit.com',
    'System',
    'Administrator',
    'System Admin',
    'NCSKIT University',
    'IT Department',
    'System Administrator',
    'enterprise',
    'admin',
    ARRAY['Information Technology'],
    ARRAY['System Administration', 'Database Management'],
    ARRAY['System Architecture', 'Database Design', 'Security']
)
ON CONFLICT (id) DO NOTHING;

-- Link users to institutions
INSERT INTO user_institutions (user_id, institution_id, department, position, is_primary) VALUES
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'Computer Science', 'Senior Researcher', true),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 'Data Science', 'Principal Investigator', true),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440003', 'Biology', 'PhD Student', true),
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440001', 'IT Department', 'System Administrator', true)
ON CONFLICT (user_id, institution_id) DO NOTHING;

-- Insert sample projects
INSERT INTO projects (
    id, title, description, abstract,
    research_domain, research_type, methodology, keywords,
    status, phase, visibility, progress,
    owner_id, institution_id,
    start_date, expected_end_date,
    funding_source, budget_amount
) VALUES
(
    '550e8400-e29b-41d4-a716-446655440021',
    'AI-Powered Healthcare Diagnosis System',
    'Development of machine learning algorithms for automated medical diagnosis using medical imaging and patient data.',
    'This research aims to develop and validate an artificial intelligence system capable of assisting healthcare professionals in diagnosing various medical conditions. The system will utilize deep learning techniques to analyze medical images, patient history, and laboratory results to provide accurate diagnostic suggestions.',
    'Computer Science',
    'experimental',
    ARRAY['Machine Learning', 'Deep Learning', 'Data Analysis', 'Clinical Validation'],
    ARRAY['artificial intelligence', 'healthcare', 'medical diagnosis', 'machine learning', 'deep learning'],
    'active',
    'execution',
    'team',
    65,
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440001',
    '2024-01-15',
    '2025-12-31',
    'National Science Foundation',
    250000.00
),
(
    '550e8400-e29b-41d4-a716-446655440022',
    'Climate Change Impact Analysis Using Big Data',
    'Comprehensive statistical analysis of global climate data to understand long-term environmental trends and their implications.',
    'This study employs advanced statistical methods and big data analytics to examine climate change patterns over the past century. We analyze temperature, precipitation, and atmospheric data from multiple sources to identify significant trends and predict future climate scenarios.',
    'Environmental Science',
    'theoretical',
    ARRAY['Statistical Analysis', 'Time Series Analysis', 'Data Mining', 'Predictive Modeling'],
    ARRAY['climate change', 'big data', 'statistical analysis', 'environmental science', 'predictive modeling'],
    'active',
    'analysis',
    'public',
    80,
    '550e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440002',
    '2023-09-01',
    '2024-08-31',
    'Environmental Protection Agency',
    180000.00
),
(
    '550e8400-e29b-41d4-a716-446655440023',
    'Genetic Markers in Cancer Research',
    'Investigation of specific genetic markers associated with cancer development and progression for improved treatment strategies.',
    'This research focuses on identifying and characterizing genetic biomarkers that can predict cancer susceptibility, progression, and treatment response. Using advanced genomic techniques, we aim to contribute to personalized medicine approaches in oncology.',
    'Biology',
    'experimental',
    ARRAY['Genomic Analysis', 'Biomarker Discovery', 'Statistical Genetics', 'Laboratory Analysis'],
    ARRAY['genetics', 'cancer research', 'biomarkers', 'genomics', 'personalized medicine'],
    'planning',
    'planning',
    'private',
    25,
    '550e8400-e29b-41d4-a716-446655440013',
    '550e8400-e29b-41d4-a716-446655440003',
    '2024-03-01',
    '2026-02-28',
    'Cancer Research Foundation',
    320000.00
)
ON CONFLICT (id) DO NOTHING;

-- Add project collaborators
INSERT INTO project_collaborators (project_id, user_id, role, permissions, invited_by, joined_at) VALUES
-- AI Healthcare project collaborators
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440012', 'co_investigator', ARRAY['read', 'write', 'review'], '550e8400-e29b-41d4-a716-446655440011', NOW()),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440013', 'researcher', ARRAY['read', 'write'], '550e8400-e29b-41d4-a716-446655440011', NOW()),

-- Climate Change project collaborators
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440011', 'analyst', ARRAY['read', 'write'], '550e8400-e29b-41d4-a716-446655440012', NOW()),

-- Cancer Research project collaborators
('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440012', 'reviewer', ARRAY['read', 'review'], '550e8400-e29b-41d4-a716-446655440013', NOW())
ON CONFLICT (project_id, user_id) DO NOTHING;

-- Insert sample milestones
INSERT INTO milestones (
    id, project_id, title, description, due_date, 
    is_completed, completed_at, assigned_to, created_by, priority
) VALUES
-- AI Healthcare project milestones
(
    '550e8400-e29b-41d4-a716-446655440031',
    '550e8400-e29b-41d4-a716-446655440021',
    'Data Collection and Preprocessing',
    'Collect and preprocess medical imaging data from partner hospitals',
    '2024-03-31',
    true,
    '2024-03-28 10:30:00',
    '550e8400-e29b-41d4-a716-446655440013',
    '550e8400-e29b-41d4-a716-446655440011',
    2
),
(
    '550e8400-e29b-41d4-a716-446655440032',
    '550e8400-e29b-41d4-a716-446655440021',
    'Model Development and Training',
    'Develop and train deep learning models for medical diagnosis',
    '2024-08-15',
    true,
    '2024-08-10 14:20:00',
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440011',
    3
),
(
    '550e8400-e29b-41d4-a716-446655440033',
    '550e8400-e29b-41d4-a716-446655440021',
    'Clinical Validation Study',
    'Conduct clinical validation with healthcare professionals',
    '2024-12-31',
    false,
    NULL,
    '550e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440011',
    4
),

-- Climate Change project milestones
(
    '550e8400-e29b-41d4-a716-446655440034',
    '550e8400-e29b-41d4-a716-446655440022',
    'Data Integration and Quality Assessment',
    'Integrate climate data from multiple sources and assess quality',
    '2023-12-31',
    true,
    '2023-12-20 16:45:00',
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440012',
    3
),
(
    '550e8400-e29b-41d4-a716-446655440035',
    '550e8400-e29b-41d4-a716-446655440022',
    'Statistical Analysis and Modeling',
    'Perform comprehensive statistical analysis and develop predictive models',
    '2024-06-30',
    true,
    '2024-06-25 11:15:00',
    '550e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440012',
    4
),

-- Cancer Research project milestones
(
    '550e8400-e29b-41d4-a716-446655440036',
    '550e8400-e29b-41d4-a716-446655440023',
    'Literature Review and Protocol Development',
    'Complete comprehensive literature review and develop research protocol',
    '2024-05-31',
    false,
    NULL,
    '550e8400-e29b-41d4-a716-446655440013',
    '550e8400-e29b-41d4-a716-446655440013',
    2
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample documents
INSERT INTO documents (
    id, project_id, title, content, type, status, version,
    created_by, word_count
) VALUES
(
    '550e8400-e29b-41d4-a716-446655440041',
    '550e8400-e29b-41d4-a716-446655440021',
    'AI Healthcare Diagnosis - Research Proposal',
    '# AI-Powered Healthcare Diagnosis System

## Abstract
This research proposal outlines the development of an artificial intelligence system for automated medical diagnosis...

## Introduction
Healthcare diagnosis is a critical component of medical practice that requires extensive expertise and experience...

## Methodology
We propose to use deep learning techniques, specifically convolutional neural networks (CNNs) and transformer architectures...

## Expected Outcomes
The expected outcomes of this research include:
1. A validated AI system for medical diagnosis
2. Improved diagnostic accuracy
3. Reduced diagnostic time
4. Enhanced healthcare accessibility

## Timeline
The project is planned to be completed over 24 months with the following phases:
- Phase 1: Data collection and preprocessing (6 months)
- Phase 2: Model development and training (8 months)
- Phase 3: Clinical validation (6 months)
- Phase 4: Documentation and publication (4 months)',
    'proposal',
    'approved',
    1,
    '550e8400-e29b-41d4-a716-446655440011',
    850
),
(
    '550e8400-e29b-41d4-a716-446655440042',
    '550e8400-e29b-41d4-a716-446655440022',
    'Climate Data Analysis - Methodology',
    '# Climate Change Impact Analysis Methodology

## Data Sources
Our analysis incorporates data from multiple authoritative sources:
- NOAA Global Climate Database
- NASA Earth Observations
- IPCC Climate Reports
- Regional meteorological stations

## Statistical Methods
We employ several advanced statistical techniques:
1. Time series analysis using ARIMA models
2. Trend analysis with Mann-Kendall tests
3. Correlation analysis for multi-variate relationships
4. Machine learning for pattern recognition

## Quality Control
Data quality is ensured through:
- Outlier detection and removal
- Missing data imputation
- Cross-validation with independent sources
- Uncertainty quantification',
    'methodology',
    'draft',
    2,
    '550e8400-e29b-41d4-a716-446655440012',
    420
),
(
    '550e8400-e29b-41d4-a716-446655440043',
    '550e8400-e29b-41d4-a716-446655440023',
    'Genetic Markers Literature Review',
    '# Literature Review: Genetic Markers in Cancer Research

## Introduction
Cancer is a complex disease characterized by genetic alterations that drive tumor development and progression...

## Current State of Research
Recent advances in genomic technologies have enabled comprehensive analysis of cancer genomes...

## Key Findings
1. TP53 mutations are found in over 50% of human cancers
2. BRCA1/BRCA2 mutations significantly increase breast cancer risk
3. Microsatellite instability is a key biomarker for immunotherapy response

## Research Gaps
Despite significant progress, several gaps remain:
- Limited diversity in genomic databases
- Need for functional validation of variants
- Integration of multi-omics data

## Proposed Research Direction
Our research aims to address these gaps by...',
    'notes',
    'draft',
    1,
    '550e8400-e29b-41d4-a716-446655440013',
    650
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample references
INSERT INTO references (
    id, title, authors, type, publication_title, publication_year,
    doi, abstract, keywords, user_id, project_id, tags
) VALUES
(
    '550e8400-e29b-41d4-a716-446655440051',
    'Deep Learning for Medical Image Analysis: A Comprehensive Review',
    '[{"name": "Zhang, L.", "affiliation": "Stanford University"}, {"name": "Wang, M.", "affiliation": "MIT"}, {"name": "Chen, X.", "affiliation": "Harvard Medical School"}]',
    'journal_article',
    'Nature Medicine',
    2023,
    '10.1038/s41591-023-02334-1',
    'This comprehensive review examines the current state and future prospects of deep learning applications in medical image analysis. We discuss various architectures, training strategies, and clinical applications across different medical imaging modalities.',
    ARRAY['deep learning', 'medical imaging', 'artificial intelligence', 'healthcare'],
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440021',
    ARRAY['AI', 'healthcare', 'review']
),
(
    '550e8400-e29b-41d4-a716-446655440052',
    'Climate Change and Statistical Analysis: Methods and Applications',
    '[{"name": "Johnson, R.", "affiliation": "NOAA"}, {"name": "Smith, K.", "affiliation": "University of Colorado"}, {"name": "Brown, A.", "affiliation": "NASA"}]',
    'journal_article',
    'Journal of Climate',
    2023,
    '10.1175/JCLI-D-22-0456.1',
    'This paper presents advanced statistical methods for analyzing climate data and detecting long-term trends. We demonstrate applications to global temperature and precipitation datasets.',
    ARRAY['climate change', 'statistical analysis', 'time series', 'environmental data'],
    '550e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440022',
    ARRAY['climate', 'statistics', 'methodology']
),
(
    '550e8400-e29b-41d4-a716-446655440053',
    'Genetic Biomarkers in Oncology: Current Status and Future Directions',
    '[{"name": "Garcia, M.", "affiliation": "Memorial Sloan Kettering"}, {"name": "Lee, S.", "affiliation": "Johns Hopkins"}, {"name": "Patel, N.", "affiliation": "MD Anderson"}]',
    'journal_article',
    'Nature Genetics',
    2024,
    '10.1038/s41588-024-01234-5',
    'We review the current landscape of genetic biomarkers in cancer research, discussing their clinical applications, challenges, and future potential for personalized medicine.',
    ARRAY['genetics', 'biomarkers', 'cancer', 'personalized medicine'],
    '550e8400-e29b-41d4-a716-446655440013',
    '550e8400-e29b-41d4-a716-446655440023',
    ARRAY['genetics', 'cancer', 'biomarkers']
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample journals
INSERT INTO journals (
    id, title, issn, publisher, impact_factor, quartile,
    subject_areas, is_open_access, submission_url
) VALUES
(
    '550e8400-e29b-41d4-a716-446655440061',
    'Nature Medicine',
    '1078-8956',
    'Nature Publishing Group',
    87.241,
    'Q1',
    ARRAY['Medicine', 'Biomedical Research', 'Clinical Medicine'],
    false,
    'https://www.nature.com/nm/submit'
),
(
    '550e8400-e29b-41d4-a716-446655440062',
    'Journal of Climate',
    '0894-8755',
    'American Meteorological Society',
    5.38,
    'Q1',
    ARRAY['Climate Science', 'Atmospheric Science', 'Environmental Science'],
    false,
    'https://journals.ametsoc.org/jcli/submit'
),
(
    '550e8400-e29b-41d4-a716-446655440063',
    'Nature Genetics',
    '1061-4036',
    'Nature Publishing Group',
    31.616,
    'Q1',
    ARRAY['Genetics', 'Genomics', 'Molecular Biology'],
    false,
    'https://www.nature.com/ng/submit'
),
(
    '550e8400-e29b-41d4-a716-446655440064',
    'PLOS ONE',
    '1932-6203',
    'Public Library of Science',
    3.752,
    'Q2',
    ARRAY['Multidisciplinary', 'Science', 'Research'],
    true,
    'https://journals.plos.org/plosone/submit'
)
ON CONFLICT (id) DO NOTHING;

-- Insert sample activities
INSERT INTO activities (user_id, project_id, type, description, entity_type, entity_id) VALUES
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440021', 'project_created', 'Created new project: AI-Powered Healthcare Diagnosis System', 'project', '550e8400-e29b-41d4-a716-446655440021'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440021', 'document_created', 'Created research proposal document', 'document', '550e8400-e29b-41d4-a716-446655440041'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440022', 'project_created', 'Created new project: Climate Change Impact Analysis', 'project', '550e8400-e29b-41d4-a716-446655440022'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440023', 'project_created', 'Created new project: Genetic Markers in Cancer Research', 'project', '550e8400-e29b-41d4-a716-446655440023'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440021', 'milestone_completed', 'Completed milestone: Data Collection and Preprocessing', 'milestone', '550e8400-e29b-41d4-a716-446655440031'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440022', 'milestone_completed', 'Completed milestone: Statistical Analysis and Modeling', 'milestone', '550e8400-e29b-41d4-a716-446655440035');

-- Insert sample notifications
INSERT INTO notifications (
    user_id, title, message, type, priority, entity_type, entity_id
) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'Milestone Due Soon', 'Clinical Validation Study milestone is due in 7 days', 'reminder', 'high', 'milestone', '550e8400-e29b-41d4-a716-446655440033'),
('550e8400-e29b-41d4-a716-446655440012', 'New Collaboration Invitation', 'You have been invited to collaborate on AI Healthcare project', 'info', 'medium', 'project', '550e8400-e29b-41d4-a716-446655440021'),
('550e8400-e29b-41d4-a716-446655440013', 'Document Review Request', 'Please review the methodology document for Climate Change project', 'info', 'medium', 'document', '550e8400-e29b-41d4-a716-446655440042'),
('550e8400-e29b-41d4-a716-446655440011', 'Project Update', 'Your AI Healthcare project has reached 65% completion', 'success', 'low', 'project', '550e8400-e29b-41d4-a716-446655440021');

-- Update project progress based on completed milestones
UPDATE projects SET progress = 65 WHERE id = '550e8400-e29b-41d4-a716-446655440021';
UPDATE projects SET progress = 80 WHERE id = '550e8400-e29b-41d4-a716-446655440022';
UPDATE projects SET progress = 25 WHERE id = '550e8400-e29b-41d4-a716-446655440023';

-- Insert sample tasks
INSERT INTO tasks (
    project_id, milestone_id, title, description, assigned_to, created_by,
    due_date, priority, is_completed
) VALUES
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440033', 'Prepare clinical validation protocol', 'Develop detailed protocol for clinical validation study', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440011', '2024-11-30', 3, false),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440033', 'Recruit healthcare professionals', 'Identify and recruit healthcare professionals for validation study', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440011', '2024-12-15', 4, false),
('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440036', 'Complete systematic literature review', 'Conduct comprehensive systematic review of genetic markers in cancer', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440013', '2024-04-30', 2, false),
('550e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440036', 'Develop research protocol', 'Create detailed research protocol for genetic marker study', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440013', '2024-05-15', 3, false);

-- This completes the seed data for NCSKIT
-- The database now contains realistic sample data for testing and development