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
    
    // _shared bağımlılıkları — ADLA DEĞİL, GERÇEK IMPORT'A göre.
    //
    // Burası eskiden yalnız `tenant_config.ts`'i adıyla derliyordu. Yeni bir `_shared`
    // modülü (T026'da `tenant.ts` + `caller.ts`) eklendiği anda o fonksiyonun testi
    // "module not found" ile patlıyordu — ve sebebi test dosyasında değil BURADA olduğu
    // için bulunması zordu. Artık kaynak taranıp gerçekten import edilenler derleniyor,
    // `_shared` içi zincir (ör. caller.ts -> tenant.ts) dahil.
    const sharedDir = path.resolve(path.dirname(functionPath), '../_shared')
    const sharedRefRe = /['"`][^'"`]*_shared\/([A-Za-z0-9_.-]+\.ts)['"`]/g

    const collectSharedRefs = (src: string): string[] => {
      const out: string[] = []
      let m: RegExpExecArray | null
      while ((m = sharedRefRe.exec(src)) !== null) out.push(m[1])
      sharedRefRe.lastIndex = 0
      return out
    }

    const inlineSupabaseUrl = (src: string): string =>
      src.replace(/https:\/\/esm\.sh\/@supabase\/supabase-js(@[0-9a-zA-Z\.\-]+)?/g, '@supabase/supabase-js')

    const content = fs.readFileSync(functionPath, 'utf-8')

    // Kapanış: fonksiyonun referansları + _shared dosyalarının birbirine referansları.
    const sharedNames = new Set<string>()
    const queue = collectSharedRefs(content)
    while (queue.length) {
      const name = queue.shift() as string
      if (sharedNames.has(name)) continue
      const abs = path.join(sharedDir, name)
      if (!fs.existsSync(abs)) continue
      sharedNames.add(name)
      queue.push(...collectSharedRefs(fs.readFileSync(abs, 'utf-8')))
    }

    const compiledNameOf = (name: string) => name.replace(/\.ts$/, `.compiled.${rand}.ts`)

    // Derlenmiş kopyalar: hem supabase-js URL'i satır-içine alınır hem `_shared` içi
    // referanslar derlenmiş adlara çevrilir (yoksa zincirin ikinci halkası ham dosyayı
    // import eder ve URL yeniden ortaya çıkar).
    const sharedCompiledPaths: string[] = []
    for (const name of sharedNames) {
      let src = inlineSupabaseUrl(fs.readFileSync(path.join(sharedDir, name), 'utf-8'))
      for (const other of sharedNames) {
        src = src.split(`./${other}`).join(`./${compiledNameOf(other)}`)
        src = src.split(`_shared/${other}`).join(`_shared/${compiledNameOf(other)}`)
      }
      const outPath = path.join(sharedDir, compiledNameOf(name))
      fs.writeFileSync(outPath, src, 'utf-8')
      sharedCompiledPaths.push(outPath)
    }

    let compiledContent = inlineSupabaseUrl(content)
    for (const name of sharedNames) {
      compiledContent = compiledContent.split(`_shared/${name}`).join(`_shared/${compiledNameOf(name)}`)
    }
    
    const compiledPath = functionPath.replace('index.ts', `index.compiled.${rand}.ts`)
    fs.writeFileSync(compiledPath, compiledContent, 'utf-8')

    try {
      this.tempFiles.push(compiledPath)
      this.tempFiles.push(...sharedCompiledPaths)
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
