# Requirements Document - Project Rebuild & Fix All Issues

## Introduction

This specification addresses the complete rebuild and fixing of all TypeScript errors and issues in the NCSKIT project. The system currently has 270 TypeScript errors across 30 files that prevent successful builds and deployments. The goal is to systematically identify, categorize, and fix all errors to achieve a clean, production-ready codebase.

## Glossary

- **System**: The NCSKIT (AI-Powered Vietnamese Marketing Research Platform) frontend application
- **TypeScript Compiler**: The tsc tool that validates TypeScript code and generates type errors
- **Build Process**: The Next.js build process that compiles and bundles the application
- **Type Safety**: The guarantee that all TypeScript types are correctly defined and used
- **Production Build**: A successfully compiled application ready for deployment

## Requirements

### Requirement 1: Type System Integrity

**User Story:** As a developer, I want all TypeScript types to be correctly defined and exported, so that the type system provides accurate compile-time checking.

#### Acceptance Criteria

1. WHEN THE System compiles TypeScript files, THE System SHALL resolve all missing type exports without errors
2. WHEN THE System references workflow types, THE System SHALL find all exported members (TheoreticalFramework, ResearchVariable, Hypothesis, FrameworkRelationship, SurveyCampaign, CampaignStatus, EligibilityCriteria, EnhancedProject)
3. WHEN THE System uses enum types, THE System SHALL access them as both types and runtime values
4. WHERE type definitions are incomplete, THE System SHALL add missing properties to match actual usage
5. WHEN THE System imports types from index files, THE System SHALL export all required types from the central type definition files

### Requirement 2: Null Safety and Type Guards

**User Story:** As a developer, I want proper null checks and type guards throughout the codebase, so that runtime errors from null/undefined values are prevented.

#### Acceptance Criteria

1. WHEN THE System accesses user properties, THE System SHALL verify the user object is not null before property access
2. WHEN THE System uses Supabase auth responses, THE System SHALL handle the Promise type correctly with await
3. IF a value is possibly null, THEN THE System SHALL add explicit null checks before accessing properties
4. WHEN THE System accesses nested properties, THE System SHALL use optional chaining or null checks
5. WHERE type narrowing is needed, THE System SHALL implement proper type guard functions

### Requirement 3: Supabase Type Compatibility

**User Story:** As a developer, I want Supabase client operations to work with the generated types, so that database operations compile without type errors.

#### Acceptance Criteria

1. WHEN THE System performs database inserts, THE System SHALL use compatible types that match the generated Supabase schema
2. WHEN THE System updates records, THE System SHALL provide type-safe update objects
3. WHERE Supabase generated types are too strict, THE System SHALL use appropriate type assertions or overrides
4. WHEN THE System queries data, THE System SHALL handle the response types correctly
5. IF type mismatches occur with Supabase operations, THEN THE System SHALL add proper type mappings or transformations

### Requirement 4: Enum and Constant Usage

**User Story:** As a developer, I want enums and constants to be usable as both types and runtime values, so that they can be used in comparisons and assignments.

#### Acceptance Criteria

1. WHEN THE System defines enums (MilestoneStatus, MilestoneType, ProjectStage), THE System SHALL export them as const enums or regular enums
2. WHEN THE System compares values to enum members, THE System SHALL access enum values at runtime
3. WHERE enums are used in type positions, THE System SHALL allow type-only imports
4. WHEN THE System iterates over enum values, THE System SHALL use Object.values() with proper typing
5. IF an enum is used as both type and value, THEN THE System SHALL ensure it's exported as a value

### Requirement 5: Interface Completeness

**User Story:** As a developer, I want all interfaces to include all properties used in the code, so that property access doesn't result in type errors.

#### Acceptance Criteria

1. WHEN THE System defines the Milestone interface, THE System SHALL include all properties (name, progressPercentage, plannedStartDate, plannedCompletionDate, estimatedHours, actualHours, notes, dependsOn, orderIndex)
2. WHEN THE System defines the ProgressReport interface, THE System SHALL include upcomingMilestones, blockedMilestones, and estimatedCompletion properties
3. WHEN THE System defines the TimelineEvent interface, THE System SHALL include timestamp and eventType properties
4. WHERE interfaces are missing properties, THE System SHALL add them with appropriate types
5. WHEN THE System defines the ResearchDesign interface, THE System SHALL include theoreticalFrameworks property

### Requirement 6: Service Type Consistency

**User Story:** As a developer, I want service layer types to be consistent with database types, so that data flows correctly between layers.

#### Acceptance Criteria

1. WHEN THE System defines Project types, THE System SHALL ensure user_id type matches between service and store layers
2. WHEN THE System defines DataHealthReport, THE System SHALL ensure variablesWithMissing structure matches actual usage
3. WHERE type mismatches exist between layers, THE System SHALL create proper type mapping functions
4. WHEN THE System passes data between services, THE System SHALL validate type compatibility
5. IF type conversions are needed, THEN THE System SHALL implement explicit transformation functions

### Requirement 7: Build Success

**User Story:** As a developer, I want the build process to complete successfully, so that the application can be deployed to production.

#### Acceptance Criteria

1. WHEN THE System runs `npm run type-check`, THE System SHALL complete with zero TypeScript errors
2. WHEN THE System runs `npm run build`, THE System SHALL generate production bundles successfully
3. WHERE build errors occur, THE System SHALL provide clear error messages
4. WHEN THE System completes the build, THE System SHALL generate all required static pages
5. IF the build succeeds, THEN THE System SHALL be ready for deployment

### Requirement 8: Code Quality Standards

**User Story:** As a developer, I want the codebase to follow TypeScript best practices, so that it's maintainable and type-safe.

#### Acceptance Criteria

1. WHEN THE System defines types, THE System SHALL use explicit type annotations where inference is unclear
2. WHEN THE System uses any type, THE System SHALL document why it's necessary
3. WHERE type assertions are used, THE System SHALL ensure they are safe and necessary
4. WHEN THE System defines functions, THE System SHALL provide return type annotations
5. IF strict mode is enabled, THEN THE System SHALL comply with all strict type checking rules

### Requirement 9: Error Recovery and Validation

**User Story:** As a developer, I want proper error handling and validation throughout the codebase, so that type errors don't cause runtime failures.

#### Acceptance Criteria

1. WHEN THE System encounters invalid data, THE System SHALL validate and transform it safely
2. WHEN THE System accesses external data, THE System SHALL validate the structure before use
3. WHERE runtime type checking is needed, THE System SHALL implement validation functions
4. WHEN THE System handles errors, THE System SHALL use properly typed error objects
5. IF validation fails, THEN THE System SHALL provide meaningful error messages

### Requirement 10: Documentation and Maintenance

**User Story:** As a developer, I want clear documentation of type fixes and decisions, so that future maintenance is easier.

#### Acceptance Criteria

1. WHEN THE System fixes type errors, THE System SHALL document the fix approach in code comments
2. WHEN THE System uses workarounds, THE System SHALL explain why they are necessary
3. WHERE complex types are defined, THE System SHALL provide JSDoc comments
4. WHEN THE System makes breaking changes, THE System SHALL document migration steps
5. IF type definitions change, THEN THE System SHALL update related documentation
