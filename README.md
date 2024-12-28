# pausable-timers

<!-- automd:badges license codecov bundlephobia packagephobia -->

[![npm version](https://img.shields.io/npm/v/pausable-timers)](https://npmjs.com/package/pausable-timers)
[![npm downloads](https://img.shields.io/npm/dm/pausable-timers)](https://npm.chart.dev/pausable-timers)
[![bundle size](https://img.shields.io/bundlephobia/minzip/pausable-timers)](https://bundlephobia.com/package/pausable-timers)
[![codecov](https://img.shields.io/codecov/c/gh/byronogis/pausable-timers)](https://codecov.io/gh/byronogis/pausable-timers)
[![license](https://img.shields.io/github/license/byronogis/pausable-timers)](https://github.com/byronogis/pausable-timers/blob/main/LICENSE)

<!-- /automd -->

[![JSDocs][jsdocs-src]][jsdocs-href]

`pausable-timers` is a library for creating timers that can be paused and resumed.

## Installation

<!-- automd:pm-install -->

```sh
# ✨ Auto-detect
npx nypm install pausable-timers

# npm
npm install pausable-timers

# yarn
yarn add pausable-timers

# pnpm
pnpm install pausable-timers

# bun
bun install pausable-timers

# deno
deno install pausable-timers
```

<!-- /automd -->

## Basic Usage

```ts
import { pausableTimers } from 'pausable-timers'

const timer = pausableTimers({
  mode: 'interval', // 'timeout' | 'interval'
  args: [() => {
    /**
     * Execute after 1 second
     * 1s 后执行
     */
  }, 1000]
})

timer.pause()
timer.resume()
timer.clear()
timer.restart()
timer.isPaused()
timers.getRemainingTime()
timer.isCompleted() // only for timeout mode
```

<!-- /automd -->

## Advanced Usage

Customize the timeout/interval power, like using [worker-timers](https://github.com/chrisguttandin/worker-timers)(A replacement for setInterval() and setTimeout() which works in unfocused windows.):

```ts
import { pausableTimers } from 'pausable-timers'
import { clearInterval, clearTimeout, setInterval, setTimeout } from 'worker-timers'

const timer = pausableTimers({
  setTimeout,
  setInterval,
  clearTimeout,
  clearInterval,
  args: [() => {
    /**
     * Execute after 1 second
     * 1s 后执行
     */
  }, 1000,]
})
```

<!-- automd:fetch url="gh:byronogis/.github/main/snippets/readme-contrib-node-pnpm.md" -->

## Contribution

<details>
  <summary>Local development</summary>

- Clone this repository
- Install the latest LTS version of [Node.js](https://nodejs.org/en/)
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
- Install dependencies using `pnpm install`
- Run tests using `pnpm dev` or `pnpm test`

</details>

<!-- /automd -->

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/byronogis/static/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/byronogis/static/sponsors.svg'/>
  </a>
</p>

## License

<!-- automd:contributors author="byronogis" license="MIT" -->

Published under the [MIT](https://github.com/byronogis/pausable-timers/blob/main/LICENSE) license.
Made by [@byronogis](https://github.com/byronogis) and [community](https://github.com/byronogis/pausable-timers/graphs/contributors) 💛
<br><br>
<a href="https://github.com/byronogis/pausable-timers/graphs/contributors">
<img src="https://contrib.rocks/image?repo=byronogis/pausable-timers" />
</a>

<!-- /automd -->

<!-- automd:with-automd lastUpdate -->

---

_🤖 auto updated with [automd](https://automd.unjs.io) (last updated: Fri Dec 06 2024)_

<!-- /automd -->

<!-- Badges -->

[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-1fa669
[jsdocs-href]: https://www.jsdocs.io/package/pausable-timers
