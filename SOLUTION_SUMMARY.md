# FAANG+ Solutions: Backend-Generated ID Management

## Executive Summary

You've identified a critical architectural issue during your Firebase→PostgreSQL migration. The solution implements a **placeholder-to-real ID pattern** that solves the mismatch between frontend-generated UUIDs and backend-generated document IDs.

## The Core Issue (Explained Like FAANG+ Would Ask)

**Interview Question Style**: "How would you handle URL parameter IDs that change during API calls when migrating from client-generated to server-generated IDs?"

**Your Situation**:

```
Before Migration (Firebase):
  Frontend generates UUID → Uses it in URL → Backend stores with that UUID

After Migration (PostgreSQL/Drizzle):
  Frontend generates UUID → Uses it in URL → Backend generates own UUID → Mismatch!
```

**The Problem**: You have three mismatched ID systems:

1. **Route params** (e.g., `/tailor-resume/abc123`) - Frontend UUID
2. **Search params** (e.g., `?documentId=xyz789`) - May be backend ID or frontend ID
3. **Database** - Has real backend-generated ID (only source of truth)

## The FAANG+ Solution

### Pattern Name: **Placeholder URL → Real ID Stream**

This is a **state management pattern** where URLs serve as a state container:

```
Initial State (User submits):
  URL: /tailor-cover-letter/pending?jobDescription=...
  ↓ (stream starts)

Intermediate State (Backend generates):
  URL: /tailor-cover-letter/pending?coverLetterDocId=abc123&jobDescription=...
  (router.replace updates URL, not router.push)
  ↓ (user autoproceeds)

Final State (Next page loads):
  URL: /tailor-resume/pending?coverLetterDocId=abc123&jobDescription=...
  ↓ (stream starts)
  ↓
  URL: /tailor-resume/pending?coverLetterDocId=abc123&resumeDocId=xyz789&jobDescription=...
```

### Why This Works

| Aspect                  | Design Decision                  | Reason                                                      |
| ----------------------- | -------------------------------- | ----------------------------------------------------------- |
| **Route param**         | Always `"pending"`               | Placeholder never changes; indicates generation in progress |
| **Search params**       | Real IDs when available          | Persists across reloads; available for database queries     |
| **URL source of truth** | Not React state                  | Survives page refreshes; works with browser history         |
| **router.replace()**    | Used for updating same page      | Doesn't create Back button confusion                        |
| **router.push()**       | Used for navigation to next step | Normal navigation, Back button works                        |

## Key Architectural Insights

### 1. **Typed Document IDs Prevent Collisions**

❌ **Bad**:

```typescript
// Which document is this?
const documentId = searchParams.get("documentId");
```

✅ **Good**:

```typescript
// Crystal clear what each ID represents
const coverLetterDocId = searchParams.get("coverLetterDocId");
const resumeDocId = searchParams.get("resumeDocId");
```

### 2. **Search Parameters as Persistent State**

❌ **Bad**:

```typescript
const [documentId] = useState(() => params.documentId);
// Lost on reload!
```

✅ **Good**:

```typescript
const documentId = searchParams.get("documentId");
// Always available from URL, survives reloads
```

### 3. **Helper Functions Prevent URL Construction Bugs**

❌ **Bad** (Inconsistent across components):

```typescript
// In AIApplyInput
router.push(
  `/dashboard/tailor-cover-letter/${uuid}?jobDescription=...&recruiterEmail=...`,
);

// In TailorCoverLetter
router.replace(`${pathname}?documentId=${id}&jobDescription=...`);
```

✅ **Good** (Single source of truth):

```typescript
const url = buildCoverLetterUpdateUrl(
  documentId,
  jobDescription,
  recruiterEmail,
);
router.replace(url);
```

## Comparison: Before vs After

### Before (The Problem)

```typescript
// AIApplyInput.tsx
const uuid = uuidv4(); // ← Wasted! Never used by backend
router.push(`/tailor-cover-letter/${uuid}?jobDescription=...`);
// URL: /tailor-cover-letter/550e8400-e29b-41d4-a716-446655440000?...

// TailorCoverLetter.tsx
const { data, documentId } = backend.generate(); // ← Backend returns real ID "doc123"
// Fetch query uses: documentId (real)
// But URL still has: 550e8400-e29b-41d4-a716-446655440000 (fake)
// Confusion! ← This causes "documentId" to exist in search params, route param to be ignored

// TailorResume.tsx
router.push(`/tailor-resume/${uuidv4()}?documentId=${documentId}...`); // ← Mixed again!
```

### After (The Solution)

```typescript
// AIApplyInput.tsx
router.push(buildCoverLetterStartUrl(jobDescription, recruiterEmail));
// URL: /tailor-cover-letter/pending?jobDescription=...&recruiterEmail=...

// TailorCoverLetter.tsx
const coverLetterDocId = searchParams.get("coverLetterDocId");
if (isPlaceholderId(coverLetterDocId)) { // No ID yet, generate
  const { documentId } = await startStream();
  router.replace(buildCoverLetterUpdateUrl(documentId, ...));
}
// URL updates to: /tailor-cover-letter/pending?coverLetterDocId=doc123&jobDescription=...

// TailorResume.tsx
const coverLetterDocId = searchParams.get("coverLetterDocId"); // Use the real ID from prev step
const resumeDocId = searchParams.get("resumeDocId");
if (isPlaceholderId(resumeDocId)) { // No ID yet, generate
  const { documentId } = await startStream();
  router.replace(buildResumeUpdateUrl(coverLetterDocId, documentId, ...));
}
// URL updates to: /tailor-resume/pending?coverLetterDocId=doc123&resumeDocId=doc456&...
```

