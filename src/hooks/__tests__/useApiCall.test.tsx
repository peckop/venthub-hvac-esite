import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useApiCall } from '../useApiCall'
import toast from 'react-hot-toast'

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
    }
}))

describe('useApiCall hook', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('başlangıç state değerlerini kontrol eder', () => {
        const { result } = renderHook(() => useApiCall())

        expect(result.current.data).toBeNull()
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBeNull()
    })

    it('başarılı api çağrısında data döner ve loading statesini düzgün yönetir', async () => {
        const { result } = renderHook(() => useApiCall())
        const mockData = { id: 1, name: 'test' }
        const mockApiFunc = vi.fn().mockResolvedValue(mockData)

        let promise: Promise<any>;
        act(() => {
            promise = result.current.execute(mockApiFunc)
        })

        // Execute çağrıldığında loading true olmalı
        expect(result.current.loading).toBe(true)

        await act(async () => {
            await promise
        })

        expect(result.current.loading).toBe(false)
        expect(result.current.data).toEqual(mockData)
        expect(result.current.error).toBeNull()
        expect(toast.success).not.toHaveBeenCalled()
    })

    it('hata durumunda error döner ve hatayı toast ile gösterir', async () => {
        const { result } = renderHook(() => useApiCall({ errorMessage: 'Özel Hata Mesajı' }))
        const mockError = new Error('API Hatası')
        const mockApiFunc = vi.fn().mockRejectedValue(mockError)

        await act(async () => {
            await result.current.execute(mockApiFunc)
        })

        expect(result.current.loading).toBe(false)
        expect(result.current.data).toBeNull()
        expect(result.current.error).toEqual(mockError)
        expect(toast.error).toHaveBeenCalledWith('Özel Hata Mesajı')
    })

    it('successMessage verildiğinde başarılı çağrıda toast gösterir', async () => {
        const { result } = renderHook(() => useApiCall({ showToast: true, successMessage: 'İşlem başarılı' }))
        const mockApiFunc = vi.fn().mockResolvedValue('ok')

        await act(async () => {
            await result.current.execute(mockApiFunc)
        })

        expect(toast.success).toHaveBeenCalledWith('İşlem başarılı')
    })
})
