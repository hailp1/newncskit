# Requirements Document: CSV Analysis Workflow

## Introduction

This feature enables users to upload CSV survey data files, automatically analyze and group variables, designate demographic variables, and perform statistical analysis using the R Analytics service.

## Glossary

- **System**: The NCSKIT web application
- **User**: Researcher or analyst using the system
- **CSV File**: Comma-separated values file containing survey data
- **Variable**: A column in the dataset representing a survey question or measurement
- **Variable Group**: A collection of related variables (e.g., items measuring the same construct)
- **Demographic Variable**: Variables describing participant characteristics (age, gender, education, etc.)
- **Data Health Check**: Automated validation of data quality (missing values, outliers, data types)
- **R Analytics Service**: Backend service performing statistical computations

## Requirements

### Requirement 1: CSV File Upload

**User Story:** As a researcher, I want to upload my survey data CSV file, so that I can analyze it in the system.

#### Acceptance Criteria

1. WHEN the User navigates to the analysis page, THE System SHALL display a file upload interface
2. WHEN the User selects a CSV file, THE System SHALL validate the file format is CSV
3. WHEN the file size exceeds 50MB, THE System SHALL display an error message
4. WHEN the CSV file is valid, THE System SHALL upload the file to storage
5. WHEN the upload completes, THE System SHALL parse the CSV and extract column headers

### Requirement 2: Automatic Data Health Check

**User Story:** As a researcher, I want the system to automatically check my data quality, so that I can identify issues before analysis.

#### Acceptance Criteria

1. WHEN the CSV file is uploaded, THE System SHALL perform a data health check
2. THE System SHALL detect missing values for each variable
3. THE System SHALL identify outliers using IQR method
4. THE System SHALL determine data types (numeric, categorical, text)
5. THE System SHALL calculate a data quality score (0-100)
6. WHEN the health check completes, THE System SHALL display results in a summary dashboard

### Requirement 3: Automatic Variable Grouping

**User Story:** As a researcher, I want the system to automatically group related survey questions, so that I can quickly identify constructs in my data.

#### Acceptance Criteria

1. WHEN the data health check completes, THE System SHALL analyze variable names and patterns
2. THE System SHALL identify variables with common prefixes (e.g., "Q1_", "Q2_")
3. THE System SHALL group variables with similar naming patterns
4. THE System SHALL suggest variable groups based on correlation analysis
5. WHEN grouping completes, THE System SHALL display suggested groups in an editable interface
6. THE System SHALL allow the User to modify, merge, or split variable groups

### Requirement 4: Demographic Variable Designation

**User Story:** As a researcher, I want to designate which variables are demographic, so that I can use them for group comparisons.

#### Acceptance Criteria

1. WHEN variable groups are displayed, THE System SHALL provide a demographic designation interface
2. THE System SHALL suggest potential demographic variables based on common names (age, gender, education, income)
3. WHEN the User selects a variable, THE System SHALL allow designation as demographic
4. THE System SHALL support multiple demographic variable types (categorical, ordinal, continuous)
5. WHEN a demographic variable is designated, THE System SHALL validate the data type is appropriate
6. THE System SHALL display all designated demographic variables in a summary panel
7. WHEN the User designates a demographic variable, THE System SHALL allow the User to assign a semantic name (e.g., "income", "age", "gender")

### Requirement 4.1: Demographic Variable Ranking/Categorization

**User Story:** As a researcher, I want to create custom ranks or categories for demographic variables, so that I can group continuous data into meaningful ranges.

#### Acceptance Criteria

