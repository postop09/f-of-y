import { describe, expect, it } from 'vitest'
import { parseCommand } from './commands'

describe('parseCommand', () => {
  it('reads a bare command, ignoring case and spaces', () => {
    expect(parseCommand('help')).toBe('help')
    expect(parseCommand('  CLEAR ')).toBe('clear')
    expect(parseCommand('Categories')).toBe('categories')
    expect(parseCommand('cd ..')).toBe('cd ..')
    expect(parseCommand(' cd   .. ')).toBe('cd ..')
  })
  it('leaves questions alone, even ones that mention a command', () => {
    expect(parseCommand('help me')).toBeNull()
    expect(parseCommand('categories 중에 뭐가 제일 자신 있어요?')).toBeNull()
    expect(parseCommand('디자인 시스템')).toBeNull()
  })
})
