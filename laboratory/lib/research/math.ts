/** Dense linear algebra used by APRR (policy weights) and FCNP (Kirchhoff). */

export function zeros(n: number, m = n): number[][] {
  return Array.from({ length: n }, () => Array.from({ length: m }, () => 0));
}

export function fillMatrix(n: number, value: number, diagonal = 0): number[][] {
  const out = zeros(n);
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < n; j += 1) out[i][j] = i === j ? diagonal : value;
  }
  return out;
}

export function cloneMatrix(matrix: number[][]): number[][] {
  return matrix.map((row) => row.slice());
}

export function dot(a: number[], b: number[]): number {
  let s = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i += 1) s += a[i] * b[i];
  return s;
}

export function norm(v: number[]): number {
  return Math.sqrt(dot(v, v));
}

export function cosineVec(a: number[], b: number[]): number {
  const d = norm(a) * norm(b);
  if (!d) return 0;
  return dot(a, b) / d;
}

export function meanStd(values: number[]): { mean: number; std: number } {
  if (!values.length) return { mean: 0, std: 1 };
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const varSum = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return { mean, std: Math.sqrt(varSum) };
}

export function zscore(values: number[]): number[] {
  const { mean, std } = meanStd(values);
  const denom = std + 1e-6;
  return values.map((v) => (v - mean) / denom);
}

export function hashedEmbedding(text: string, dim = 32): number[] {
  const vec = Array.from({ length: dim }, () => 0);
  const tokens = text.toLowerCase().match(/[a-z0-9_]+/g) ?? [];
  for (const token of tokens) {
    let h = 2166136261;
    for (let i = 0; i < token.length; i += 1) {
      h ^= token.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    const idx = (h >>> 0) % dim;
    const sign = (h >>> 8) & 1 ? 1 : -1;
    vec[idx] += sign;
  }
  const n = norm(vec);
  if (n) for (let i = 0; i < dim; i += 1) vec[i] /= n;
  return vec;
}

/** Gaussian elimination with partial pivoting. Falls back to a least-squares-ish ridge if singular. */
export function solveLinear(Ain: number[][], bin: number[]): number[] {
  const n = bin.length;
  const A = Ain.map((row, i) => [...row.slice(0, n), bin[i]]);
  for (let k = 0; k < n; k += 1) {
    let piv = k;
    let best = Math.abs(A[k][k]);
    for (let i = k + 1; i < n; i += 1) {
      const v = Math.abs(A[i][k]);
      if (v > best) {
        best = v;
        piv = i;
      }
    }
    if (best < 1e-12) {
      A[k][k] += 1e-6;
    }
    if (piv !== k) {
      const tmp = A[k];
      A[k] = A[piv];
      A[piv] = tmp;
    }
    const diag = A[k][k] || 1e-12;
    for (let i = k + 1; i < n; i += 1) {
      const f = A[i][k] / diag;
      for (let j = k; j <= n; j += 1) A[i][j] -= f * A[k][j];
    }
  }
  const x = Array.from({ length: n }, () => 0);
  for (let i = n - 1; i >= 0; i -= 1) {
    let s = A[i][n];
    for (let j = i + 1; j < n; j += 1) s -= A[i][j] * x[j];
    x[i] = s / (A[i][i] || 1e-12);
  }
  return x;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedFrom(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
