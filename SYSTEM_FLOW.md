```mermaid
# Smart Revision System - Flow Diagram

## System Architecture

┌─────────────────────────────────────────────────────────────────────────┐
│                         SMART REVISION SYSTEM                            │
└─────────────────────────────────────────────────────────────────────────┘

## Data Flow

1. USER ADDS PROBLEM
   ├─ Title, Statement, Code, Intuition
   ├─ Confidence Level (1-10)
   ├─ Category, Difficulty
   └─ Auto-set: lastRevised = now, revisionCount = 0

2. TIME PASSES (System calculates in real-time)
   ├─ Days since lastRevised: 0 → 1 → 2 → ... → 14 → 28 → ...
   ├─ Confidence Decay: 0% → 0% → ... → 10% → 20% → ...
   └─ Adjusted Confidence: Original * (1 - decay)

3. USER OPENS REVISION DASHBOARD (/main-revision)
   ├─ Fetch all problems from database
   ├─ Calculate for each problem:
   │   ├─ Days since last revision
   │   ├─ Confidence decay percentage
   │   ├─ Adjusted confidence
   │   └─ Priority score
   ├─ Group by urgency:
   │   ├─ 🔴 Urgent (< 4)
   │   ├─ 🟠 High (4-6)
   │   ├─ 🟡 Medium (6-8)
   │   └─ 🟢 Low (8-10)
   └─ Display statistics

4. USER SELECTS PROBLEM
   ├─ Navigate to /revision/[id]
   ├─ Display problem statement
   ├─ User attempts solution
   ├─ Reveal intuition (optional)
   ├─ Reveal solution code (optional)
   └─ Compare approaches

5. USER COMPLETES REVISION
   ├─ Rate new confidence (1-10)
   ├─ Click "Complete Revision"
   ├─ API PATCH /api/problems/revision
   │   ├─ Update lastRevised = now
   │   ├─ Increment revisionCount++
   │   └─ Update Confidence = newValue
   └─ Redirect to dashboard

6. CYCLE REPEATS
   └─ Problem will reappear based on new confidence & time


## Priority Score Calculation

┌──────────────────────────────────────────────────┐
│  Priority Score = Lower is Higher Priority       │
├──────────────────────────────────────────────────┤
│                                                  │
│  Components:                                     │
│  ┌────────────────────────────────────────┐    │
│  │ 1. Adjusted Confidence (60% weight)    │    │
│  │    - After applying time decay         │    │
│  │    - Lower confidence = Higher priority│    │
│  └────────────────────────────────────────┘    │
│                                                  │
│  ┌────────────────────────────────────────┐    │
│  │ 2. Time Since Revision (30% weight)    │    │
│  │    - Days since last revised           │    │
│  │    - More days = Higher priority       │    │
│  └────────────────────────────────────────┘    │
│                                                  │
│  ┌────────────────────────────────────────┐    │
│  │ 3. Difficulty Level (10% weight)       │    │
│  │    - Problem difficulty 1-10           │    │
│  │    - Harder = Slightly higher priority │    │
│  └────────────────────────────────────────┘    │
│                                                  │
│  Formula:                                        │
│  score = (confidence * 0.6)                     │
│        - (time/30 * 10 * 0.3)                   │
│        - (difficulty * 0.1 * 0.5)               │
│                                                  │
└──────────────────────────────────────────────────┘


## Confidence Decay Timeline

Week 0  ▓▓▓▓▓▓▓▓▓▓ 100% (Original: 10/10)
        ↓
Week 2  ▓▓▓▓▓▓▓▓▓░  90% (Adjusted: 9/10)  [-10%]
        ↓
Week 4  ▓▓▓▓▓▓▓▓░░  80% (Adjusted: 8/10)  [-20%]
        ↓
Week 6  ▓▓▓▓▓▓▓░░░  70% (Adjusted: 7/10)  [-30%]
        ↓
Week 8  ▓▓▓▓▓▓░░░░  60% (Adjusted: 6/10)  [-40%]
        ↓
Week 10 ▓▓▓▓▓░░░░░  50% (Adjusted: 5/10)  [-50% MAX]


## User Journey Example

DAY 1: Add Problem "Two Sum"
┌─────────────────────────────────┐
│ Confidence: 8/10                │
│ lastRevised: 2025-10-01         │
│ revisionCount: 0                │
└─────────────────────────────────┘

DAY 15: Dashboard shows
┌─────────────────────────────────┐
│ Adjusted Confidence: 7.2/10     │
│ Days Since: 14                  │
│ Decay: -10%                     │
│ Priority: MEDIUM                │
└─────────────────────────────────┘

DAY 15: User revises & rates 9/10
┌─────────────────────────────────┐
│ Confidence: 9/10 (updated)      │
│ lastRevised: 2025-10-15         │
│ revisionCount: 1                │
└─────────────────────────────────┘

DAY 30: Dashboard shows
┌─────────────────────────────────┐
│ Adjusted Confidence: 8.1/10     │
│ Days Since: 15                  │
│ Decay: -10%                     │
│ Priority: LOW                   │
└─────────────────────────────────┘


## API Architecture

┌─────────────────────────────────────────────┐
│          Frontend (Next.js/React)           │
│                                             │
│  Pages:                                     │
│  • /main-revision ──────────┐              │
│  • /revision/[id] ──────────┤              │
└──────────────────────────────┼──────────────┘
                               │
                               ↓ Axios
┌──────────────────────────────────────────────┐
│          API Routes (Next.js)                │
│                                              │
│  GET  /api/problems/revision                │
│  • Fetch problems with filters              │
│  • Calculate decay & priority               │
│  • Group by urgency                         │
│  • Return stats                             │
│                                              │
│  PATCH /api/problems/revision               │
│  • Update lastRevised                       │
│  • Increment revisionCount                  │
│  • Update confidence                        │
└──────────────────────────────────────────────┘
                               │
                               ↓ Mongoose
┌──────────────────────────────────────────────┐
│          Database (MongoDB)                  │
│                                              │
│  Collections:                                │
│  • problems                                  │
│    ├─ userId                                │
│    ├─ title                                 │
│    ├─ problemStatement                      │
│    ├─ myCode                                │
│    ├─ intuition                             │
│    ├─ Confidence                            │
│    ├─ lastRevised         ← NEW            │
│    ├─ revisionCount       ← NEW            │
│    ├─ category                              │
│    ├─ difficulty                            │
│    └─ timestamps                            │
└──────────────────────────────────────────────┘


## File Structure

Frontend_Backend/
  src/
    app/
      main-revision/
        page.tsx                    ← Main dashboard
      revision/
        [id]/
          page.tsx                  ← Problem detail
      api/
        problems/
          revision/
            route.ts                ← API endpoints
    
    utils/
      revisionAlgorithm.ts          ← Core logic
    
    lib/
      models/
        Problem.ts                  ← Updated schema


## Revision Modes Comparison

MODE             | FILTER CRITERIA                    | USE CASE
─────────────────┼────────────────────────────────────┼─────────────────────
Priority         | confidence < 7 OR days > 5         | Daily practice
Urgent           | adjusted confidence < 6             | Focus weak areas
Needs Revision   | confidence < 7 OR days > 7         | Weekly review
All              | All problems sorted by priority     | Full catalog


## Color Coding System

Confidence  │ Color   │ Label              │ Action
────────────┼─────────┼────────────────────┼───────────────────────
1-3         │ 🔴 Red  │ Need to relearn    │ Revise immediately
4-5         │ 🟠 Org  │ Shaky              │ Revise within 2 days
6-7         │ 🟡 Yel  │ Decent grasp       │ Revise within 1 week
8-9         │ 🔵 Blu  │ Strong             │ Review monthly
10          │ 🟢 Grn  │ Complete mastery   │ Review quarterly
```
