"use client";

/**
 * Browser Device Detection Utility
 * Collects device and browser information from the browser environment
 * To be included in API requests for enhanced activity tracking
 */

export interface ClientDeviceInfo {
  screenWidth?: number;
  screenHeight?: number;
  devicePixelRatio?: number;
  timezone?: string;
  language?: string;
  touchCapable?: boolean;
}

/**
 * Collect client-side device information
 * This data is sent to the server via headers or request body
 * and used to enrich activity tracking
 */
export function collectDeviceInfo(): ClientDeviceInfo {
  try {
    return {
      screenWidth:
        typeof window !== "undefined" ? window.innerWidth : undefined,
      screenHeight:
        typeof window !== "undefined" ? window.innerHeight : undefined,
      devicePixelRatio:
        typeof window !== "undefined" ? window.devicePixelRatio : undefined,
      timezone:
        typeof Intl !== "undefined"
          ? Intl.DateTimeFormat().resolvedOptions().timeZone
          : undefined,
      language:
        typeof navigator !== "undefined" ? navigator.language : undefined,
      touchCapable:
        typeof navigator !== "undefined"
          ? "ontouchstart" in window ||
            navigator.maxTouchPoints > 0 ||
            (navigator as any).msMaxTouchPoints > 0
          : undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Get custom headers to send with API requests
 * These headers contain device info for server-side activity tracking
 */
export function getDeviceInfoHeaders(): Record<string, string> {
  const deviceInfo = collectDeviceInfo();

  return {
    "x-client-screen-width": String(deviceInfo.screenWidth || ""),
    "x-client-screen-height": String(deviceInfo.screenHeight || ""),
    "x-client-pixel-ratio": String(deviceInfo.devicePixelRatio || ""),
    "x-client-timezone": deviceInfo.timezone || "",
    "x-client-language": deviceInfo.language || "",
    "x-client-touch": String(deviceInfo.touchCapable || "false"),
  };
}

/**
 * Add device info to request metadata
 * Use this to include device info in request body/metadata
 */
export function addDeviceInfoToMetadata(metadata?: Record<string, any>) {
  const deviceInfo = collectDeviceInfo();

  return {
    ...metadata,
    clientDevice: deviceInfo,
  };
}
