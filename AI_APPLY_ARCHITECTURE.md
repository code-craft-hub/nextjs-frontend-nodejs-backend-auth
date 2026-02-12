# AI Apply Navigation Architecture Refactor

## Problem Statement

After migrating from Firebase (frontend-generated IDs) to PostgreSQL/Drizzle ORM (backend-generated IDs), the application had mismatched ID management:

1. **Frontend-generated UUIDs were wasted** - Created in AIApplyInput but never used to fetch actual documents
2. **Backend IDs weren't URL route params** - Backend returned `documentId`, but URL paths had frontend-generated UUIDs
3. **ID collision risk** - Generic `documentId` for both cover letters and resumes caused type confusion
4. **Navigation coupling** - Navigation relied on URL params that didn't match actual resource IDs

## Solution Architecture

### Core Principle: Placeholder → Real ID Pattern

The solution uses a **two-stage URL strategy**:

1. **Initial Route**: Use `"pending"` as a placeholder ID in the route path
2. **URL Update**: Once backend generates the actual ID, replace URL with real ID using `router.replace()`
3. **Typed Document IDs**: Use distinct parameter names (`coverLetterDocId`, `resumeDocId`) to prevent collisions

### Navigation Flow (AI Apply with Master CV disabled)

```
User submits job description + extracted text
        ↓
AIApplyInput → `/dashboard/tailor-cover-letter/pending?jobDescription=...&recruiterEmail=...&aiApply=true`
        ↓
TailorCoverLetter (backend generates coverLetterDocId)
        ↓
router.replace() → `/dashboard/tailor-cover-letter/pending?coverLetterDocId=xxx&jobDescription=...&recruiterEmail=...&aiApply=true`
        ↓
(Automatic redirect after 3s)
        ↓
TailorResume → `/dashboard/tailor-resume/pending?coverLetterDocId=xxx&jobDescription=...&recruiterEmail=...&aiApply=true`
        ↓
TailorResume (backend generates resumeDocId, updates URL)
        ↓
router.replace() → `/dashboard/tailor-resume/pending?coverLetterDocId=xxx&resumeDocId=yyy&jobDescription=...&recruiterEmail=...&aiApply=true`
        ↓
(Automatic redirect)
        ↓
Preview → `/dashboard/preview?coverLetterDocId=xxx&resumeDocId=yyy&jobDescription=...&recruiterEmail=...`
```

### Navigation Flow (AI Apply with Master CV enabled)

```
User submits job description + extracted text
        ↓
AIApplyInput → `/dashboard/tailor-cover-letter/pending?jobDescription=...&recruiterEmail=...&aiApply=true`
        ↓
TailorCoverLetter (backend generates coverLetterDocId)
        ↓
router.push() → `/dashboard/preview?coverLetterDocId=xxx&baseResume={userDefaultCVId}&aiApply=true&recruiterEmail=...`
```

## Implementation Details

### 1. Navigation Helper Module

**File**: `src/lib/utils/ai-apply-navigation.ts`

```typescript
// Creates type-safe URLs for each navigation step
buildCoverLetterStartUrl(); // Initial route
buildResumeStartUrl(); // After cover letter generation
buildCoverLetterUpdateUrl(); // Update URL with real coverLetterDocId
buildResumeUpdateUrl(); // Update URL with real resumeDocId
buildPreviewUrl(); // Final navigation to preview
isPlaceholderId(); // Check if ID is still "pending"
```

**Key Design Decisions**:

- All parameters are consolidated in URL (not split between path and query)
- Route path always uses `"pending"` for placeholder (never changes except via router.replace)
- Search params contain the actual document IDs once generated
- `jobDescription` is preserved throughout the flow (needed for preview and download)

### 2. AIApplyInput.tsx

**Before**:

```typescript
// ❌ Generated wasted UUID never used by backend
router.push(`/dashboard/tailor-cover-letter/${uuidv4()}?${params}`);
```

**After**:

```typescript
// ✅ Uses placeholder ID, lets backend generate actual ID
const startUrl = buildCoverLetterStartUrl(fullJobDescription, recruiterEmail);
router.push(startUrl);
```

**Changes**:

- Removed `import { v4 as uuidv4 } from "uuid"`
- Use `buildCoverLetterStartUrl()` helper for consistent URL generation
- No dependency on frontend-generated IDs

### 3. TailorCoverLetter.tsx

**Key Changes**:

1. **Extract IDs from search params** (not as React props):

```typescript
const searchParams = useSearchParams();
const coverLetterDocId = searchParams.get("coverLetterDocId");
const isGeneratorStep = isPlaceholderId(coverLetterDocId);
```

2. **Update URL when backend returns documentId**:

```typescript
useEffect(() => {
  if (state.documentId && !state.isStreaming && isGeneratorStep) {
    const newUrl = buildCoverLetterUpdateUrl(
      state.documentId,
      jobDescription,
      recruiterEmail,
    );
    router.replace(newUrl); // Use replace, not push
  }
}, [state.documentId, state.isStreaming, isGeneratorStep, ...]);
```

3. **Navigate to resume with real coverLetterDocId**:

```typescript
const resumeUrl = buildResumeStartUrl(
  state.documentId, // The documentId returned by backend
  jobDescription,
  recruiterEmail,
);
router.push(resumeUrl);
```

