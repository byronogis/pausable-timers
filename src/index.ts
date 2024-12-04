/* eslint-disable ts/explicit-function-return-type */

/**
 * Creates a pausable timer that can be used as either a timeout or interval
 * 创建一个可暂停的定时器，可用作超时或间隔计时器
 *
 * @param callback - Function to be executed when the timer triggers
 *                  定时器触发时执行的函数
 * @param delay - Delay in milliseconds before the callback is executed
 *               回调函数执行前的延迟时间（毫秒）
 * @param options - Configuration options for the timer
 *                 定时器的配置选项
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
      /**
       * Remaining time is calculated based on the mode
       * 统一使用取余,不需要区分模式
       */
      remaining = delay - (elapsed % delay)
    }
  }

  const resume = () => {
    if (paused) {
      paused = false
      startTime = Date.now()
      if (mode === 'interval') {
        timerId = setTimeout(() => {
          callback()
          /**
           * Remaining time is calculated based on the mode
           * 检查是否在回调期间被暂停
           */
          if (!paused)
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
   * Timer mode: 'timeout' or 'interval'
   * 定时器模式：'timeout' 或 'interval'
   * @default 'timeout'
   */
  mode?: 'timeout' | 'interval'
  /**
   * Custom setTimeout implementation
   * 自定义 setTimeout 方法
   */
  setTimeout?: typeof globalThis.setTimeout
  /**
   * Custom setInterval implementation
   * 自定义 setInterval 方法
   */
  setInterval?: typeof globalThis.setInterval
  /**
   * Custom clearTimeout implementation
   * 自定义 clearTimeout 方法
   */
  clearTimeout?: typeof globalThis.clearTimeout
  /**
   * Custom clearInterval implementation
   * 自定义 clearInterval 方法
   */
  clearInterval?: typeof globalThis.clearInterval
}

interface PausableTimersReturns {
  /**
   * Pause the timer
   * 暂停计时器
   */
  pause: () => void
  /**
   * Resume the timer
   * 恢复计时器
   */
  resume: () => void
  /**
   * Clear the timer
   * 清除计时器
   */
  clear: () => void
  /**
   * Get current pause state
   * 获取计时器当前状态
   */
  isPaused: () => boolean
  /**
   * Restart the timer
   * 重新开始计时
   */
  restart: () => void
}
