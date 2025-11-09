# Implementation Plan - Variable Grouping & Demographic Improvements

## Overview

Implementation tasks for case-insensitive variable grouping and smart demographic detection with improved UI.

---

## Phase 1: Enhanced Variable Grouping Service

- [x] 1. Update Variable Grouping Service with case-insensitive matching





  - [x] 1.1 Add `normalizeForMatching()` method to convert names to lowercase


    - Convert variable names to lowercase for pattern matching
    - Preserve original case in results
    - _Requirements: 1.1, 1.2, 1.3_
  

  - [x] 1.2 Add `getMostCommonCase()` method to determine group name

    - Count case variations (EM, Em, em)
    - Return most frequent case for group name
    - Handle ties by preferring title case
    - _Requirements: 1.5_
  

  - [x] 1.3 Implement `suggestGroupsCaseInsensitive()` method

    - Normalize all variable names before matching
    - Group by normalized prefix patterns
    - Generate suggestions with most common case
    - Return confidence scores
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  

  - [x] 1.4 Add `validateGroupName()` method

    - Check for empty names
    - Check for duplicate names
    - Return validation result with error message
    - _Requirements: 6.2_

- [x] 2. Update TypeScript interfaces for grouping





  - [x] 2.1 Add `VariableGroup` interface


    - id, name, variables, createdAt, updatedAt, isCustom
    - _Requirements: 2.1, 2.2_
  
  - [x] 2.2 Update `VariableGroupSuggestion` interface


    - Add pattern field ('prefix' | 'numbering' | 'semantic')
    - Add editable flag
    - _Requirements: 2.3_

---

## Phase 2: Smart Demographic Detection Service

- [x] 3. Enhance Demographic Detection Service






  - [x] 3.1 Implement `detectDemographics()` method

    - Analyze all variables for demographic likelihood
    - Return suggestions sorted by confidence
    - Filter out low-confidence suggestions (< 0.6)
    - _Requirements: 4.1, 4.2_
  

  - [x] 3.2 Implement `analyzeDemographic()` private method


    - Check for demographic keywords (age, gender, income, etc.)
    - Calculate confidence score based on keyword matches
    - Detect demographic type (nominal, ordinal, continuous)
    - Generate reasons for suggestion
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 3.3 Add `generateSemanticName()` method

    - Convert column name to human-readable format
    - Handle underscores and camelCase
    - Capitalize properly
    - _Requirements: 4.4_
  

  - [x] 3.4 Add Vietnamese keyword support


    - Add Vietnamese demographic keywords (tuoi, gioi_tinh, thu_nhap, etc.)
    - Support bilingual detection
    - _Requirements: 4.1_

- [x] 4. Update TypeScript interfaces for demographics





  - [x] 4.1 Add `DemographicSuggestion` interface


    - variable, confidence, type, reasons, autoSelected
    - _Requirements: 4.2, 4.3_
  
  - [x] 4.2 Update `DemographicVariable` interface


    - Add confidence and reasons fields
    - _Requirements: 4.4_

---

## Phase 3: Variable Grouping UI Components

- [x] 5. Create VariableGroupingPanel component






  - [x] 5.1 Create main panel structure

    - Suggestions section with accept/reject actions
    - Current groups section with management actions
    - Ungrouped variables section
    - Save button with unsaved changes indicator
    - _Requirements: 2.1, 2.2, 5.1, 6.5_
  

  - [x] 5.2 Implement auto-suggestion on mount




    - Call `suggestGroupsCaseInsensitive()` on component mount
    - Display suggestions with confidence scores
    - Show accept/reject buttons
    - _Requirements: 2.1, 2.2_

  -

  - [x] 5.3 Implement auto-save hook








    - Save to localStorage every 30 seconds
    - Track unsaved changes
    - Show save indicator
    - _Requirements: 7.1, 7.2_

- [x] 6. Create GroupCard component




  - [x] 6.1 Implement inline name editing


    - Click group name to edit
    - Show input field with current name
    - Save on Enter or blur
    - Cancel on Escape
    - _Requirements: 2.2, 2.3, 5.2_
  
  - [x] 6.2 Add group name validation

    - Validate on save
    - Show error toast for invalid names
    - Prevent saving empty or duplicate names
    - _Requirements: 2.2, 6.2_
  
  - [x] 6.3 Implement variable management

    - Add variables dropdown
    - Remove variable button on each chip
    - Show variable count
    - _Requirements: 5.3, 5.4_
  
  - [x] 6.4 Add delete group action

    - Show confirmation dialog
    - Remove group and ungroup variables
    - _Requirements: 5.5_

- [x] 7. Create supporting components





  - [x] 7.1 Create SuggestionCard component


    - Display suggestion with confidence
    - Show reason for grouping
    - Accept/reject buttons
    - _Requirements: 2.1_
  
  - [x] 7.2 Create VariableChip component


    - Display variable name
    - Remove button
    - Hover effects
    - _Requirements: 5.4_
  
  - [x] 7.3 Create UngroupedVariables component


    - List ungrouped variables
    - Drag to group or click to add
    - _Requirements: 5.3_

---

## Phase 4: Demographic Selection UI Components

- [x] 8. Create DemographicSelectionPanel component





  - [x] 8.1 Create main panel structure


    - Smart detection banner
    - Variable list with checkboxes
    - Selected demographics configuration section
    - _Requirements: 3.1, 3.2, 3.3_
  

  - [x] 8.2 Implement auto-detection on mount
















    - Call `detectDemographics()` on component mount
    - Auto-select high-confidence suggestions (> 0.8)
    - Display detection results
    - _Requirements: 4.1, 4.2, 4.5_

  
  - [x] 8.3 Implement checkbox toggle logic






    - Toggle demographic selection
    - Add/remove from demographics list
    - Apply smart defaults on add
    - _Requirements: 3.2, 3.3, 4.4_
