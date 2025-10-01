import { useState, useEffect, useRef, useCallback } from "react";
import {
  collection,
  query,
  limit,
  startAfter,
  getDocs,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase/index";
import { isEmpty } from "lodash";
import { useJobStore } from "@/lib/firebase/api.firebase";

interface FirestoreDocument extends DocumentData {
  id: string;
}

interface UseInfiniteScrollOptions {
  collectionName: string;
  pageSize?: number;
}

interface UseInfiniteScrollResult<T> {
  items: T[];
  loading: boolean;
  hasMore: boolean;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  resetData: () => void;
}

/**
 * Custom hook for infinite scrolling with Firestore
 */
export function useInfiniteScroll<T extends FirestoreDocument>({
  collectionName,
  pageSize = 5,
}: UseInfiniteScrollOptions): UseInfiniteScrollResult<T> {
  const { jobs, setJobs, clearJobs } = useJobStore(); // Global state management
  const [loading, setLoading] = useState<boolean>(false);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  // const prevQuery = useRef<string | null>(null); // Prevent duplicate queries

  /**
   * Resets the data, useful when user changes filters or searches
   */
  const resetData = useCallback(() => {
    clearJobs();
    setLastDoc(null);
    setHasMore(true);
  }, [clearJobs]);

  /**
   * Fetches data from Firestore with pagination
   */
  const fetchData = useCallback(
    async (
      startAfterDoc: QueryDocumentSnapshot<DocumentData> | null = null
    ) => {
      if (loading || !hasMore) return;

      setLoading(true);
      try {
        let q = query(collection(db, collectionName), limit(pageSize));

        if (startAfterDoc) {
          q = query(q, startAfter(startAfterDoc));
        }

        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          setHasMore(false); // Stop fetching if no more data
          return;
        }

        const newItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];

        setJobs(newItems);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length === pageSize);
      } catch (error) {
        console.error("🔥 Firestore Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    },
    [collectionName, pageSize, loading, hasMore, setJobs]
  );

  /**
   * Initial fetch when the component mounts
   */
  useEffect(() => {
    if (isEmpty(jobs)) {
      fetchData();
    }
  }, []);

  /**
   * Intersection Observer for infinite scrolling
   */
  useEffect(() => {
    if (!loadMoreRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchData(lastDoc);
        }
      },
      { rootMargin: "150px" } // Increased margin to prefetch earlier
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [fetchData, lastDoc, hasMore, loading]);

  return { items: jobs as T[], loading, hasMore, loadMoreRef, resetData };
}