1. WHEN a demographic variable is designated, THE System SHALL provide an option to create custom ranks
2. WHEN the User selects "Create Ranks", THE System SHALL display a rank configuration interface
3. THE System SHALL allow the User to define rank labels (e.g., "10-15 triệu", "16-20 triệu")
4. THE System SHALL allow the User to define rank ranges using min-max values
5. WHEN the User defines a rank range, THE System SHALL validate that ranges do not overlap
6. THE System SHALL support open-ended ranges (e.g., "<10 triệu", ">30 triệu")
7. THE System SHALL allow the User to add, edit, or remove ranks
8. WHEN ranks are defined, THE System SHALL automatically categorize data values into appropriate ranks
9. THE System SHALL display a preview showing how many observations fall into each rank
10. WHEN rank configuration is complete, THE System SHALL save the rank definitions for analysis

### Requirement 4.2: Demographic Variable Type Configuration

**User Story:** As a researcher, I want to specify the type and properties of demographic variables, so that the system can perform appropriate analyses.

#### Acceptance Criteria

1. WHEN the User designates a demographic variable, THE System SHALL prompt for variable type selection
2. THE System SHALL support "Categorical" type for nominal variables (e.g., gender, region)
3. THE System SHALL support "Ordinal" type for ordered categories (e.g., education level)
4. THE System SHALL support "Continuous" type for numeric variables (e.g., age, income)
5. WHEN the User selects "Categorical" type, THE System SHALL detect unique values automatically
6. WHEN the User selects "Ordinal" type, THE System SHALL allow the User to specify category order
7. WHEN the User selects "Continuous" type, THE System SHALL offer rank creation option
8. THE System SHALL validate that the selected type matches the actual data
9. WHEN type configuration is complete, THE System SHALL display a summary of the demographic variable

### Requirement 5: Variable Group Configuration

**User Story:** As a researcher, I want to configure my variable groups with names and descriptions, so that my analysis results are meaningful.

#### Acceptance Criteria

1. WHEN variable groups are displayed, THE System SHALL allow the User to edit group names
2. THE System SHALL allow the User to add descriptions to each group
3. THE System SHALL allow the User to add or remove variables from groups
4. THE System SHALL allow the User to create new groups manually
5. WHEN configuration changes are made, THE System SHALL save changes automatically
6. THE System SHALL validate that each variable belongs to at most one group

### Requirement 6: Analysis Type Selection

**User Story:** As a researcher, I want to select which statistical analyses to perform, so that I can get relevant results for my research questions.

#### Acceptance Criteria

