import { useState, useCallback } from 'react'
import { toast } from 'sonner'

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

/**
 * A custom React hook that manages the loading, data, and error states for asynchronous API calls.
 * Provides a standardized way to handle API execution with built-in toast notifications for success and error scenarios.
 *
 * @param defaultOptions - Optional default settings for toast messages applied to all executions
 * @returns An object containing the current state (data, loading, error), an `execute` method to run API calls, and a `reset` method to clear the state
 *
 * @example
 * const { data, loading, execute, reset } = useApiCall<Product[]>({ errorMessage: 'Failed to load products' })
 *
 * const fetchProducts = async () => {
 *   await execute(async () => {
 *     return await api.getProducts()
 *   }, { showToast: true, successMessage: 'Products loaded successfully' })
 * }
 */
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
