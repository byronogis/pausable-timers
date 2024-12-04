/* eslint-disable ts/explicit-function-return-type */

/**
 * Creates a pausable timer that can be used as either a timeout or interval.
 *
 * @param callback - The function to be executed when the timer triggers
 * @param delay - The delay in milliseconds before the callback is executed
 * @param options - Configuration options for the timer
 * @param options.mode - Determines if timer should behave as 'timeout' or 'interval'. Defaults to 'timeout'
 * @param options.setTimeout - Custom setTimeout implementation. Defaults to global setTimeout
 * @param options.setInterval - Custom setInterval implementation. Defaults to global setInterval
 * @param options.clearTimeout - Custom clearTimeout implementation. Defaults to global clearTimeout
 * @param options.clearInterval - Custom clearInterval implementation. Defaults to global clearInterval
 *
 * @returns An object containing methods to control the timer:
 * - pause: Pauses the timer
 * - resume: Resumes the timer from where it was paused
 * - clear: Stops and clears the timer
 * - isPaused: Returns the current pause state of the timer
 * - restart: Resets and restarts the timer with initial delay
 *
 * @example
 * ```ts
 * const timer = pausableTimers(() => console.log('tick'), 1000);
 * timer.pause(); // Pause the timer
 * timer.resume(); // Resume the timer
 * timer.clear(); // Clear the timer
 * ```
 */
export function pausableTimers(
  callback: () => void,
  delay: number, // milliseconds
  options: PausableTimersOptions = {},
): PausableTimersReturns {
  const {
    mode = 'timeout',
    setTimeout = globalThis.setTimeout,
    setInterval = globalThis.setInterval,
    clearTimeout = globalThis.clearTimeout,
    clearInterval = globalThis.clearInterval,
  } = options

  let timerId: ReturnType<typeof setTimeout> | null = null
  let startTime = Date.now() // milliseconds since epoch
  let remaining = delay // milliseconds
  let paused = false

  const clear = () => {
    if (timerId !== null) {
      if (mode === 'timeout')
        clearTimeout(timerId)
      else
        clearInterval(timerId)
      timerId = null
    }
  }

  const pause = () => {
    if (!paused && timerId !== null) {
      paused = true
      clear()
      const elapsed = Date.now() - startTime
      remaining = delay - (elapsed % delay) // 统一使用取余,不需要区分模式
    }
  }

  const resume = () => {
    if (paused) {
      paused = false
      startTime = Date.now()
      if (mode === 'interval') {
        timerId = setTimeout(() => {
          callback()
          if (!paused) // 检查是否在回调期间被暂停
            timerId = setInterval(callback, delay)
        }, remaining)
      }
      else {
        timerId = setTimeout(callback, remaining)
      }
    }
  }

  const isPaused = () => paused

  const start = () => {
    clear()
    paused = false
    remaining = delay
    startTime = Date.now()
    if (mode === 'timeout')
      timerId = setTimeout(callback, remaining)
    else
      timerId = setInterval(callback, delay)
  }

  const restart = () => {
    clear()
    start()
  }

  start()

  return { pause, resume, clear, isPaused, restart }
}

interface PausableTimersOptions {
  /**
   * @default 'timeout'
   */
  mode?: 'timeout' | 'interval'
  /** 自定义 setTimeout 方法 */
  setTimeout?: typeof globalThis.setTimeout
  /** 自定义 setInterval 方法 */
  setInterval?: typeof globalThis.setInterval
  /** 自定义 clearTimeout 方法 */
  clearTimeout?: typeof globalThis.clearTimeout
  /** 自定义 clearInterval 方法 */
  clearInterval?: typeof globalThis.clearInterval
}

interface PausableTimersReturns {
  /** 暂停计时器 */
  pause: () => void
  /** 恢复计时器 */
  resume: () => void
  /** 清除计时器 */
  clear: () => void
  /** 获取计时器当前状态 */
  isPaused: () => boolean
  /** 重新开始计时 */
  restart: () => void
}
