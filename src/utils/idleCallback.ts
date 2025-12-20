export function requestIdle(cb: IdleRequestCallback, timeoutMs = 1200): number {
  if (typeof window === 'undefined') return 0

  if (typeof window.requestIdleCallback === 'function') {
    return window.requestIdleCallback(cb, { timeout: timeoutMs })
  }

  // Fallback: schedule after a short delay; keep it conservative.
  return window.setTimeout(() => {
    cb({
      didTimeout: true,
      timeRemaining: () => 0,
    } as IdleDeadline)
  }, 450)
}

export function cancelIdle(handle: number): void {
  if (typeof window === 'undefined') return
  if (!handle) return
  if (typeof window.cancelIdleCallback === 'function') {
    window.cancelIdleCallback(handle)
    return
  }
  window.clearTimeout(handle)
}


