/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server'

export class MockNextURL {
  private urlObj: URL

  constructor(urlStr: string) {
    this.urlObj = new URL(urlStr)
  }

  get pathname() { return this.urlObj.pathname }
  set pathname(val: string) { this.urlObj.pathname = val }

  get hostname() { return this.urlObj.hostname }
  set hostname(val: string) { this.urlObj.hostname = val }

  get port() { return this.urlObj.port }
  set port(val: string) { this.urlObj.port = val }

  get protocol() { return this.urlObj.protocol }
  set protocol(val: string) { this.urlObj.protocol = val }

  get search() { return this.urlObj.search }
  set search(val: string) { this.urlObj.search = val }

  get searchParams() { return this.urlObj.searchParams }

  get href() { return this.urlObj.href }
  set href(val: string) { this.urlObj = new URL(val) }

  get host() { return this.urlObj.host }
  set host(val: string) { this.urlObj.host = val }

  clone() {
    return new MockNextURL(this.urlObj.href)
  }

  toString() {
    return this.urlObj.toString()
  }
}

export class MockRequestCookies {
  private store = new Map<string, string>()

  constructor(initialCookies: Record<string, string> = {}) {
    for (const [k, v] of Object.entries(initialCookies)) {
      this.store.set(k, v)
    }
  }

  get(name: string) {
    const value = this.store.get(name)
    return value !== undefined ? { name, value } : undefined
  }

  getAll() {
    return Array.from(this.store.entries()).map(([name, value]) => ({ name, value }))
  }

  has(name: string) {
    return this.store.has(name)
  }

  set(name: string | { name: string; value: string }, value?: string) {
    if (typeof name === 'object') {
      this.store.set(name.name, name.value)
    } else if (value !== undefined) {
      this.store.set(name, value)
    }
  }

  delete(name: string) {
    this.store.delete(name)
  }
}

export class MockResponseCookies {
  private store = new Map<string, { value: string; options?: any }>()

  get(name: string) {
    const entry = this.store.get(name)
    return entry ? { name, value: entry.value } : undefined
  }

  getAll() {
    return Array.from(this.store.entries()).map(([name, entry]) => ({ name, value: entry.value, options: entry.options }))
  }

  set(name: string | { name: string; value: string; [key: string]: any }, value?: string, options?: any) {
    if (typeof name === 'object') {
      this.store.set(name.name, { value: name.value, options: name })
    } else if (value !== undefined) {
      this.store.set(name, { value, options })
    }
  }

  delete(name: string) {
    this.store.delete(name)
  }
}

export interface MockRequestOptions {
  url?: string
  method?: string
  headers?: Record<string, string>
  cookies?: Record<string, string>
  body?: any
  subdomain?: string
  domain?: string
}

export class MockNextRequest {
  public method: string
  public url: string
  public nextUrl: MockNextURL
  public headers: Headers
  public cookies: MockRequestCookies
  private bodyPayload: any

  constructor(options: MockRequestOptions = {}) {
    let finalUrl = options.url || 'https://localhost/'
    
    // Support custom subdomains and custom domains
    const urlObj = new URL(finalUrl)
    if (options.domain) {
      urlObj.hostname = options.domain
    } else if (options.subdomain) {
      const parts = urlObj.hostname.split('.')
      if (parts[0] === 'localhost' && parts.length === 1) {
        urlObj.hostname = `${options.subdomain}.localhost`
      } else {
        urlObj.hostname = `${options.subdomain}.${urlObj.hostname}`
      }
    }
    
    this.url = urlObj.href
    this.nextUrl = new MockNextURL(this.url)
    this.method = options.method || 'GET'
    
    const reqHeaders = new Headers()
    if (options.headers) {
      for (const [k, v] of Object.entries(options.headers)) {
        reqHeaders.set(k, v)
      }
    }
    
    if (!reqHeaders.has('host')) {
      reqHeaders.set('host', urlObj.host)
    }
    this.headers = reqHeaders
    
    this.cookies = new MockRequestCookies(options.cookies || {})
    this.bodyPayload = options.body
  }

  async json() {
    if (typeof this.bodyPayload === 'string') {
      return JSON.parse(this.bodyPayload)
    }
    return this.bodyPayload
  }

  async text() {
    if (typeof this.bodyPayload === 'object') {
      return JSON.stringify(this.bodyPayload)
    }
    return String(this.bodyPayload || '')
  }
}

export class MockNextResponse {
  public status: number
  public headers: Headers
  public cookies: MockResponseCookies
  public body: any
  public redirectUrl: string | null = null
  public isNext = false

  constructor(body: any = null, init: ResponseInit & { redirectUrl?: string; isNext?: boolean } = {}) {
    this.body = body
    this.status = init.status ?? 200
    this.headers = new Headers(init.headers)
    this.cookies = new MockResponseCookies()
    this.redirectUrl = init.redirectUrl ?? null
    this.isNext = init.isNext ?? false
  }

  static next(options?: { request?: { headers: Headers } }) {
    const init: any = { isNext: true }
    if (options?.request?.headers) {
      init.headers = options.request.headers
    }
    return new MockNextResponse(null, init)
  }

  static redirect(url: string | URL, status: number = 307) {
    const redirectUrl = typeof url === 'string' ? url : url.toString()
    const headers = new Headers()
    headers.set('Location', redirectUrl)
    return new MockNextResponse(null, {
      status,
      headers,
      redirectUrl,
    })
  }

  static json(body: any, init?: ResponseInit) {
    const headers = new Headers(init?.headers)
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
    return new MockNextResponse(body, {
      ...init,
      headers,
    })
  }
}

export function createMockRequest(options: MockRequestOptions = {}): NextRequest {
  return new MockNextRequest(options) as unknown as NextRequest
}

export function createMockResponse(body?: any, init?: ResponseInit): NextResponse {
  return new MockNextResponse(body, init) as unknown as NextResponse
}
