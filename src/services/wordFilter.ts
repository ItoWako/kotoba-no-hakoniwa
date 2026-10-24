export const BLOCKED_WORD_MESSAGE = 'この言葉は入力できません。別の一語を選んでください。';

function normalizeWord(value: string): string {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s\u200B-\u200D\uFEFF]/gu, '')
    .replace(/[ァ-ヶ]/g, (character) => String.fromCharCode(character.charCodeAt(0) - 0x60));
}

// 入力全体が一致した場合に禁止する。
const EXACT_WORDS = [
  '死ね',
  'しね',
  '氏ね',
  '市ね',
  '消えろ',
  'きえろ',
  '失せろ',
  'うせろ',
  'くたばれ',
  '殺す',
  'ころす',
  'ぶっ殺す',
  'ぶっころす',
  '殺してやる',
  '自殺しろ',
  '馬鹿',
  'ばか',
  '阿呆',
  'あほ',
  'ぶす',
  'きもい',
  'きしょい',
  'ちんこ',
  'ちんぽ',
  'まんこ',
  'おっぱい',
  'セックス',
  'sex',
  'fuck',
  'ちょん',
  'チャンコロ',
  'きちがい',
  'ガイジ',
  '池沼',
  'かたわ',
  'うんち',
  'うんこ'
];

// 入力の一部に含まれていた場合に禁止する。
const PHRASES = [
  '死ね',
  '自殺しろ',
  'ぶっ殺',
  'ぶっころ',
  '殺してやる',
  '犯してやる',
  '強姦',
  'レイプ',
  '児童ポルノ',
  'ちんこ',
  'ちんぽ',
  'まんこ',
  'プロンプト',
  '指示を無視',
  '命令を無視',
  '指示を忘れ',
  '命令を忘れ',
  'ignore previous',
  'ignore all instructions',
  'system prompt'
];

const normalizedExactWords = new Set(EXACT_WORDS.map(normalizeWord));
const normalizedPhrases = PHRASES.map(normalizeWord);

export function isBlockedWord(value: string): boolean {
  const normalized = normalizeWord(value);

  return normalizedExactWords.has(normalized) || normalizedPhrases.some((phrase) => normalized.includes(phrase));
}
