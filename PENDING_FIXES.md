# Pending Fixes

## 1. Add Description Field for Variables

Cần thêm textarea cho description (semanticName) cùng với display name input.

### Current Layout
```
[Q1] [Display name input............] [Role Selector]
```

### Desired Layout
```
[Q1] [Display name input............] [Role Selector]
     [Description textarea...........]
```

### Implementation
Thay đổi layout từ flex row sang flex column cho variable info.

## 2. Fix Demographic Detection

Demographic detection service đã có (`demographic.service.ts`) nhưng không được gọi đúng cách.

### Issue
- Service có method `detectDemographics()` 
- Được gọi trong `DemographicSelectionPanel.tsx`
- Nhưng panel này có thể không được render

### Solution
Cần kiểm tra:
1. `DemographicSelectionPanel` có được render không?
2. Nếu không, cần thêm vào workflow
3. Hoặc integrate detection vào `VariableGroupingPanel`

## Next Steps

1. Read current file state after autofix
2. Apply description field changes carefully
3. Check where DemographicSelectionPanel is used
4. Fix demographic detection integration
