import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";

/**
 * useInterviewLimits
 *
 * Single source of truth for interview limit and usage.
 * All limits come exclusively from the backend — no hardcoded fallbacks.
 *
 * Priority chain for interviewLimit:
 *  1. Students  → university.interviewLimit  (from /universities/:id API)
 *  2. PAYG      → user.paygInterviewsLimit   (set at PAYG subscription creation)
 *  3. Regular   → user.interviewLimit        (stamped from plan at purchase / plan-edit)
 *  4. Embedded  → subscriptionPlan.features 'Interview Limit' (case-insensitive)
 *  5. null      → backend hasn't sent a limit yet
 *
 * When interviewLimit is null, isAtLimit is always false (never gate on missing data).
 * The UI should hide usage bars when interviewLimit is null.
 *
 * Count source (same everywhere):
 *  - PAYG    → user.paygInterviewsUsed ?? 0
 *  - Regular → user.interviewCount     ?? 0
 */
export function useInterviewLimits() {
  const { user } = useAuth();
  const [universityInterviewLimit, setUniversityInterviewLimit] = useState<number | null>(null);
  const [universityResumeLimit, setUniversityResumeLimit] = useState<number | null>(null);

  useEffect(() => {
    const role = (user as any)?.role;
    const universityId = (user as any)?.universityId;
    if (role === "student" && universityId) {
      import("@/api/http").then(({ default: http }) => {
        http
          .get(`/universities/${universityId}`)
          .then((res) => {
            setUniversityInterviewLimit(res.data?.interviewLimit ?? null);
            setUniversityResumeLimit(res.data?.resumeLimit ?? null);
          })
          .catch(() => {});
      });
    }
  }, [(user as any)?.universityId]);

  const isPayg =
    (user?.subscriptionPlan as any)?.type === "pay_as_you_go" ||
    (typeof user?.paygInterviewsLimit === "number" && !user?.interviewLimit);

  const interviewLimit = useMemo((): number | null => {
    // 1. Students — university admin-configured limit
    if ((user as any)?.role === "student") {
      return universityInterviewLimit; // null while loading or if admin hasn't set it
    }

    // 2. PAYG — monthly cap set at PAYG subscription creation
    if (
      (user?.subscriptionPlan as any)?.type === "pay_as_you_go" &&
      typeof user?.paygInterviewsLimit === "number"
    ) {
      return user.paygInterviewsLimit;
    }

    // 3. Limit stamped on user profile at purchase / plan-sync time
    if (typeof user?.interviewLimit === "number" && user.interviewLimit > 0) {
      return user.interviewLimit;
    }

    // 4. subscriptionPlan.features (populated when plan object is embedded in /me)
    if (user?.subscriptionPlan && typeof user.subscriptionPlan === "object") {
      const f = (user.subscriptionPlan as any).features?.find?.((f: any) =>
        String(f.name).toLowerCase().includes("interview limit")
      );
      if (f != null) {
        const val = f.value ?? f.limit;
        if (val != null) return Number(val);
      }
    }

    // No backend-set limit available yet
    return null;
  }, [user, universityInterviewLimit]);

  // Single count source — never fall back to analytics or results totals
  const currentInterviews = isPayg
    ? (user?.paygInterviewsUsed ?? 0)
    : (user?.interviewCount ?? 0);

  // Only block when the backend has confirmed a limit
  const isAtLimit = interviewLimit !== null && currentInterviews >= interviewLimit;

  return {
    interviewLimit,
    currentInterviews,
    isAtLimit,
    isPayg,
    universityInterviewLimit,
    universityResumeLimit,
  };
}
