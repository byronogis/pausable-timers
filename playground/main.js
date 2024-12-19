import pkg from '../package.json'
import { pausableTimers } from '../src/index'

// 设置页面标题和项目信息
document.title = `${pkg.name} | Playground`
document.querySelector('.project-info h1').textContent = pkg.name
document.querySelector('.version').textContent = `v${pkg.version}`

const elements = {
  progressBar: document.querySelector('.progress-bar'),
  statusText: document.querySelector('.status-text'),
  timeInput: document.querySelector('#timeInput'),
  modeSelect: document.querySelector('#modeSelect'),
  startBtn: document.querySelector('#startBtn'),
  pauseBtn: document.querySelector('#pauseBtn'),
  clearBtn: document.querySelector('#clearBtn'),
  restartBtn: document.querySelector('#restartBtn'),
}

let timer = null
let animationFrameId = null
let cycleCount = 0

function updateProgress(remaining, total) {
  const progress = (remaining / total) * 100
  const progressBar = elements.progressBar

  // 完全移除过渡效果
  progressBar.style.transition = 'none'
  progressBar.style.width = `${progress}%`

  if (remaining === total) {
    // 当需要重置到 100% 时，保持 none
    return
  }

  // 确保 DOM 更新后再添加过渡效果
  requestAnimationFrame(() => {
    progressBar.style.transition = 'width 0.1s linear'
  })
}

function updateButtons(isRunning) {
  elements.startBtn.disabled = isRunning
  elements.pauseBtn.disabled = !isRunning
  elements.clearBtn.disabled = !isRunning
  elements.restartBtn.disabled = !isRunning
  elements.timeInput.disabled = isRunning
  elements.modeSelect.disabled = isRunning
}

function animate(total) {
  if (!timer)
    return

  const remaining = timer.getRemainingTime()
  updateProgress(remaining, total)

  // 根据模式显示不同的状态信息
  if (elements.modeSelect.value === 'interval') {
    elements.statusText.textContent = `Cycle ${cycleCount} - Remaining: ${remaining}ms`
  }
  else {
    elements.statusText.textContent = `Remaining: ${remaining}ms`
  }

  if (timer.isCompleted()) {
    elements.statusText.textContent = 'Completed!'
    updateButtons(false)
    return
  }

  animationFrameId = requestAnimationFrame(() => animate(total))
}

function startTimer() {
  const delay = Number.parseInt(elements.timeInput.value)
  // 添加输入值检查
  if (delay < 100) {
    elements.statusText.textContent = 'Please enter a value greater than 100ms'
    return
  }

  const mode = elements.modeSelect.value

  // 先清理现有的计时器和动画
  if (timer) {
    timer.clear()
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }

  elements.statusText.textContent = ''
  timer = pausableTimers(() => {
    if (mode === 'timeout') {
      cancelAnimationFrame(animationFrameId)
      updateProgress(0, delay)
      elements.statusText.textContent = 'Completed!'
      updateButtons(false)
    }
    else {
      // 在 interval 模式下，先取消动画帧
      cancelAnimationFrame(animationFrameId)
      // 立即重置进度条到 100%（无动画）
      updateProgress(delay, delay)
      // 在 interval 模式下添加循环次数显示
      cycleCount++
      elements.statusText.textContent = `Cycle ${cycleCount}`
      // 立即开始新的倒计时（有动画）
      requestAnimationFrame(() => animate(delay))
    }
  }, delay, { mode })

  updateButtons(true)
  // 启动时也应用相同的逻辑
  updateProgress(delay, delay)
  requestAnimationFrame(() => animate(delay))
}

// Event Listeners
elements.startBtn.addEventListener('click', startTimer)

elements.pauseBtn.addEventListener('click', () => {
  if (!timer)
    return
  if (timer.isPaused()) {
    timer.resume()
    elements.pauseBtn.textContent = 'Pause'
    animate(Number.parseInt(elements.timeInput.value))
  }
  else {
    timer.pause()
    elements.pauseBtn.textContent = 'Resume'
    cancelAnimationFrame(animationFrameId)
  }
})

elements.clearBtn.addEventListener('click', () => {
  if (!timer)
    return
  timer.clear()
  // 确保动画帧被取消
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
  updateProgress(100, 100)
  elements.statusText.textContent = ''
  updateButtons(false)
  elements.pauseBtn.textContent = 'Pause'
  cycleCount = 0
})

elements.restartBtn.addEventListener('click', () => {
  if (!timer)
    return
  // 先清理现有的动画帧
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
  timer.restart()
  elements.pauseBtn.textContent = 'Pause'
  updateProgress(Number.parseInt(elements.timeInput.value), Number.parseInt(elements.timeInput.value))
  animate(Number.parseInt(elements.timeInput.value))
  cycleCount = 0
})

// 添加输入框验证
elements.timeInput.addEventListener('input', (e) => {
  const value = Number.parseInt(e.target.value)
  if (value < 100) {
    e.target.setCustomValidity('Please enter a value greater than 100ms')
  }
  else {
    e.target.setCustomValidity('')
  }
})
