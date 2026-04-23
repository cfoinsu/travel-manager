import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => {
  // Some shells or IDE run configs leak NODE_ENV=production into `vite`,
  // which breaks React Fast Refresh in dev and causes `$RefreshSig$` errors.
  if (command === 'serve' && process.env.NODE_ENV !== 'development') {
    process.env.NODE_ENV = 'development'
  }

  return {
    plugins: [react()],
  }
})
