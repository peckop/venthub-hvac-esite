import { describe, expect,it } from 'vitest'

import { computeDueState,isTerminalStatus } from '../dueState'

describe('dueState', () => {
  describe('isTerminalStatus', () => {
    it('should return true for completed status', () => {
      expect(isTerminalStatus('completed')).toBe(true)
    })

    it('should return true for rejected status', () => {
      expect(isTerminalStatus('rejected')).toBe(true)
    })

    it('should return false for in_progress status', () => {
      expect(isTerminalStatus('in_progress')).toBe(false)
    })

    it('should return false for pending status', () => {
      expect(isTerminalStatus('pending')).toBe(false)
    })
  })

  describe('computeDueState', () => {
    const MS_PER_DAY = 24 * 60 * 60 * 1000

    it('should calculate remaining days correctly for pending status', () => {
      const now = new Date('2025-05-10T12:00:00Z')
      const due = new Date(now.getTime() + 5 * MS_PER_DAY)

      const result = computeDueState(
        { due_at: due.toISOString(), status: 'pending', completed_at: null },
        now
      )

      expect(result.daysLeft).toBe(5)
      expect(result.overdue).toBe(false)
      expect(result.frozen).toBe(false)
    })

    it('should mark as overdue when past due date for pending status', () => {
      const now = new Date('2025-05-15T12:00:00Z')
      const due = new Date(now.getTime() - 2 * MS_PER_DAY)

      const result = computeDueState(
        { due_at: due.toISOString(), status: 'pending', completed_at: null },
        now
      )

      expect(result.daysLeft).toBe(-2)
      expect(result.overdue).toBe(true)
      expect(result.frozen).toBe(false)
    })

    it('should freeze calculation at completed_at for terminal status', () => {
      const now = new Date('2025-05-20T12:00:00Z')
      const due = new Date('2025-05-15T12:00:00Z')
      const completedAt = new Date('2025-05-10T12:00:00Z')

      const result = computeDueState(
        { due_at: due.toISOString(), status: 'completed', completed_at: completedAt.toISOString() },
        now
      )

      // It was completed 5 days before due date, so 5 days left at that point
      expect(result.daysLeft).toBe(5)
      expect(result.overdue).toBe(false) // terminal status cannot be overdue
      expect(result.frozen).toBe(true)
    })

    it('should handle terminal status with missing completed_at gracefully', () => {
      const now = new Date('2025-05-10T12:00:00Z')
      const due = new Date('2025-05-15T12:00:00Z')

      const result = computeDueState(
        { due_at: due.toISOString(), status: 'rejected', completed_at: null },
        now
      )

      expect(result.daysLeft).toBe(5)
      expect(result.overdue).toBe(false)
      expect(result.frozen).toBe(true)
    })
  })
})
