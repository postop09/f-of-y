// 입력 줄의 명령어. 이 단어 하나만 치면 질문 대신 명령으로 처리하고, 그 밖의 입력은 Jev에 묻는 질문이 된다.

export const COMMANDS = [
  { name: 'help', desc: '명령어 목록' },
  { name: 'categories', desc: '카테고리 목록 (눌러서 그 카테고리 항목 보기)' },
  { name: 'clear', desc: '상태 초기화' },
  { name: 'cd ..', desc: '이전으로 돌아가기' },
] as const

export type Command = (typeof COMMANDS)[number]['name']

/** 입력이 명령어면 그 이름, 아니면 null (앞뒤 공백·대소문자 무시, 사이 공백은 하나로) */
export const parseCommand = (input: string): Command | null => {
  const s = input.trim().replace(/\s+/g, ' ').toLowerCase()
  return COMMANDS.find((c) => c.name === s)?.name ?? null
}
