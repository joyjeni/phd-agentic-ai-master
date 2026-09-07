const TOKEN_RE = /[A-Za-z0-9_#@./:-]+/g;

export function tokenize(text: string): string[] {
  return (text.toLowerCase().match(TOKEN_RE) ?? []).filter((token) => token.length > 1);
}

export function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

export function clamp(value: number, lower = 0, upper = 1): number {
  return Math.max(lower, Math.min(upper, value));
}

export function mean(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function cosine(left: Map<string, number>, right: Map<string, number>): number {
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  for (const [token, weight] of left) {
    leftNorm += weight * weight;
    const other = right.get(token);
    if (other) dot += weight * other;
  }
  for (const weight of right.values()) rightNorm += weight * weight;
  if (!leftNorm || !rightNorm) return 0;
  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
}

export function bag(tokens: string[], weight = 1): Map<string, number> {
  const counts = new Map<string, number>();
  for (const token of tokens) {
    counts.set(token, (counts.get(token) ?? 0) + weight);
  }
  return counts;
}

export function mergeBags(
  bags: Array<{ bag: Map<string, number>; weight: number }>,
): Map<string, number> {
  const merged = new Map<string, number>();
  for (const { bag: weights, weight } of bags) {
    for (const [token, value] of weights) {
      merged.set(token, (merged.get(token) ?? 0) + value * weight);
    }
  }
  return merged;
}

export function tfidf(
  tokens: string[],
  documentFrequency: Map<string, number>,
  nDocs: number,
): Map<string, number> {
  const tf = bag(tokens);
  const vector = new Map<string, number>();
  const length = Math.max(tokens.length, 1);
  for (const [token, count] of tf) {
    const df = documentFrequency.get(token) ?? 1;
    const idf = Math.log((nDocs - df + 0.5) / (df + 0.5) + 1);
    vector.set(token, (count / length) * idf);
  }
  return vector;
}

export function bm25(
  queryTokens: string[],
  docTokens: string[],
  documentFrequency: Map<string, number>,
  nDocs: number,
  avgdl: number,
  k1 = 1.5,
  b = 0.75,
): number {
  const tf = bag(docTokens);
  const dl = Math.max(docTokens.length, 1);
  let score = 0;
  for (const token of unique(queryTokens)) {
    const freq = tf.get(token) ?? 0;
    if (!freq) continue;
    const df = documentFrequency.get(token) ?? 1;
    const idf = Math.log((nDocs - df + 0.5) / (df + 0.5) + 1);
    const denom = freq + k1 * (1 - b + b * (dl / Math.max(avgdl, 1)));
    score += idf * ((freq * (k1 + 1)) / denom);
  }
  return score;
}

export function overlap(left: string, right: string): number {
  const a = new Set(tokenize(left));
  const b = new Set(tokenize(right));
  if (!a.size || !b.size) return 0;
  let hits = 0;
  for (const token of a) if (b.has(token)) hits += 1;
  return hits / Math.sqrt(a.size * b.size);
}

export function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function seededUnit(seed: string): number {
  return hashString(seed) / 4294967295;
}

export function nowId(prefix = "run"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Bihar",
  "Gujarat",
  "Haryana",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "West Bengal",
];

export const COMMODITIES = [
  "Wheat",
  "Rice",
  "Paddy",
  "Maize",
  "Onion",
  "Tomato",
  "Potato",
  "Cotton",
  "Sugarcane",
  "Soyabean",
  "Groundnut",
  "Turmeric",
  "Chilli",
  "Mustard",
  "Bajra",
];

export function extractSlot(query: string, options: string[]): string | undefined {
  const lowered = query.toLowerCase();
  const ranked = [...options].sort((a, b) => b.length - a.length);
  return ranked.find((option) => {
    const token = option.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z0-9])${token}([^a-z0-9]|$)`, "i").test(lowered);
  });
}

export function extractYear(query: string): string | undefined {
  const match = query.match(/\b(19|20)\d{2}\b/);
  return match?.[0];
}

export function looksMultiTool(query: string): boolean {
  return /\b(and|then|compare|versus|vs|also|plus|after|before|both)\b/i.test(query);
}
