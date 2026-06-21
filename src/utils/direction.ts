const RTL_CHARS = /[֐-׿؀-ۿݐ-ݿ]/

export function detectDirection(text: string): 'rtl' | 'ltr' {
  const firstMeaningful = text.trim().charAt(0)
  return RTL_CHARS.test(firstMeaningful) ? 'rtl' : 'ltr'
}
