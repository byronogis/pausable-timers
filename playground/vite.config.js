import { defineConfig } from 'vite'
import pkg from '../package.json'

function getRepoName(url) {
  const match = url.match(/github\.com\/[\w-]+\/([\w-]+)/)
  return match ? `/${match[1]}/` : '/'
}

export default defineConfig({
  base: getRepoName(pkg.repository.url),
})
