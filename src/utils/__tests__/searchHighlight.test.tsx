import { render } from '@testing-library/react'
import { describe, expect,it } from 'vitest'

import { highlightMatch } from '../searchHighlight'

describe('highlightMatch', () => {
  it('should return original text when query is empty', () => {
    const text = 'Hello world'
    const result = highlightMatch(text, '')
    expect(result).toBe(text)

    const result2 = highlightMatch(text, '   ')
    expect(result2).toBe(text)
  })

  it('should highlight correctly case-insensitively', () => {
    const text = 'Hello World'
    const query = 'world'
    const { container } = render(<>{highlightMatch(text, query)}</>)

    const mark = container.querySelector('mark')
    expect(mark).not.toBeNull()
    expect(mark?.textContent).toBe('World')
    expect(container.textContent).toBe('Hello World')
  })

  it('should handle regex characters in query safely', () => {
    const text = 'Cost is $100.00?'
    const query = '$100.00?'
    const { container } = render(<>{highlightMatch(text, query)}</>)

    const mark = container.querySelector('mark')
    expect(mark).not.toBeNull()
    expect(mark?.textContent).toBe('$100.00?')
  })

  it('should handle multiple matches', () => {
    const text = 'The red ball and the RED car.'
    const query = 'red'
    const { container } = render(<>{highlightMatch(text, query)}</>)

    const marks = container.querySelectorAll('mark')
    expect(marks.length).toBe(2)
    expect(marks[0].textContent).toBe('red')
    expect(marks[1].textContent).toBe('RED')
  })
})