## API Design Considerations

### What Your Backend Returns

Your streaming API should return:

```typescript
{
  documentId: "doc_123abc",  // ← Unique backend-generated ID
  content: "...",
  title: "...",
  // other fields
}
```

**Important**: The backend ID should be suitable for:

- URL parameter (no special characters)
- Database queries
- User-facing URLs (shareable)

### Query Patterns

```typescript
// Query using backend-generated ID
const { data } = useQuery(
  coverLetterQueries.detail(coverLetterDocId), // ← Real backend ID from URL
);

// Never use:
// coverLetterQueries.detail(routeParam) // ← Would be "pending", useless!
```

## For Code Review

**What to Check**:

1. [ ] No `uuidv4()` calls that create IDs for URL paths
2. [ ] All ID extractions use `searchParams.get("...")`, not props
3. [ ] `router.replace()` used for same-page URL updates
4. [ ] `router.push()` used for navigation to new page
5. [ ] Placeholder check: `if (isPlaceholderId(id)) { ... start generation ... }`
6. [ ] All API queries use real IDs from params, not route params

## Common Pitfalls to Avoid

```typescript
// ❌ MISTAKE 1: Using route param to query database
const { data } = useQuery(resumeQueries.detail(resumeId)); // resumeId="pending"!

// ✅ CORRECT: Use search param with real ID
const resumeDocId = searchParams.get("resumeDocId");
const { data } = useQuery(resumeQueries.detail(resumeDocId));

// ❌ MISTAKE 2: Mixing router.push and router.replace inconsistently
router.push(buildCoverLetterUpdateUrl(...)); // Creates unwanted history entry

// ✅ CORRECT: Use replace for same-page updates
router.replace(buildCoverLetterUpdateUrl(...));

// ❌ MISTAKE 3: Relying on component props for IDs that need to persist
<TailorResume resumeDocId={someId} /> // Lost on reload!

// ✅ CORRECT: Extract from URL whenever needed
const resumeDocId = searchParams.get("resumeDocId");

// ❌ MISTAKE 4: Not handling placeholder state
if (!documentId) { /* but might be "pending" */ }

// ✅ CORRECT: Explicit placeholder check
if (isPlaceholderId(documentId)) { /* start generation */ }
```

## Testing The Implementation

### Unit Test Example

```typescript
test("navigation builds correct URL with all parameters", () => {
  const url = buildCoverLetterUpdateUrl(
    "doc123",
    "job desc",
    "recruiter@example.com",
  );
  expect(url).toBe(
    "/dashboard/tailor-cover-letter/pending?coverLetterDocId=doc123&jobDescription=job+desc&recruiterEmail=recruiter%40example.com&aiApply=true",
  );
});

test("isPlaceholderId identifies pending IDs", () => {
  expect(isPlaceholderId("pending")).toBe(true);
  expect(isPlaceholderId(undefined)).toBe(true);
  expect(isPlaceholderId(null)).toBe(true);
  expect(isPlaceholderId("doc123")).toBe(false);
});
```

### Integration Test Example

```typescript
test("cover letter generation updates URL with real documentId", async () => {
  // Start at /tailor-cover-letter/pending?jobDescription=...
  const { getByText } = render(<TailorCoverLetter />);

  // Wait for generation
  await waitFor(() => {
    expect(getByText(/generating/i)).toBeInTheDocument();
  });

  // URL should update with real ID
  expect(window.location.href).toContain("coverLetterDocId=doc123");
});
```

## Performance Implications

✅ **Positive**:

- Single fetch per document (use documentId which is immutable)
- Browser caching works (URLs are stable after generation)
- URL shorter (no UUID in path)

⚠️ **Watch Out For**:

- Prefetch queries on page load with "pending" ID (will fail) → only prefetch if ID is real
- Search param parsing on every render → memoize if needed

## Summary: What Changed

| Component         | Before                     | After                                |
| ----------------- | -------------------------- | ------------------------------------ |
| AIApplyInput      | Generate UUID, use in path | Use "pending" placeholder            |
| TailorCoverLetter | Accept documentId as prop  | Extract coverLetterDocId from params |
| TailorResume      | Accept resumeId as prop    | Extract resumeDocId from params      |
| Navigation        | Inconsistent URL building  | Consistent helper functions          |
| Data Queries      | Use route params           | Use search params                    |

## Next Steps

1. **Test thoroughly** - Every reload, back button, and step combination
2. **Monitor errors** - Track if users hit the "pending" state incorrectly
3. **Consider URL expiry** - Add timestamp validation to prevent stale URLs
4. **Document API contracts** - Ensure backend always returns documentId
5. **Error states** - Handle what happens if generation fails mid-flow

This architecture follows FAANG+ patterns for:

- **State management via URLs** (similar to how Google Drive handles document IDs)
- **Placeholder pattern** (AWS uses "pending" for many async operations)
- **Type-safe parameters** (prevents mixing different ID types)
- **Composable helpers** (single source of truth for URL construction)
