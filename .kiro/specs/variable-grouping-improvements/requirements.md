# Requirements Document - Variable Grouping & Demographic Improvements

## Introduction

Cải thiện chức năng gom biến tự động và chỉ định biến demographic trong hệ thống phân tích CSV. Hiện tại có 2 vấn đề chính:
1. Gom biến không xử lý case-insensitive (EM1, Em2, Em3 không được gom vào cùng nhóm)
2. Chưa có UI để user dễ dàng đổi tên nhóm và chỉ định biến demographic

## Glossary

- **Variable Grouping**: Tự động gom các biến có pattern giống nhau thành nhóm
- **Demographic Variable**: Biến nhân khẩu học (tuổi, giới tính, thu nhập, v.v.)
- **Case-Insensitive**: Không phân biệt chữ hoa/thường
- **Group Name**: Tên nhóm biến do hệ thống suggest hoặc user tự đặt
- **Pattern Detection**: Phát hiện pattern trong tên biến (prefix, numbering, semantic)

## Requirements

### Requirement 1: Case-Insensitive Variable Grouping

**User Story**: Là một researcher, tôi muốn hệ thống tự động gom các biến có tên giống nhau (không phân biệt hoa/thường) vào cùng một nhóm, để tôi không phải gom thủ công.

#### Acceptance Criteria

1. WHEN THE System analyzes variable names, THE System SHALL normalize all names to lowercase before pattern matching
2. WHEN variables "EM1", "Em2", "em3" exist, THE System SHALL group them into one group with suggested name "Em"
3. WHEN variables "Q1_Sat", "q2_sat", "Q3_SAT" exist, THE System SHALL group them into one group with prefix "Q"
4. WHEN THE System generates group suggestions, THE System SHALL preserve the original case in variable names
5. WHEN multiple case variations exist for same prefix, THE System SHALL use the most common case for group name

### Requirement 2: Editable Group Names

**User Story**: Là một researcher, tôi muốn có thể đổi tên nhóm biến do hệ thống suggest, để tên nhóm phù hợp với nghiên cứu của tôi.

#### Acceptance Criteria

1. WHEN THE System displays group suggestions, THE System SHALL show an editable text field for each group name
2. WHEN user clicks on a group name, THE System SHALL allow inline editing of the name
3. WHEN user changes a group name, THE System SHALL update the name immediately without page reload
4. WHEN user saves configuration, THE System SHALL persist the custom group names to database
5. WHEN user returns to edit, THE System SHALL display previously saved custom names

### Requirement 3: Demographic Variable Selection UI

**User Story**: Là một researcher, tôi muốn dễ dàng chỉ định biến nào là demographic, để phân tích theo nhóm nhân khẩu học.

#### Acceptance Criteria

1. WHEN THE System displays variable list, THE System SHALL show a checkbox or toggle for each variable
2. WHEN user marks a variable as demographic, THE System SHALL highlight it with distinct visual styling
3. WHEN user marks a variable as demographic, THE System SHALL show additional configuration options (semantic name, type, ranks)
4. WHEN THE System detects potential demographic variables, THE System SHALL pre-select them with visual indicator
5. WHEN user saves configuration, THE System SHALL save demographic selections to database

### Requirement 4: Smart Demographic Detection

**User Story**: Là một researcher, tôi muốn hệ thống tự động phát hiện biến demographic, để tiết kiệm thời gian cấu hình.

#### Acceptance Criteria

1. WHEN THE System analyzes variables, THE System SHALL detect demographic keywords (age, gender, income, education, location)
2. WHEN a variable name contains demographic keywords, THE System SHALL suggest it as demographic with confidence score
3. WHEN THE System suggests demographics, THE System SHALL show reason for suggestion
4. WHEN user accepts a suggestion, THE System SHALL auto-fill semantic name and type
5. WHEN user rejects a suggestion, THE System SHALL remember the rejection for future sessions

### Requirement 5: Group Management UI

**User Story**: Là một researcher, tôi muốn quản lý các nhóm biến (thêm, xóa, sửa), để tổ chức biến theo ý muốn.

#### Acceptance Criteria

1. WHEN THE System displays groups, THE System SHALL show actions: Edit Name, Add Variables, Remove Variables, Delete Group
2. WHEN user clicks "Edit Name", THE System SHALL show inline text editor
3. WHEN user clicks "Add Variables", THE System SHALL show dropdown of ungrouped variables
4. WHEN user clicks "Remove Variables", THE System SHALL allow multi-select removal
5. WHEN user clicks "Delete Group", THE System SHALL show confirmation dialog before deletion

### Requirement 6: Visual Feedback & Validation

**User Story**: Là một researcher, tôi muốn thấy feedback rõ ràng khi thao tác với nhóm biến, để biết hành động của mình có hiệu quả.

#### Acceptance Criteria

1. WHEN user performs an action, THE System SHALL show success/error message within 500ms
2. WHEN group name is invalid (empty, duplicate), THE System SHALL show validation error
3. WHEN group has less than 2 variables, THE System SHALL show warning
4. WHEN user hovers over a group, THE System SHALL highlight all variables in that group
5. WHEN changes are unsaved, THE System SHALL show "unsaved changes" indicator

### Requirement 7: Persistence & State Management

**User Story**: Là một researcher, tôi muốn các thay đổi được lưu tự động, để không mất công việc khi có sự cố.

#### Acceptance Criteria

1. WHEN user makes changes, THE System SHALL auto-save to localStorage every 30 seconds
2. WHEN user explicitly saves, THE System SHALL persist to database immediately
3. WHEN user returns after browser crash, THE System SHALL restore from localStorage
4. WHEN database save succeeds, THE System SHALL clear localStorage backup
5. WHEN database save fails, THE System SHALL retry up to 3 times with exponential backoff

---

**Date**: November 9, 2024  
**Status**: Requirements Complete  
**Next**: Design Document
