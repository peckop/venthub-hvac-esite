import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'

interface ApiCallState<T> {
    data: T | null
    loading: boolean
    error: Error | null
}

interface UseApiCallOptions {
    showToast?: boolean
    successMessage?: string
    errorMessage?: string
}

export function useApiCall<T = unknown>(defaultOptions?: UseApiCallOptions) {
    const [state, setState] = useState<ApiCallState<T>>({
        data: null,
        loading: false,
        error: null,
    })

    const execute = useCallback(
        async (
            apiFunc: () => Promise<T>,
            options?: UseApiCallOptions
        ): Promise<T | null> => {
            const mergedOptions = { ...defaultOptions, ...options }

            setState(prev => ({ ...prev, loading: true, error: null }))
            try {
                const result = await apiFunc()
                setState({ data: result, loading: false, error: null })

                if (mergedOptions.showToast && mergedOptions.successMessage) {
                    toast.success(mergedOptions.successMessage)
                }

                return result
            } catch (err: unknown) {
                const error = err instanceof Error ? err : new Error(String(err))
                setState(prev => ({ ...prev, loading: false, error }))

                if (mergedOptions.showToast !== false) {
                    toast.error(mergedOptions.errorMessage || error.message || 'Bir hata oluştu')
                }

                return null
            }
        },
        [defaultOptions]
    )

    const reset = useCallback(() => {
        setState({ data: null, loading: false, error: null })
    }, [])

    return {
        ...state,
        execute,
        reset,
    }
}
