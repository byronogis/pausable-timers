import { pausableTimers } from 'pausable-timers'

/**
 * Basic timeout usage example
 * 基础的 timeout 用法
 */
const timer = pausableTimers(() => {
  /**
   * Execute after 1 second
   * 1s 后执行
   */
}, 1000)

/**
 * Interval mode example
 * interval 模式示例
 */
const _timer = pausableTimers(() => {
  /**
   * Execute every 1 second
   * 每隔 1s 执行一次
   */
}, 1000, { mode: 'interval' })

/**
 * Pause the timer
 * 暂停计时
 */
timer.pause()

/**
 * Check if timer is paused
 * true if paused, false otherwise
 */
timer.isPaused()

/**
 * Resume the timer
 * 恢复计时
 */
timer.resume()

/**
 * Restart the timer from beginning
 * 重新开始计时
 */
timer.restart()

/**
 * Clear and stop the timer completely
 * 完全停止定时器
 */
timer.clear()
