/* eslint-disable antfu/no-top-level-await */
/* eslint-disable no-console */
import { pausableTimers } from '../src/index'

const timer = pausableTimers(() => {
  console.timeEnd('timeout timer')

  console.time('timeout timer')
}, 5000, {
  mode: 'interval',
})

// remain 3s
await delay(2000)
timer.pause()
timer.resume()

// remain 1s
await delay(2000)
timer.pause()
timer.resume()

console.time('timeout timer')

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
