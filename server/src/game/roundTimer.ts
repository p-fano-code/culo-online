const ROUND_TIMERS = new Map<string, NodeJS.Timeout>();

export const AUTO_RESTART_MS = 90 * 1000;

export function scheduleAutoRestart(roomCode: string, callback: () => void): void {
  cancelAutoRestart(roomCode);
  const timer = setTimeout(() => {
    ROUND_TIMERS.delete(roomCode);
    callback();
  }, AUTO_RESTART_MS);
  ROUND_TIMERS.set(roomCode, timer);
}

export function cancelAutoRestart(roomCode: string): void {
  const timer = ROUND_TIMERS.get(roomCode);
  if (timer) {
    clearTimeout(timer);
    ROUND_TIMERS.delete(roomCode);
  }
}
