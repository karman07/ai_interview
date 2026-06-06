import { useState, useEffect, useCallback, useRef } from 'react';

export type ViolationType = 'tab_switch' | 'fullscreen_exit' | 'copy_paste' | 'focus_lost';

export interface Violation {
  type: ViolationType;
  timestamp: number;
  count: number;
}

export interface AntiCheatState {
  isFullscreen: boolean;
  isVisible: boolean;
  violations: Violation[];
  totalViolations: number;
  isDisqualified: boolean;
  warningVisible: boolean;
  warningType: ViolationType | null;
  warningCountdown: number;         // seconds left before auto-disqualify
  requestFullscreen: () => void;
  dismissWarning: () => void;
}

const MAX_VIOLATIONS = 3;           // disqualify after this many
const WARNING_COUNTDOWN_SECS = 15;  // seconds to re-enter fullscreen or switch back

export function useAntiCheat(enabled: boolean): AntiCheatState {
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [isDisqualified, setIsDisqualified] = useState(false);
  const [warningVisible, setWarningVisible] = useState(false);
  const [warningType, setWarningType] = useState<ViolationType | null>(null);
  const [warningCountdown, setWarningCountdown] = useState(WARNING_COUNTDOWN_SECS);

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const disqualifyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasShownInitialPrompt = useRef(false);

  const clearTimers = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (disqualifyTimerRef.current) clearTimeout(disqualifyTimerRef.current);
    countdownRef.current = null;
    disqualifyTimerRef.current = null;
  }, []);

  const addViolation = useCallback((type: ViolationType) => {
    if (!enabled || isDisqualified) return;

    setViolations(prev => {
      const existing = prev.find(v => v.type === type);
      const updated = existing
        ? prev.map(v => v.type === type ? { ...v, count: v.count + 1, timestamp: Date.now() } : v)
        : [...prev, { type, timestamp: Date.now(), count: 1 }];
      const total = updated.reduce((s, v) => s + v.count, 0);
      if (total >= MAX_VIOLATIONS) setIsDisqualified(true);
      return updated;
    });

    setWarningType(type);
    setWarningVisible(true);
    setWarningCountdown(WARNING_COUNTDOWN_SECS);
  }, [enabled, isDisqualified]);

  const requestFullscreen = useCallback(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if ((el as any).webkitRequestFullscreen) (el as any).webkitRequestFullscreen();
    else if ((el as any).mozRequestFullScreen) (el as any).mozRequestFullScreen();
  }, []);

  const dismissWarning = useCallback(() => {
    clearTimers();
    setWarningVisible(false);
    setWarningType(null);
    setWarningCountdown(WARNING_COUNTDOWN_SECS);
  }, [clearTimers]);

  // ── Fullscreen change ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    const onFsChange = () => {
      const inFs = !!document.fullscreenElement;
      setIsFullscreen(inFs);
      if (!inFs && !isDisqualified) {
        addViolation('fullscreen_exit');
      }
    };

    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    document.addEventListener('mozfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
      document.removeEventListener('mozfullscreenchange', onFsChange);
    };
  }, [enabled, isDisqualified, addViolation]);

  // ── Visibility / tab switch ───────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    const onVisibility = () => {
      const visible = !document.hidden;
      setIsVisible(visible);
      if (!visible && !isDisqualified) {
        addViolation('tab_switch');
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [enabled, isDisqualified, addViolation]);

  // ── Window blur (alt-tab, taskbar click, etc.) ───────────────────────────
  useEffect(() => {
    if (!enabled) return;

    // Use a small delay to ignore accidental unfocuses (e.g. clicking in-page elements)
    let blurTimer: ReturnType<typeof setTimeout> | null = null;

    const onBlur = () => {
      blurTimer = setTimeout(() => {
        if (!isDisqualified && document.hidden) {
          addViolation('focus_lost');
        }
      }, 300);
    };
    const onFocus = () => {
      if (blurTimer) clearTimeout(blurTimer);
    };

    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      if (blurTimer) clearTimeout(blurTimer);
    };
  }, [enabled, isDisqualified, addViolation]);

  // ── Countdown while warning is visible ───────────────────────────────────
  useEffect(() => {
    if (!enabled || !warningVisible || isDisqualified) return;

    clearTimers();

    countdownRef.current = setInterval(() => {
      setWarningCountdown(prev => {
        if (prev <= 1) {
          clearTimers();
          // Time expired without re-entering fullscreen → add another violation
          addViolation(warningType ?? 'fullscreen_exit');
          return WARNING_COUNTDOWN_SECS;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimers;
  }, [enabled, warningVisible, isDisqualified, warningType, addViolation, clearTimers]);

  // ── Show initial fullscreen prompt on mount ───────────────────────────────
  useEffect(() => {
    if (!enabled || hasShownInitialPrompt.current) return;
    hasShownInitialPrompt.current = true;

    if (!document.fullscreenElement) {
      setWarningType('fullscreen_exit');
      setWarningVisible(true);
      setWarningCountdown(WARNING_COUNTDOWN_SECS);
    }
  }, [enabled]);

  // ── Auto-dismiss when user re-enters fullscreen ──────────────────────────
  useEffect(() => {
    if (!enabled) return;
    if (isFullscreen && warningType === 'fullscreen_exit' && warningVisible) {
      dismissWarning();
    }
  }, [isFullscreen, warningType, warningVisible, enabled, dismissWarning]);

  const totalViolations = violations.reduce((s, v) => s + v.count, 0);

  return {
    isFullscreen,
    isVisible,
    violations,
    totalViolations,
    isDisqualified,
    warningVisible,
    warningType,
    warningCountdown,
    requestFullscreen,
    dismissWarning,
  };
}