-

- [x] 9. Create DemographicVariableRow component




  - [x] 9.1 Implement checkbox with visual indicators


    - Checkbox for selection
    - Blue background for selected
    - Green ring for auto-detected
    - _Requirements: 3.2, 3.3, 4.5_
  
  - [x] 9.2 Display suggestion information

    - Show confidence score
    - Show detected type
    - Show reasons for suggestion
    - _Requirements: 4.2, 4.3_
  
  - [x] 9.3 Add configure button

    - Show for selected variables
    - Open configuration modal/panel
    - _Requirements: 3.3_
-

- [x] 10. Create DemographicConfigCard component




  - [x] 10.1 Implement semantic name editing


    - Editable text field
    - Auto-generated default
    - _Requirements: 4.4_
  
  - [x] 10.2 Implement type selection

    - Dropdown for nominal/ordinal/continuous
    - Auto-selected based on detection
    - _Requirements: 4.4_
  
  - [x] 10.3 Add rank/category configuration

    - Show rank creator for ordinal/continuous
    - Show category list for nominal
    - _Requirements: 3.3_

---

## Phase 5: State Management & Persistence

- [x] 11. Implement auto-save functionality






  - [x] 11.1 Create useAutoSave hook

    - Save to localStorage every 30 seconds
    - Debounce save operations
    - Track last saved timestamp
    - _Requirements: 7.1_
  

  - [x] 11.2 Implement localStorage backup

    - Save groups and demographics to localStorage
    - Restore on component mount
    - Clear after successful database save
    - _Requirements: 7.1, 7.3_
  

  - [x] 11.3 Add unsaved changes indicator

    - Track dirty state
    - Show indicator when changes exist
    - Clear after save
    - _Requirements: 6.5_

- [x] 12. Implement database persistence





  - [x] 12.1 Create save API endpoint


    - POST /api/analysis/groups/save
    - Save groups and demographics
    - Return success/error
    - _Requirements: 7.2_
  
  - [x] 12.2 Implement retry logic


    - Retry up to 3 times on failure
    - Exponential backoff (1s, 2s, 4s)
    - Keep in localStorage if all retries fail
    - _Requirements: 7.5_
  
  - [x] 12.3 Add success/error feedback


    - Show toast on successful save
    - Show error toast on failure
    - Display retry status
    - _Requirements: 6.1, 7.4_

---

## Phase 6: Integration & Testing
-

- [x] 13. Integrate with existing workflow




  - [x] 13.1 Update data-collection-step component
    - Add VariableGroupingPanel
    - Add DemographicSelectionPanel
    - Wire up save handlers
    - _Requirements: All_
  
  - [x] 13.2 Update analysis workflow


    - Pass groups to analysis execution
    - Pass demographics to analysis execution
    - _Requirements: All_

- [ ]* 14. Add unit tests
  - [ ]* 14.1 Test VariableGroupingService
    - Test case-insensitive matching
    - Test group name validation
    - Test most common case detection
    - _Requirements: 1.1, 1.2, 1.3, 1.5_
  
  - [ ]* 14.2 Test DemographicService
    - Test keyword detection
    - Test confidence scoring
    - Test semantic name generation
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ]* 15. Add integration tests
  - [ ]* 15.1 Test variable grouping flow
    - Upload CSV → Auto-suggest → Edit → Save
    - Test case-insensitive grouping (EM1, Em2, em3)
    - _Requirements: 1.1, 1.2, 1.3, 2.2, 2.3_
  
  - [ ]* 15.2 Test demographic selection flow
    - Upload CSV → Auto-detect → Review → Configure → Save
    - Test checkbox selection
    - Test auto-selection
    - _Requirements: 3.2, 3.3, 4.1, 4.2, 4.5_

---

## Phase 7: Polish & Documentation


- [x] 16. Add visual polish





  - [x] 16.1 Add animations

    - Fade in/out for suggestions
    - Slide in for edit mode
    - Smooth transitions
    - _Requirements: 6.1_
  

  - [x] 16.2 Add hover effects

    - Highlight group on hover
    - Show edit icon on hover
    - _Requirements: 6.4_
  
  - [x] 16.3 Add loading states


    - Show skeleton while detecting
    - Show spinner while saving
    - _Requirements: 6.1_

- [ ]* 17. Create user documentation
  - [ ]* 17.1 Write user guide
    - How to use variable grouping
    - How to select demographics
    - How to edit and save
  
  - [ ]* 17.2 Create demo video/screenshots
    - Show case-insensitive grouping
    - Show smart detection
    - Show editing workflow

---

## Summary

**Total Tasks**: 17 main tasks, 45+ sub-tasks  
**Estimated Time**: 2-3 weeks  
**Priority**: High - Improves core workflow UX

### Task Breakdown
- Phase 1 (Services): 4 tasks - 2-3 days
- Phase 2 (Detection): 4 tasks - 2-3 days
- Phase 3 (Grouping UI): 7 tasks - 4-5 days
- Phase 4 (Demographic UI): 10 tasks - 4-5 days
- Phase 5 (Persistence): 9 tasks - 2-3 days
- Phase 6 (Integration): 6 tasks - 2-3 days
- Phase 7 (Polish): 5 tasks - 1-2 days

### Key Features
✅ Case-insensitive variable grouping (EM1, Em2, em3 → "Em")  
✅ Editable group names with inline editing  
✅ Smart demographic detection with confidence scores  
✅ Checkbox selection with auto-selection  
✅ Auto-save every 30 seconds  
✅ Visual feedback and validation

---

**Date**: November 9, 2024  
**Status**: Ready for Implementation  
**Next**: Begin Phase 1 - Enhanced Variable Grouping Service
