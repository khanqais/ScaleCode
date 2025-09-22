# CRUD Operations and Cache Invalidation Testing Checklist

## ✅ Current Implementation Status

### Add Problem Page (`/add-problem`)
- ✅ Creates new problem via POST `/api/problems`
- ✅ Invalidates caches for:
  - `/api/problems?limit=6` (recent problems for organize page)
  - `/api/problems` (full problems list for problems page)  
  - `/api/users/stats` (user statistics)
- ✅ Redirects to organize page after success

### Problems Page (`/problems`)
- ✅ Uses SWR to fetch `/api/problems` with proper memoization
- ✅ DELETE operation invalidates:
  - Local cache via `mutateProblems()` 
  - `/api/problems?limit=6` globally
  - `/api/users/stats` globally
- ✅ Real-time filtering and search
- ✅ Proper error handling and loading states

### Organize Page (`/organize`)
- ✅ Uses SWR for `/api/problems?limit=6` (recent problems)
- ✅ Uses SWR for `/api/users/stats` (user statistics)
- ✅ Revalidates on focus and user changes
- ✅ Manual refresh button available
- ✅ 60-second deduplication interval

## 🧪 Manual Testing Steps

### Test 1: Create Problem → Check All Pages Update
1. Go to `/add-problem`
2. Fill out form and submit
3. Should redirect to `/organize` 
4. Check that "Total Problems" count increased
5. Check that new problem appears in "Recent Problems"
6. Navigate to `/problems`
7. Verify new problem appears in the full list

### Test 2: Delete Problem → Check All Pages Update  
1. Go to `/problems`
2. Click trash icon on any problem
3. Confirm deletion
4. Problem should disappear immediately from list
5. Navigate to `/organize`
6. Check that "Total Problems" count decreased
7. If deleted problem was recent, it should be removed from "Recent Problems"

### Test 3: Cross-Page Real-Time Updates
1. Open `/organize` in one browser tab
2. Open `/problems` in another browser tab
3. Create a problem from `/add-problem`
4. Both tabs should show updated data without manual refresh
5. Delete a problem from `/problems` tab
6. `/organize` tab should show updated stats

## 🔧 Key Technical Details

### SWR Configuration
```tsx
// Organize page SWR config
{
  revalidateOnFocus: true,
  revalidateOnReconnect: false,
  dedupingInterval: 60000, // 1 minute
}

// Problems page SWR config  
{
  dedupingInterval: 60000,
  revalidateOnFocus: true,
}
```

### Cache Invalidation Strategy
```tsx
// After CREATE (add-problem)
await mutate('/api/problems?limit=6', fetch('/api/problems?limit=6').then(res => res.json()))
await mutate('/api/problems', fetch('/api/problems').then(res => res.json()))  
await mutate('/api/users/stats', fetch('/api/users/stats').then(res => res.json()))

// After DELETE (problems page)
await mutateProblems()  // Local SWR mutate
await mutate('/api/problems?limit=6')  // Global mutate
await mutate('/api/users/stats')  // Global mutate
```

## 🐛 Potential Issues to Watch For

1. **Cache Key Mismatches**: Ensure exact same keys are used across components
2. **Timing Issues**: SWR revalidation might have slight delays
3. **Network Errors**: Check error handling during cache invalidation
4. **Browser Focus**: SWR revalidateOnFocus might cause unnecessary requests
5. **Memory Leaks**: Multiple mutate calls could cause performance issues

## 🎯 Expected Behavior

✅ **Immediate Updates**: UI should update instantly after CRUD operations
✅ **Cross-Page Sync**: Changes on one page appear on other pages  
✅ **Persistent State**: Refreshing page should show same data state
✅ **Error Recovery**: Failed operations should show proper error messages
✅ **Loading States**: Users should see loading indicators during operations
