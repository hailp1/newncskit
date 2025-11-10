# 📋 Next Steps - Remaining Issues

## ✅ Completed So Far

1. ✅ Added "Accept All" button for suggestions
2. ✅ Show role tagging for all variables (grouped + ungrouped)
3. ✅ Added display name input for each variable
4. ✅ Fixed Save & Continue button (always enabled)
5. ✅ Improved Model Preview empty states
6. ✅ Cleaned up 56 old files

**Total Commits:** 5 commits  
**Status:** All pushed to GitHub

---

## 🔧 Remaining Issues

### 1. Add Description Field ⏳

**Current:**
```
[Q1] [Display name input............] [Role Selector]
```

**Needed:**
```
[Q1] [Display name input............] [Role Selector]
     [Description textarea...........]
```

**Why:**
- Users want to add both name AND description
- Description helps document what the variable measures
- Useful for team collaboration

**Implementation:**
- Change layout from horizontal to vertical
- Add textarea below display name input
- Use `semanticName` field for description
- Auto-save with other changes

---

### 2. Fix Demographic Detection ⏳

**Issue:**
"Smart Demographic Detection: No demographic variables detected"

**Current State:**
- ✅ Service exists: `demographic.service.ts`
- ✅ Method works: `detectDemographics()`
- ❌ Not being called or not showing results

**Possible Causes:**
1. `DemographicSelectionPanel` not rendered in workflow
2. Detection running but no matches found
3. Results not displayed correctly

**Need to Check:**
1. Where is `DemographicSelectionPanel` used?
2. Is it in the current workflow?
3. Are demographic keywords matching?

---

## 🔍 Investigation Needed

### Check Demographic Panel Usage

```bash
# Find where DemographicSelectionPanel is imported
grep -r "DemographicSelectionPanel" frontend/src/

# Check if it's in the main workflow
grep -r "DemographicSelectionPanel" frontend/src/app/
```

### Test Demographic Detection

Create test with obvious demographic variables:
- `age`, `gender`, `income`, `education`
- Should detect with high confidence
- If not detecting, check service logic

---

## 📝 Implementation Plan

### Phase 1: Add Description Field (30 min)

1. Read current `VariableGroupingPanel.tsx` state
2. Change variable display layout:
   - From: `flex items-center` (horizontal)
   - To: `flex flex-col` (vertical)
3. Add textarea for description
4. Test auto-save
5. Commit and push

### Phase 2: Fix Demographic Detection (1 hour)

1. Find where `DemographicSelectionPanel` should be
2. Check if it's in `NewAnalysisPage` workflow
3. If missing, add it to workflow
4. If present, debug why not detecting
5. Test with sample data
6. Commit and push

---

## 🧪 Testing Checklist

### Description Field
- [ ] Textarea appears below display name
- [ ] Can type multi-line descriptions
- [ ] Description saves with other changes
- [ ] Description persists after reload
- [ ] Works for grouped variables
- [ ] Works for ungrouped variables

### Demographic Detection
- [ ] Panel appears in workflow
- [ ] Detection runs on page load
- [ ] Detects obvious demographics (age, gender)
- [ ] Shows confidence scores
- [ ] Can accept/reject suggestions
- [ ] Saves selected demographics

---

## 💡 Quick Wins

### If Time is Limited

**Priority 1:** Description Field
- Easier to implement
- Clear user request
- No dependencies

**Priority 2:** Demographic Detection
- More complex
- Need to understand workflow
- May require architecture changes

---

## 📞 Questions for User

Before implementing, confirm:

1. **Description Field:**
   - Should it be multi-line (textarea)?
   - How many rows?
   - Required or optional?

2. **Demographic Detection:**
   - Is this feature critical?
   - What variables should it detect?
   - Should it be automatic or manual?

---

## 🚀 Ready to Continue

When ready to implement:

1. Confirm which issue to tackle first
2. Get latest code state
3. Implement changes
4. Test thoroughly
5. Commit and push

**Current Status:** ⏸️ Waiting for direction

---

**Date:** November 10, 2025  
**Version:** 2.0.3  
**Next Version:** 2.0.4 (with description + demographic fixes)
