import { defineConfig } from 'vite'
import baseConfig from './vite.config.js'

function defaultTextIncludedMode() {
  const replacements = [
    ["const [geminiTextMode, setGeminiTextMode] = useState('visual');", "const [geminiTextMode, setGeminiTextMode] = useState('text');"],
    ["const [grokTextMode, setGrokTextMode] = useState('visual');", "const [grokTextMode, setGrokTextMode] = useState('text');"],
    ["setGeminiTextMode('visual');", "setGeminiTextMode('text');"],
    ["setGrokTextMode('visual');", "setGrokTextMode('text');"],
  ]

  return {
    name: 'default-text-included-mode',
    enforce: 'pre',
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/')
      if (!normalizedId.endsWith('/src/App.jsx')) return null

      let transformed = code
      for (const [from, to] of replacements) {
        if (!transformed.includes(from)) {
          throw new Error(`[text-default] Expected App source pattern was not found: ${from}`)
        }
        transformed = transformed.split(from).join(to)
      }

      return { code: transformed, map: null }
    },
  }
}

export default defineConfig({
  ...baseConfig,
  plugins: [defaultTextIncludedMode(), ...(baseConfig.plugins || [])],
})
