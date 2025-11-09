# Requirements Document: CSV Analysis Workflow Fix

## Introduction

The CSV analysis workflow currently fails because it attempts to connect to an R Analytics server at `http://localhost:8000` immediately upon file upload. The expected workflow should be: upload CSV → auto-group variables → configure demographics → execute analysis. However, the R server health check is blocking the initial steps, preventing users from even configuring their analysis.

## Glossary

- **CSV Analysis Workflow**: The multi-step process for uploading survey data, configuring variables, and performing statistical analysis
- **R Analytics Server**: External service running on port 8000 that performs statistical computations
- **Variable Grouping**: Automatic organization of CSV columns into logical groups based on naming patterns
- **Demographic Configuration**: Process of designating certain variables as demographic factors and creating rank categories
- **Health Check**: API call to verify R server availability before analysis execution

## Requirements

### Requirement 1: Deferred R Server Connection

**User Story:** As a researcher, I want to upload my CSV file and configure my analysis without requiring the R server to be running, so that I can prepare my analysis setup even when the R server is offline.

#### Acceptance Criteria

1. WHEN the System receives a CSV file upload, THE System SHALL parse and validate the file without connecting to the R Analytics Server
2. WHEN the System completes CSV parsing, THE System SHALL automatically group variables based on naming patterns without connecting to the R Analytics Server
3. WHEN the User configures demographic variables, THE System SHALL save the configuration to the database without connecting to the R Analytics Server
4. WHEN the User attempts to execute analysis, THE System SHALL check R Analytics Server availability before proceeding
5. IF the R Analytics Server is unavailable during analysis execution, THEN THE System SHALL display a clear error message with instructions to start the R server

### Requirement 2: Progressive Workflow Steps

**User Story:** As a researcher, I want to complete the workflow steps sequentially (upload → group → configure → analyze), so that I can properly prepare my data before running statistical analysis.

#### Acceptance Criteria

1. WHEN the System receives uploaded CSV data, THE System SHALL display the data preview and proceed to variable grouping step
2. WHEN the User completes variable grouping, THE System SHALL enable the demographic configuration step
3. WHEN the User completes demographic configuration, THE System SHALL enable the analysis selection step
4. WHEN the User selects analysis types, THE System SHALL enable the execution step
5. THE System SHALL NOT require R server connectivity for steps upload, grouping, and demographic configuration

### Requirement 3: Clear Error Messaging

**User Story:** As a researcher, I want to receive clear error messages when the R server is unavailable, so that I know exactly what action to take to resolve the issue.

#### Acceptance Criteria

1. WHEN the R Analytics Server health check fails, THE System SHALL display an error message stating "R Analytics Server is not available"
2. WHEN the R Analytics Server health check fails, THE System SHALL provide instructions to start the R server with command "cd r-analytics && Rscript server.R"
3. WHEN the R Analytics Server health check fails, THE System SHALL display the expected server URL "http://localhost:8000"
4. THE System SHALL NOT display generic error messages like "Đã xảy ra lỗi không mong muốn"
5. THE System SHALL provide a "Retry Connection" button after displaying R server error

### Requirement 4: Graceful Degradation

**User Story:** As a researcher, I want to save my analysis configuration even when the R server is offline, so that I can execute the analysis later when the server becomes available.

#### Acceptance Criteria

1. THE System SHALL save all configuration data (variable groups, demographics, ranks, analysis selections) to the database regardless of R server status
2. WHEN the User returns to a configured project, THE System SHALL load the saved configuration without checking R server status
3. WHEN the User clicks "Execute Analysis" on a configured project, THE System SHALL check R server availability before proceeding
4. IF the R server becomes available after configuration, THEN THE System SHALL execute the analysis using the saved configuration
5. THE System SHALL display project status as "configured" when configuration is complete but analysis has not been executed

### Requirement 5: Data Health Check Without R Server

**User Story:** As a researcher, I want to see data quality metrics (missing values, outliers, data types) immediately after upload, so that I can assess my data quality without waiting for the R server.

#### Acceptance Criteria

1. WHEN the System parses CSV data, THE System SHALL calculate missing value counts for each column using JavaScript
2. WHEN the System parses CSV data, THE System SHALL detect data types (numeric, categorical, text) using JavaScript
3. WHEN the System parses CSV data, THE System SHALL calculate basic statistics (min, max, mean, std) for numeric columns using JavaScript
4. WHEN the System parses CSV data, THE System SHALL detect outliers using IQR method in JavaScript
5. THE System SHALL display data health metrics without requiring R Analytics Server connectivity
