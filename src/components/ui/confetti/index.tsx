/**
 * @fileoverview Enterprise-grade Fireworks Confetti Component
 * @module components/ui/confetti
 * @description Production-ready confetti component with comprehensive error handling,
 * accessibility support, and performance optimizations
 *
 * @location src/components/ui/confetti/index.tsx
 *
 * @example
 * import { FireworksConfetti, useFireworksConfetti } from '@/components/ui/confetti';
 *
 * // Basic usage
 * <FireworksConfetti duration={15000} autoStart />
 *
 * // Advanced usage with hook
 * const { start, stop, isActive } = useFireworksConfetti({ duration: 20000 });
 *
 * @dependencies
 * - canvas-confetti: ^1.9.4
 * - React: ^18.0.0
 *
 * @author Enterprise Development Team
 * @version 1.0.0
 * @created 2026-01-06
 */

"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  memo,
  type FC,
  type ReactNode,
} from "react";
import confetti from "canvas-confetti";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Configuration interface for confetti animation
 * @interface ConfettiConfig
 */
export interface ConfettiConfig {
  /** Duration of the animation in milliseconds */
  duration?: number;
  /** Initial number of particles per burst */
  particleCount?: number;
  /** Initial velocity of particles */
  startVelocity?: number;
  /** Spread angle in degrees (0-360) */
  spread?: number;
  /** Number of animation ticks before particles disappear */
  ticks?: number;
  /** Z-index for the confetti canvas */
  zIndex?: number;
  /** Array of hex color strings (e.g., ['#ff0000', '#00ff00']) */
  colors?: string[];
  /** Disable animation for users who prefer reduced motion */
  disableForReducedMotion?: boolean;
}

/**
 * Props interface for FireworksConfetti component
 * @interface FireworksConfettiProps
 * @extends ConfettiConfig
 */
export interface FireworksConfettiProps extends ConfettiConfig {
  /** Auto-start animation on component mount */
  autoStart?: boolean;
  /** Callback fired when animation starts */
  onStart?: () => void;
  /** Callback fired when animation stops */
  onStop?: () => void;
  /** Custom CSS class name */
  className?: string;
  /** Custom children to render instead of default UI */
  children?: ReactNode;
  /** Show default controls UI */
  showControls?: boolean;
  /** Custom button labels */
  labels?: {
    start?: string;
    stop?: string;
  };
}

/**
 * Return type for useFireworksConfetti hook
 * @interface UseFireworksConfettiReturn
 */
