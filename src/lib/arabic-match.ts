// Arabic text normalizer for fuzzy matching
export function normalizeArabic(text: string): string {
  return text
    .trim()
    .toLowerCase()
    // Remove diacritics (tashkeel)
    .replace(/[ًٌٍَُِّْ]/g, "")
    // Normalize alef
    .replace(/[أإآا]/g, "ا")
    // Normalize ya
    .replace(/[يى]/g, "ي")
    // Normalize teh marbuta
    .replace(/ة/g, "ه")
    // Remove definite article
    .replace(/^ال/g, "")
    // Remove extra spaces
    .replace(/\s+/g, " ")
    .trim()
}

export function getWords(text: string): string[] {
  return normalizeArabic(text).split(/\s+/).filter(Boolean)
}

// Jaccard similarity on word sets
export function wordSimilarity(a: string, b: string): number {
  const wordsA = new Set(getWords(a))
  const wordsB = new Set(getWords(b))
  const intersection = new Set([...wordsA].filter((w) => wordsB.has(w)))
  const union = new Set([...wordsA, ...wordsB])
  return intersection.size / union.size
}

// Check if two names are a fuzzy match (threshold 0.4 = 40% word overlap)
export function isNameMatch(input: string, stored: string, threshold = 0.4): boolean {
  return wordSimilarity(input, stored) >= threshold
}
