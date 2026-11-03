/**
 * `https://deno.land/std@<sürüm>/http/server.ts` test sahtesi (denoRuntime `moduleRewrites`).
 * Node ESM yükleyicisi `https:` adresini içe aktaramaz; std `serve` simülatörün kurduğu
 * global `Deno.serve`'e devredilir ki işleyici aynı yoldan kaydedilsin.
 */
type Isleyici = (req: Request) => Response | Promise<Response>

export function serve(isleyici: Isleyici): unknown {
  const deno = (globalThis as { Deno?: { serve: (h: Isleyici) => unknown } }).Deno
  if (!deno) throw new Error('denoStdServeSahte: global Deno kurulmamış (setupDenoRuntime çağrılmadı)')
  return deno.serve(isleyici)
}