### 4. TailorResume.tsx

**Key Changes**:

1. **Extract IDs from search params**:

```typescript
const searchParams = useSearchParams();
const coverLetterDocId = searchParams.get("coverLetterDocId");
const resumeDocId = searchParams.get("resumeDocId");
const isGeneratorStep = isPlaceholderId(resumeDocId);
```

2. **Only fetch if we have real ID**:

```typescript
const { data: existingResume } = useQuery(
  resumeQueries.detail(resumeDocId ?? ""),
);
```

3. **Fetch using documentId only (not route param)**:

```typescript
const { streamData, documentId } = useResumeStream(
  API_URL,
  resumeDocId || "pending",
);
```

4. **Update URL when generation completes**:

```typescript
useEffect(() => {
  if (documentId && streamStatus.isComplete && isGeneratorStep) {
    const newUrl = buildResumeUpdateUrl(
      coverLetterDocId,
      documentId,
      jobDescription,
      recruiterEmail,
    );
    router.replace(newUrl);
  }
}, [documentId, streamStatus.isComplete, isGeneratorStep, ...]);
```

## Data Flow During Generation

```
User Input
  ↓
[TailorCoverLetter] useResumeStream Hook
  ↓
Backend API Call → Streaming Response
  ↓
state.documentId = "xxx" (backend-generated ID)
  ↓
Build URL with coverLetterDocId=xxx
  ↓
router.replace() updates browser URL
  ↓
Component queries database with documentId "xxx"
  ↓
Display generated content
```

## Important Patterns

### 1. router.replace() vs router.push()

```typescript
// Use replace() when updating the same page with real ID
// ✅ Correct: User sees Updated URL with real ID
router.replace(buildCoverLetterUpdateUrl(...));

// Use push() when navigating to next step
// ✅ Correct: Browser history maintained
router.push(buildResumeStartUrl(...));
```

### 2. Conditional Generation

```typescript
// Check if we're in generation step (placeholder ID) before starting
if (isGeneratorStep && !hasStartedRef.current) {
  startStream(...);
}
```

### 3. URL Parameters as State Container

The URL search parameters serve as the **source of truth**:

- Don't rely on React state for IDs that need persistence across reloads
- Extract from `searchParams` on each render
- Critical for the "resume if interrupted" feature

```typescript
// ✅ Correct: ID persists across reloads
const coverLetterDocId = searchParams.get("coverLetterDocId");

// ❌ Avoid: ID lost on reload
const [coverLetterDocId] = useState(props.coverLetterDocId);
```

## Benefits of This Architecture

| Problem             | Solution                       | Benefit                                              |
| ------------------- | ------------------------------ | ---------------------------------------------------- |
| Wasted UUIDs        | Use "pending" placeholder      | Backend ID is single source of truth                 |
| URL param mismatch  | Extract IDs from search params | Real IDs always available for fetching               |
| ID collisions       | Use typed param names          | Clear semantics: `coverLetterDocId` vs `resumeDocId` |
| Navigation coupling | Helper functions               | Consistent, maintainable URL construction            |
| Interrupted flows   | URL as state                   | Resume from any step without data loss               |

## Edge Cases & Handling

### Case 1: Page Reload During Generation

```
User is at /dashboard/tailor-cover-letter/pending?coverLetterDocId=xxx
↓
Page reloads
↓
Component reads coverLetterDocId from URL params
↓
Fetches existing document from database
↓
Displays content
```

### Case 2: Back Button After Generation

```
Generated URL: /dashboard/tailor-cover-letter/pending?coverLetterDocId=xxx
↓
User clicks back in browser
↓
Returns to previous page with all original params intact
↓
User can re-navigate forward
```

### Case 3: Direct Link Sharing

```
User shares: /dashboard/tailor-cover-letter/pending?coverLetterDocId=xxx
↓
Recipient clicks link
↓
Component reads ID from URL
↓
Fetches and displays document
↓
Works exactly like original flow
```

## Migration Checklist

- [x] Create `ai-apply-navigation.ts` helper module
- [x] Refactor `AIApplyInput.tsx` (remove UUID generation)
- [x] Refactor `TailorCoverLetter.tsx` (extract params, update URL)
- [x] Refactor `TailorResume.tsx` (extract params, update URL)
- [x] Update page.tsx files (stop passing props)
- [x] Remove old `createCoverLetterOrderedParams` / `createResumeOrderedParams` usage
- [x] Test navigation flow end-to-end
- [x] Test page reloads at each step
- [x] Test back button functionality

## Future Improvements

1. **Query Param Validation**: Add validation to ensure required params are present
2. **URL Expiry**: Add timestamp to URLs to prevent stale document references
3. **Error Recovery**: Implement retry logic if document fetch fails after generation
4. **Analytics**: Track which step users abandon the flow
5. **Timeout Handling**: Clear "pending" URLs that never complete generation after X minutes

## Testing Scenarios

1. **Happy Path**: Complete flow from start to finish
2. **Page Reload**: Reload at each step and verify data persists
3. **Back/Forward**: Navigate browser history
4. **Direct Link**: Share generated URL and open in new tab
5. **Network Error**: Simulate generation failure and retry
6. **Master CV Path**: Test flow when `useMasterCV=true`
