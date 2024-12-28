import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { pausableTimers } from '../src/index'

describe('pausableTimers', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('timeout mode', () => {
    it('should execute callback after delay', () => {
      const callback = vi.fn()
      pausableTimers({ args: [callback, 100] })
      expect(callback).not.toHaveBeenCalled()
      vi.advanceTimersByTime(100)
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should pass parameters to callback correctly', () => {
      const callback = vi.fn()
      pausableTimers({
        args: [callback, 100, 'test', 123],
      })
      vi.advanceTimersByTime(100)
      expect(callback).toHaveBeenCalledWith('test', 123)
    })

    it('should pause and resume correctly', () => {
      const callback = vi.fn()
      const timer = pausableTimers({
        args: [callback, 100],
      })

      vi.advanceTimersByTime(50)
      timer.pause()
      vi.advanceTimersByTime(100)
      expect(callback).not.toHaveBeenCalled()

      timer.resume()
      vi.advanceTimersByTime(49)
      expect(callback).not.toHaveBeenCalled()
      vi.advanceTimersByTime(1)
      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  describe('interval mode', () => {
    it('should execute callback repeatedly', () => {
      const callback = vi.fn()
      pausableTimers({
        args: [callback, 100],
        mode: 'interval',
      })

      vi.advanceTimersByTime(250)
      expect(callback).toHaveBeenCalledTimes(2)
    })

    it('should execute callback repeatedly with parameters', () => {
      const callback = vi.fn()
      pausableTimers({
        args: [callback, 100, 'test', 123],
        mode: 'interval',
      })

      vi.advanceTimersByTime(250)
      expect(callback).toHaveBeenCalledTimes(2)
      expect(callback).toHaveBeenCalledWith('test', 123)
    })

    it('should pause and resume interval correctly', () => {
      const callback = vi.fn()
      const timer = pausableTimers({
        args: [callback, 100],
        mode: 'interval',
      })

      // 第一个周期
      vi.advanceTimersByTime(150)
      expect(callback).toHaveBeenCalledTimes(1)

      // 暂停
      timer.pause()
      vi.advanceTimersByTime(200)
      expect(callback).toHaveBeenCalledTimes(1)

      // 恢复后的首次计时
      timer.resume()
      vi.advanceTimersByTime(100)
      expect(callback).toHaveBeenCalledTimes(2)

      // 恢复后的第二个周期开始
      vi.advanceTimersByTime(100)
      expect(callback).toHaveBeenCalledTimes(3)

      // 再确认一个周期
      vi.advanceTimersByTime(100)
      expect(callback).toHaveBeenCalledTimes(4)
    })

    it('should resume interval with remaining time from last pause', () => {
      const callback = vi.fn()
      const timer = pausableTimers({
        args: [callback, 100],
        mode: 'interval',
      })

      // 第一个周期执行
      vi.advanceTimersByTime(100)
      expect(callback).toHaveBeenCalledTimes(1)

      // 在第二个周期的30ms时暂停
      vi.advanceTimersByTime(30)
      timer.pause()
      vi.advanceTimersByTime(100)
      expect(callback).toHaveBeenCalledTimes(1)

      // 恢复后应该只需要剩余的70ms就触发回调
      timer.resume()
      vi.advanceTimersByTime(69)
      expect(callback).toHaveBeenCalledTimes(1)
      vi.advanceTimersByTime(1)
      expect(callback).toHaveBeenCalledTimes(2)

      // 之后恢复正常的100ms周期
      vi.advanceTimersByTime(99)
      expect(callback).toHaveBeenCalledTimes(2)
      vi.advanceTimersByTime(1)
      expect(callback).toHaveBeenCalledTimes(3)
    })

    it('should handle pause/resume after multiple intervals', () => {
      const callback = vi.fn()
      const timer = pausableTimers({
        args: [callback, 100],
        mode: 'interval',
      })

      // 让它先运行3个完整周期
      vi.advanceTimersByTime(300)
      expect(callback).toHaveBeenCalledTimes(3)

      // 在第4个周期的60ms时暂停
      vi.advanceTimersByTime(60)
      timer.pause()
      vi.advanceTimersByTime(100)
      expect(callback).toHaveBeenCalledTimes(3)

      // 恢复后应该只需要40ms就触发第4次回调
      timer.resume()
      vi.advanceTimersByTime(39)
      expect(callback).toHaveBeenCalledTimes(3)
      vi.advanceTimersByTime(1)
      expect(callback).toHaveBeenCalledTimes(4)

      // 之后应该恢复正常100ms的周期
      vi.advanceTimersByTime(99)
      expect(callback).toHaveBeenCalledTimes(4)
      vi.advanceTimersByTime(1)
      expect(callback).toHaveBeenCalledTimes(5)
    })

    it('should handle pause during resume timeout in interval mode', () => {
      const callback = vi.fn()
      const timer = pausableTimers({
        args: [callback, 100],
        mode: 'interval',
      })

      // 第一个周期的50ms处暂停
      vi.advanceTimersByTime(50)
      timer.pause()
      expect(callback).not.toHaveBeenCalled()

      // 恢复后30ms再次暂停
      timer.resume()
      vi.advanceTimersByTime(30)
      timer.pause()
      expect(callback).not.toHaveBeenCalled()

      // 恢复后应该只需要剩余的20ms就触发回调
      timer.resume()
      vi.advanceTimersByTime(19)
      expect(callback).not.toHaveBeenCalled()
      vi.advanceTimersByTime(1)
      expect(callback).toHaveBeenCalledTimes(1)

      // 之后恢复正常的100ms周期
      vi.advanceTimersByTime(99)
      expect(callback).toHaveBeenCalledTimes(1)
      vi.advanceTimersByTime(1)
      expect(callback).toHaveBeenCalledTimes(2)
    })
  })

  describe('edge cases', () => {
    beforeEach(() => {
      vi.setSystemTime(0)
    })

    afterEach(() => {
      vi.setSystemTime(vi.getRealSystemTime())
    })

    it('should handle multiple pause/resume calls', () => {
      const callback = vi.fn()
      const timer = pausableTimers({
        args: [callback, 100],
      })

      timer.pause()
      timer.pause() // 重复暂停
      timer.resume()
      timer.resume() // 重复恢复

      vi.advanceTimersByTime(100)
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should work with custom timer functions', () => {
      const customSetTimeout = vi.fn().mockImplementation(setTimeout)
      const customClearTimeout = vi.fn().mockImplementation(clearTimeout)

      const callback = vi.fn()
      pausableTimers({
        args: [callback, 100],
        // @ts-expect-error 类型 "Mock<Procedure>" 中缺少属性 "__promisify__"，但类型 "typeof setTimeout" 中需要该属性。ts(2741)
        setTimeout: customSetTimeout,
        clearTimeout: customClearTimeout,
      })

      expect(customSetTimeout).toHaveBeenCalled()
      vi.advanceTimersByTime(100)
      expect(callback).toHaveBeenCalled()
    })

    it('should restart timer correctly', () => {
      const callback = vi.fn()
      const timer = pausableTimers({
        args: [callback, 100],
      })

      vi.advanceTimersByTime(50)
      timer.restart()
      vi.advanceTimersByTime(50)
      expect(callback).not.toHaveBeenCalled()
      vi.advanceTimersByTime(50)
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('should restart interval correctly', () => {
      const callback = vi.fn()
      const timer = pausableTimers({
        args: [callback, 100],
        mode: 'interval',
      })

      vi.advanceTimersByTime(150)
      expect(callback).toHaveBeenCalledTimes(1)
      timer.restart()
      vi.advanceTimersByTime(99)
      expect(callback).toHaveBeenCalledTimes(1)
      vi.advanceTimersByTime(1)
      expect(callback).toHaveBeenCalledTimes(2)
    })

    it('should correctly report paused state', () => {
      const callback = vi.fn()
      const timer = pausableTimers({
        args: [callback, 100],
      })

      expect(timer.isPaused()).toBe(false)
      timer.pause()
      expect(timer.isPaused()).toBe(true)
      timer.resume()
      expect(timer.isPaused()).toBe(false)
    })

    it('should clear timer correctly', () => {
      const callback = vi.fn()
      const timer = pausableTimers({
        args: [callback, 100],
      })

      timer.clear()
      vi.advanceTimersByTime(100)
      expect(callback).not.toHaveBeenCalled()
    })

    it('should report remaining time correctly', () => {
      const callback = vi.fn()
      const timer = pausableTimers({
        args: [callback, 100],
      })

      vi.setSystemTime(0) // 重置系统时间以获得确定性的结果

      // 初始状态
      expect(timer.getRemainingTime()).toBe(100)

      // 前进50ms
      vi.advanceTimersByTime(50)
      expect(timer.getRemainingTime()).toBe(50)

      // 暂停状态
      timer.pause()
      expect(timer.getRemainingTime()).toBe(50)

      // 清除后
      timer.clear()
      expect(timer.getRemainingTime()).toBe(100)
    })

    it('should report remaining time correctly in interval mode', () => {
      const callback = vi.fn()
      const timer = pausableTimers({
        args: [callback, 100],
        mode: 'interval',
      })

      vi.setSystemTime(0) // 重置系统时间以获得确定性的结果

      // 第一个间隔
      vi.advanceTimersByTime(30)
      expect(timer.getRemainingTime()).toBe(70)

      // 暂停时
      timer.pause()
      expect(timer.getRemainingTime()).toBe(70)

      // 恢复后
      timer.resume()
      vi.advanceTimersByTime(20)
      expect(timer.getRemainingTime()).toBe(50)
    })

    it('should report remaining time correctly in interval mode after cycle completion', () => {
      const callback = vi.fn()
      const timer = pausableTimers({
        args: [callback, 100],
        mode: 'interval',
      })

      // 完成一个周期
      vi.advanceTimersByTime(100)
      expect(callback).toHaveBeenCalledTimes(1)
      expect(timer.getRemainingTime()).toBe(100)

      // 第二个周期中途
      vi.advanceTimersByTime(30)
      expect(timer.getRemainingTime()).toBe(70)
    })

    it('should report correct remaining time after restart', () => {
      const callback = vi.fn()
      const timer = pausableTimers({
        args: [callback, 100],
      })

      vi.advanceTimersByTime(50)
      expect(timer.getRemainingTime()).toBe(50)

      timer.restart()
      expect(timer.getRemainingTime()).toBe(100)

      vi.advanceTimersByTime(30)
      expect(timer.getRemainingTime()).toBe(70)
    })

    it('should maintain accurate remaining time during multiple pause/resume', () => {
      const callback = vi.fn()
      const timer = pausableTimers({
        args: [callback, 100],
      })

      vi.advanceTimersByTime(30)
      timer.pause()
      expect(timer.getRemainingTime()).toBe(70)

      timer.resume()
      vi.advanceTimersByTime(20)
      timer.pause()
      expect(timer.getRemainingTime()).toBe(50)

      vi.advanceTimersByTime(100) // 暂停期间时间不应该改变
      expect(timer.getRemainingTime()).toBe(50)
    })

    it('should report zero remaining time after timeout completion', () => {
      const callback = vi.fn()
      const timer = pausableTimers({
        args: [callback, 100],
      })

      vi.advanceTimersByTime(100)
      expect(callback).toHaveBeenCalledTimes(1)
      expect(timer.getRemainingTime()).toBe(0)

      vi.advanceTimersByTime(50)
      expect(timer.getRemainingTime()).toBe(0)
    })

    describe('completion state', () => {
      it('should report completion state correctly in timeout mode', () => {
        const callback = vi.fn()
        const timer = pausableTimers({
          args: [callback, 100],
        })

        expect(timer.isCompleted()).toBe(false)
        vi.advanceTimersByTime(100)
        expect(timer.isCompleted()).toBe(true)
      })

      it('should reset completion state after restart', () => {
        const callback = vi.fn()
        const timer = pausableTimers({
          args: [callback, 100],
        })

        vi.advanceTimersByTime(100)
        expect(timer.isCompleted()).toBe(true)

        timer.restart()
        expect(timer.isCompleted()).toBe(false)
      })

      it('should always report false in interval mode', () => {
        const callback = vi.fn()
        const timer = pausableTimers({
          args: [callback, 100],
          mode: 'interval',
        })

        expect(timer.isCompleted()).toBe(false)
        vi.advanceTimersByTime(300) // 执行多个周期
        expect(timer.isCompleted()).toBe(false)
      })

      it('should reset completion state after clear', () => {
        const callback = vi.fn()
        const timer = pausableTimers({
          args: [callback, 100],
        })

        vi.advanceTimersByTime(100)
        expect(timer.isCompleted()).toBe(true)

        timer.clear()
        expect(timer.isCompleted()).toBe(false)
      })
    })
  })
})
