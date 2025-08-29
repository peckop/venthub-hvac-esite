import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  isChunkError?: boolean
}

const serializeError = (error: unknown) => {
  if (error instanceof Error) {
    return error.message + '\n' + error.stack
  }
  try {
    return JSON.stringify(error, null, 2)
  } catch {
    return String(error)
  }
}

const isChunkLoadError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return error.message.includes('Loading chunk') || 
           error.message.includes('ChunkLoadError') ||
           error.message.includes('Loading CSS chunk')
  }
  return false
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      isChunkError: isChunkLoadError(error)
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Track chunk loading errors specifically
    if (isChunkLoadError(error)) {
      console.warn('Chunk loading error detected - user may need to refresh')
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, isChunkError: false })
  }

  handleRefresh = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { isChunkError } = this.state

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {isChunkError ? 'Sayfa Güncellemesi Gerekli' : 'Sayfa Yüklenemedi'}
            </h2>
            <p className="text-gray-600 mb-6">
              {isChunkError 
                ? 'Uygulama güncellenmiş görünüyor. Sayfayı yenileyip tekrar deneyin.'
                : 'Bu sayfa yüklenirken bir hata oluştu. Lütfen tekrar deneyin.'}
            </p>
            <div className="space-y-3">
              {isChunkError ? (
                <button
                  onClick={this.handleRefresh}
                  className="inline-flex items-center px-6 py-2 bg-primary-navy text-white rounded-lg hover:bg-secondary-blue transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sayfayı Yenile
                </button>
              ) : (
                <>
                  <button
                    onClick={this.handleRetry}
                    className="inline-flex items-center px-4 py-2 bg-primary-navy text-white rounded-lg hover:bg-secondary-blue transition-colors mr-3"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tekrar Dene
                  </button>
                  <button
                    onClick={this.handleRefresh}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Sayfayı Yenile
                  </button>
                </>
              )}
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                  Hata Detayları (Geliştirme)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                  {serializeError(this.state.error)}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