1. WHEN variable configuration is complete, THE System SHALL display available analysis types
2. THE System SHALL offer descriptive statistics analysis
3. THE System SHALL offer reliability analysis (Cronbach's Alpha)
4. THE System SHALL offer factor analysis (EFA/CFA)
5. THE System SHALL offer correlation analysis
6. THE System SHALL offer group comparison (t-test, ANOVA)
7. WHEN the User selects an analysis type, THE System SHALL validate required conditions are met

### Requirement 7: Analysis Execution

**User Story:** As a researcher, I want to execute my selected analyses, so that I can obtain statistical results.

#### Acceptance Criteria

1. WHEN the User clicks "Run Analysis", THE System SHALL send data to R Analytics Service
2. THE System SHALL display a progress indicator during analysis
3. WHEN analysis is in progress, THE System SHALL allow the User to cancel the operation
4. WHEN analysis completes successfully, THE System SHALL display results
5. WHEN analysis fails, THE System SHALL display an error message with details
6. THE System SHALL save analysis results to the database

### Requirement 8: Results Visualization

**User Story:** As a researcher, I want to view my analysis results in tables and charts, so that I can interpret findings easily.

#### Acceptance Criteria

1. WHEN analysis completes, THE System SHALL display results in organized sections
2. THE System SHALL display descriptive statistics in tables
3. THE System SHALL display correlation matrices as heatmaps
4. THE System SHALL display factor loadings in tables with highlighting
5. THE System SHALL display group comparisons with bar charts
6. THE System SHALL allow the User to export results as PDF or Excel

### Requirement 9: Workflow Navigation

**User Story:** As a researcher, I want to navigate between workflow steps, so that I can review and modify my configuration.

#### Acceptance Criteria

1. THE System SHALL display a step indicator showing current progress
2. THE System SHALL allow the User to navigate to previous steps
3. WHEN the User navigates backward, THE System SHALL preserve previous configurations
4. THE System SHALL prevent the User from skipping required steps
5. WHEN the User completes all steps, THE System SHALL enable the "Run Analysis" button

### Requirement 10: Data Persistence

**User Story:** As a researcher, I want my uploaded data and configurations to be saved, so that I can return to my analysis later.

#### Acceptance Criteria

1. WHEN the User uploads a CSV file, THE System SHALL save the file to cloud storage
2. THE System SHALL save variable grouping configuration to the database
3. THE System SHALL save demographic designations to the database
4. THE System SHALL save analysis results to the database
5. WHEN the User returns to the project, THE System SHALL restore previous state
6. THE System SHALL allow the User to delete uploaded data and results

## Non-Functional Requirements

### Performance

1. THE System SHALL complete data health check within 10 seconds for files up to 10,000 rows
2. THE System SHALL complete variable grouping within 5 seconds
3. THE System SHALL display analysis results within 30 seconds for standard analyses

### Usability

1. THE System SHALL provide tooltips explaining each analysis type
2. THE System SHALL provide example CSV file format
3. THE System SHALL provide clear error messages for validation failures

### Security

1. THE System SHALL ensure uploaded files are only accessible by the file owner
2. THE System SHALL validate CSV files for malicious content
3. THE System SHALL encrypt data at rest and in transit

## Example Use Cases

### Example 1: Income Variable with Custom Ranks

**Scenario:** User has a survey with income data in Vietnamese Dong (millions)

1. User uploads CSV with column "Thu_nhap" containing values: 12, 18, 25, 35, 8, 42
2. System detects "Thu_nhap" as potential demographic variable
3. User designates "Thu_nhap" as demographic with semantic name "income"
4. User selects "Continuous" type and chooses "Create Ranks"
5. User creates ranks:
   - Rank 1: "Dưới 10 triệu" (< 10)
   - Rank 2: "10-15 triệu" (10-15)
   - Rank 3: "16-20 triệu" (16-20)
   - Rank 4: "21-30 triệu" (21-30)
   - Rank 5: "Trên 30 triệu" (> 30)
6. System shows preview:
   - Dưới 10 triệu: 1 person (8)
   - 10-15 triệu: 1 person (12)
   - 16-20 triệu: 1 person (18)
   - 21-30 triệu: 1 person (25)
   - Trên 30 triệu: 2 people (35, 42)
7. User confirms and proceeds to analysis

### Example 2: Age Variable with Age Groups

**Scenario:** User has age data and wants to create age groups

1. User uploads CSV with column "Tuoi" containing values: 22, 28, 35, 41, 55, 19
2. User designates "Tuoi" as demographic with semantic name "age"
3. User creates ranks:
   - "18-25 tuổi" (18-25)
   - "26-35 tuổi" (26-35)
   - "36-45 tuổi" (36-45)
   - "Trên 45 tuổi" (> 45)
4. System categorizes data and shows distribution
5. User can use these age groups for group comparisons in analysis

### Example 3: Education Level (Ordinal)

**Scenario:** User has education level as categorical data

1. User uploads CSV with column "Hoc_van" containing: "THPT", "Đại học", "Sau đại học", "THCS"
2. User designates "Hoc_van" as demographic with semantic name "education"
3. User selects "Ordinal" type
4. User specifies order:
   1. THCS
   2. THPT
   3. Đại học
   4. Sau đại học
5. System uses this ordering for ordinal analyses

## Assumptions

- Users have basic understanding of statistical concepts
- CSV files follow standard format (comma-separated, first row as headers)
- R Analytics Service is available and operational
- Numeric values in CSV are in consistent units (e.g., all income in millions)

## Dependencies

- R Analytics Service must be running
- Supabase storage for file uploads
- Database for storing configurations and results

---

**Version**: 1.0.0  
**Date**: 2024-01-07  
**Status**: Draft
