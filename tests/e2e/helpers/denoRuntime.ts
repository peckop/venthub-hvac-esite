/* eslint-disable */
interface DenoRuntimeOptions {
  env?: Record<string, string>
}

// Initialize global handlers registry if not already present
if (!(globalThis as any).__edge_function_handlers__) {
  (globalThis as any).__edge_function_handlers__ = new Map<string, (req: Request) => any>()
}

export class DenoRuntimeSimulator {
  private originalDeno: any
  private envs: Record<string, string>
  private handlers = new Map<string, (req: Request) => any>()
  private activeHandler: ((req: Request) => any) | null = null
  private tempFiles: string[] = []

  constructor(options: DenoRuntimeOptions = {}) {
    this.envs = { ...options.env }
    this.originalDeno = (globalThis as any).Deno
    this.setupGlobal()
  }

  private setupGlobal() {
    const self = this
    
    // Stub the Deno namespace on globalThis
    ;(globalThis as any).Deno = {
      serve(arg1: any, arg2?: any) {
        let handler: any
        
        if (typeof arg1 === 'function') {
          handler = arg1
        } else if (arg1 && typeof arg1 === 'object') {
          if (typeof arg1.handler === 'function') {
            handler = arg1.handler
          } else if (typeof arg2 === 'function') {
            handler = arg2
          }
        }

        if (handler) {
          self.activeHandler = handler
          ;(globalThis as any).__last_registered_handler__ = handler
        }

        return {
          finished: Promise.resolve(),
          ref: () => {},
          unref: () => {},
        }
      },
      env: {
        get(key: string) {
          return self.envs[key]
        },
        set(key: string, value: string) {
          self.envs[key] = value
        },
        delete(key: string) {
          delete self.envs[key]
        },
        toObject() {
          return { ...self.envs }
        }
      }
    }
  }

  setEnv(key: string, value: string) {
    this.envs[key] = value
  }

  setEnvs(envs: Record<string, string>) {
    this.envs = { ...this.envs, ...envs }
  }

  async loadFunction(functionPath: string): Promise<(req: Request) => Promise<Response> | Response> {
    const globalHandlers = (globalThis as any).__edge_function_handlers__
    
    // Retrieve from global registry if already loaded to bypass Vitest/Node module caching
    if (globalHandlers.has(functionPath)) {
      const handler = globalHandlers.get(functionPath)!
      this.handlers.set(functionPath, handler)
      return handler
    }

    this.activeHandler = null
    ;(globalThis as any).__last_registered_handler__ = null

    // Load function TS module. Vitest handles on-the-fly TS compilation.
    // To resolve native dynamic import protocol errors on ESM urls,
    // we dynamically inline references to @supabase/supabase-js
    // @ts-ignore
    const fs = await import('fs')
    // @ts-ignore
    const path = await import('path')
    
    const rand = Math.random().toString(36).substring(2, 10)
    
    // Also compile _shared/tenant_config.ts if it exists
    const sharedPath = path.resolve(path.dirname(functionPath), '../_shared/tenant_config.ts')
    let sharedCompiledCreated = false
    const sharedCompiledPath = sharedPath.replace('tenant_config.ts', `tenant_config.compiled.${rand}.ts`)
    
    if (fs.existsSync(sharedPath)) {
      const sharedContent = fs.readFileSync(sharedPath, 'utf-8')
      const sharedCompiledContent = sharedContent.replace(
        /https:\/\/esm\.sh\/@supabase\/supabase-js(@[0-9a-zA-Z\.\-]+)?/g,
        '@supabase/supabase-js'
      )
      fs.writeFileSync(sharedCompiledPath, sharedCompiledContent, 'utf-8')
      sharedCompiledCreated = true
    }

    const content = fs.readFileSync(functionPath, 'utf-8')
    let compiledContent = content.replace(
      /https:\/\/esm\.sh\/@supabase\/supabase-js(@[0-9a-zA-Z\.\-]+)?/g,
      '@supabase/supabase-js'
    )
    if (sharedCompiledCreated) {
      compiledContent = compiledContent.replace(
        /..\/_shared\/tenant_config.ts/g,
        `../_shared/tenant_config.compiled.${rand}.ts`
      )
    }
    
    const compiledPath = functionPath.replace('index.ts', `index.compiled.${rand}.ts`)
    fs.writeFileSync(compiledPath, compiledContent, 'utf-8')

    try {
      this.tempFiles.push(compiledPath)
      if (sharedCompiledCreated) {
        this.tempFiles.push(sharedCompiledPath)
      }
      await import(compiledPath)
    } catch (err) {
      console.error('[denoRuntime] Error importing compiled function:', err)
      throw err
    }

    const handler = this.activeHandler || (globalThis as any).__last_registered_handler__
    if (!handler) {
      throw new Error(`Deno.serve was not called in Edge function loaded from: ${functionPath}`)
    }

    globalHandlers.set(functionPath, handler)
    this.handlers.set(functionPath, handler)
    return handler
  }

  async invokeFunction(functionPath: string, request: Request): Promise<Response> {
    let handler = this.handlers.get(functionPath)
    if (!handler) {
      handler = await this.loadFunction(functionPath)
    }
    return await handler(request)
  }

  cleanup() {
    if (this.originalDeno !== undefined) {
      (globalThis as any).Deno = this.originalDeno
    } else {
      delete (globalThis as any).Deno
    }
    
    // Clean up temporary compiled files
    try {
      const fs = require('fs')
      for (const file of this.tempFiles) {
        try { fs.unlinkSync(file) } catch {}
      }
    } catch {
      // Fallback if require is not available
      // @ts-ignore
      import('fs').then((fs) => {
        for (const file of this.tempFiles) {
          try { fs.unlinkSync(file) } catch {}
        }
      }).catch(() => {})
    }
  }
}

export function setupDenoRuntime(options: DenoRuntimeOptions = {}): DenoRuntimeSimulator {
  return new DenoRuntimeSimulator(options)
}
