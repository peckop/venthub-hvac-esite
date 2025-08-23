import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import sourceIdentifierPlugin from 'vite-plugin-source-info'

const isProd = process.env.BUILD_MODE === 'prod'
export default defineConfig({
  plugins: [
    react(), 
    // Temporarily disabled to avoid React Fragment warnings
    // sourceIdentifierPlugin({
    //   enabled: !isProd,
    //   attributePrefix: 'data-matrix',
    //   includeProps: true,
    //   excludeComponents: ['Fragment', 'React.Fragment']
    // })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})