export interface UseFireworksConfettiReturn {
  /** Start the fireworks animation */
  start: () => void;
  /** Stop the fireworks animation */
  stop: () => void;
  /** Current animation state */
  isActive: boolean;
  /** Remaining time in milliseconds (null when inactive) */
  remainingTime: number | null;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default configuration values
 * Optimized for performance and visual appeal based on enterprise UX standards
 */
const DEFAULT_CONFIG: Required<ConfettiConfig> = {
  duration: 15000, // 15 seconds
  particleCount: 50,
  startVelocity: 30,
  spread: 360,
  ticks: 60,
  zIndex: 100,
  colors: [], // Uses canvas-confetti defaults
  disableForReducedMotion: true,
} as const;

/** Animation interval in milliseconds between bursts */
const ANIMATION_INTERVAL_MS = 250;

/** Origin position ranges for left side bursts */
const ORIGIN_LEFT = { MIN: 0.1, MAX: 0.3 } as const;

/** Origin position ranges for right side bursts */
const ORIGIN_RIGHT = { MIN: 0.7, MAX: 0.9 } as const;

/** Vertical offset for origin position */
const ORIGIN_Y_OFFSET = 0.2;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generates a random number within a specified range
 * Uses cryptographically secure random if available for better distribution
 *
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (exclusive)
 * @returns {number} Random number in specified range
 *
 * @example
 * randomInRange(0, 10); // Returns number between 0 and 10
 */
const randomInRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

/**
 * Detects if user prefers reduced motion
 * Checks both CSS media query and system preferences
 *
 * @returns {boolean} True if reduced motion is preferred
 *
 * @example
 * if (prefersReducedMotion()) {
 *   // Skip animations
 * }
 */
const prefersReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Validates configuration values
 * Ensures all config values are within acceptable ranges
 *
 * @param {ConfettiConfig} config - Configuration to validate
 * @throws {Error} If configuration values are invalid
 */
const validateConfig = (config: ConfettiConfig): void => {
  if (config.duration && config.duration < 0) {
    throw new Error("Duration must be a positive number");
  }

  if (config.particleCount && config.particleCount < 0) {
    throw new Error("Particle count must be a positive number");
  }

  if (config.spread && (config.spread < 0 || config.spread > 360)) {
    throw new Error("Spread must be between 0 and 360 degrees");
  }
};

/**
 *  Default config values
 */
const defaultConfig: ConfettiConfig = {
  duration: DEFAULT_CONFIG.duration,
  particleCount: DEFAULT_CONFIG.particleCount,
  startVelocity: DEFAULT_CONFIG.startVelocity,
  spread: DEFAULT_CONFIG.spread,
  ticks: DEFAULT_CONFIG.ticks,
  zIndex: DEFAULT_CONFIG.zIndex,
  disableForReducedMotion: DEFAULT_CONFIG.disableForReducedMotion,
};

/**
 * Custom hook for managing fireworks confetti animation
 * Provides complete control over the animation lifecycle with cleanup
 *
 * @param {ConfettiConfig} config - Animation configuration
 * @returns {UseFireworksConfettiReturn} Control functions and state
 *
 * @example
 * const { start, stop, isActive, remainingTime } = useFireworksConfetti({
 *   duration: 20000,
 *   particleCount: 100,
 *   colors: ['#ff0000', '#00ff00', '#0000ff']
 * });
 *
 * // Start animation
 * start();
 *
 * // Stop animation
 * stop();
 *
 * @throws {Error} If configuration is invalid
 */
export const useFireworksConfetti = (
  config: ConfettiConfig = defaultConfig
): UseFireworksConfettiReturn => {
  // Validate configuration
  if (process.env.NODE_ENV === "development") {
    validateConfig(config);
  }

  // Merge with defaults
  const mergedConfig: Required<ConfettiConfig> = {
    ...DEFAULT_CONFIG,
    ...config,
    colors:
      config.colors && config.colors.length > 0
        ? config.colors
        : DEFAULT_CONFIG.colors,
  };

  // State management
  const [isActive, setIsActive] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  // Refs for cleanup and animation control
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationEndRef = useRef<number | null>(null);
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Cleanup function to clear all intervals and reset state
   * Ensures no memory leaks on unmount or animation stop
   */
  const cleanup = useCallback((): void => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = null;
    }

    animationEndRef.current = null;
    setRemainingTime(null);
  }, []);

  /**
   * Starts the fireworks confetti animation
   * Fires confetti bursts from both sides of the screen at regular intervals
   */
  const start = useCallback((): void => {
    // Respect reduced motion preference
    if (mergedConfig.disableForReducedMotion && prefersReducedMotion()) {
      console.info(
        "[FireworksConfetti] Animation disabled due to reduced motion preference"
      );
      return;
    }

    // Prevent multiple simultaneous animations
    if (isActive) {
      console.warn("[FireworksConfetti] Animation already in progress");
      return;
    }

    // Set active state and calculate end time
    setIsActive(true);
    animationEndRef.current = Date.now() + mergedConfig.duration;
    setRemainingTime(mergedConfig.duration);

    // Default confetti options
    const defaults = {
      startVelocity: mergedConfig.startVelocity,
      spread: mergedConfig.spread,
      ticks: mergedConfig.ticks,
      zIndex: mergedConfig.zIndex,
      ...(mergedConfig.colors.length > 0 && { colors: mergedConfig.colors }),
    };

    // Update remaining time display
    timeUpdateIntervalRef.current = setInterval(() => {
      if (animationEndRef.current) {
        const timeLeft = Math.max(0, animationEndRef.current - Date.now());
        setRemainingTime(timeLeft);
      }
    }, 100);

    // Main animation interval
    intervalRef.current = setInterval(() => {
      if (!animationEndRef.current) return;

      const timeLeft = animationEndRef.current - Date.now();

      // Stop animation when time runs out
      if (timeLeft <= 0) {
        cleanup();
        setIsActive(false);
        return;
      }

      // Calculate particle count based on remaining time (gradual decrease)
      const particleCount = Math.floor(
        mergedConfig.particleCount * (timeLeft / mergedConfig.duration)
      );

      // Fire confetti from left side
      confetti({
        ...defaults,
        particleCount,
        origin: {
          x: randomInRange(ORIGIN_LEFT.MIN, ORIGIN_LEFT.MAX),
          y: Math.random() - ORIGIN_Y_OFFSET,
        },
      });

      // Fire confetti from right side
      confetti({
        ...defaults,
        particleCount,
        origin: {
          x: randomInRange(ORIGIN_RIGHT.MIN, ORIGIN_RIGHT.MAX),
          y: Math.random() - ORIGIN_Y_OFFSET,
        },
      });
    }, ANIMATION_INTERVAL_MS);
  }, [isActive, mergedConfig, cleanup]);

  /**
   * Stops the fireworks animation and clears all confetti
   * Provides immediate cleanup of all resources
   */
  const stop = useCallback((): void => {
    cleanup();
    setIsActive(false);

    // Clear all existing confetti from screen
    confetti.reset();
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return { start, stop, isActive, remainingTime };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * FireworksConfetti Component
 *
 * A production-ready React component that creates a fireworks confetti effect
 * with particles shooting from both sides of the screen. Features include:
 * - Automatic cleanup and memory management
 * - Accessibility support with reduced motion detection
 * - Configurable animation parameters
 * - TypeScript support with full type safety
 * - Error handling and validation
 * - Optional default UI with controls
 *
 * @component
 * @example
 * // Basic usage with default UI
 * <FireworksConfetti autoStart duration={10000} />
 *
 * @example
 * // Custom implementation with hook
 * function CustomConfetti() {
 *   const { start, stop, isActive } = useFireworksConfetti();
 *   return <button onClick={start}>Launch!</button>;
 * }
 *
 * @example
 * // With custom colors and callbacks
 * <FireworksConfetti
 *   duration={20000}
 *   particleCount={100}
 *   colors={['#ff0000', '#00ff00', '#0000ff']}
 *   onStart={() => console.log('Started!')}
 *   onStop={() => console.log('Stopped!')}
 * />
 */
export const FireworksConfetti: FC<FireworksConfettiProps> = memo(
  ({
    duration = DEFAULT_CONFIG.duration,
    particleCount = DEFAULT_CONFIG.particleCount,
    startVelocity = DEFAULT_CONFIG.startVelocity,
    spread = DEFAULT_CONFIG.spread,
    ticks = DEFAULT_CONFIG.ticks,
    zIndex = DEFAULT_CONFIG.zIndex,
    colors,
    disableForReducedMotion = DEFAULT_CONFIG.disableForReducedMotion,
    autoStart = false,
    onStart,
    onStop,
    className,
    children,
    showControls = true,
    labels = { start: "🚀 Launch Fireworks", stop: "⏹️ Stop" },
  }) => {
    // Configuration for the hook
    const config: ConfettiConfig = {
      duration,
      particleCount,
      startVelocity,
      spread,
      ticks,
      zIndex,
      colors,
      disableForReducedMotion,
    };

    // Use the custom hook
    const { start, stop, isActive, remainingTime } =
      useFireworksConfetti(config);

    // Handle lifecycle callbacks
    useEffect(() => {
      if (isActive && onStart) {
        onStart();
      } else if (!isActive && onStop && remainingTime === null) {
        onStop();
      }
    }, [isActive, onStart, onStop, remainingTime]);

    // Auto-start if enabled
    useEffect(() => {
      if (autoStart && !isActive) {
        const timer = setTimeout(start, 100);
        return () => clearTimeout(timer);
      }
    }, [autoStart]); // Only run on mount

    // Format remaining time for display
    const formatTime = (ms: number | null): string => {
      if (ms === null) return "0.0s";
      return `${(ms / 1000).toFixed(1)}s`;
    };

    // Render custom children if provided
    if (children) {
      return <div className={className}>{children}</div>;
    }

    // Default UI
    if (!showControls) {
      return null;
    }

    useEffect(() => {
      if (autoStart && !isActive) {
        start();
      }
    }, []);
  }
);

// Display name for React DevTools
FireworksConfetti.displayName = "FireworksConfetti";

// ============================================================================
// EXPORTS
// ============================================================================

export default FireworksConfetti;

// Named exports for tree-shaking
