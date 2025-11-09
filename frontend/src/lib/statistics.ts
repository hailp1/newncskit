/**
 * Statistical Utilities
 * Client-side statistical calculations
 */

export interface QuartileResult {
  q1: number;
  q2: number; // median
  q3: number;
  iqr: number;
}

export interface DescriptiveStats {
  count: number;
  sum: number;
  mean: number;
  median: number;
  mode: number | null;
  variance: number;
  std: number;
  min: number;
  max: number;
  range: number;
  skewness: number;
  kurtosis: number;
}

/**
 * Calculate quartiles (Q1, Q2/Median, Q3) and IQR
 */
export function calculateQuartiles(values: number[]): QuartileResult {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  
  if (n === 0) {
    return { q1: 0, q2: 0, q3: 0, iqr: 0 };
  }
  
  // Q2 (Median)
  const q2 = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];
  
  // Q1
  const q1Index = Math.floor(n * 0.25);
  const q1 = sorted[q1Index];
  
  // Q3
  const q3Index = Math.floor(n * 0.75);
  const q3 = sorted[q3Index];
  
  // IQR
  const iqr = q3 - q1;
  
  return { q1, q2, q3, iqr };
}

/**
 * Detect outliers using IQR method
 */
export function detectOutliersIQR(
  values: number[],
  multiplier: number = 1.5
): { outliers: number[]; indices: number[]; bounds: { lower: number; upper: number } } {
  const quartiles = calculateQuartiles(values);
  const lowerBound = quartiles.q1 - multiplier * quartiles.iqr;
  const upperBound = quartiles.q3 + multiplier * quartiles.iqr;
  
  const outliers: number[] = [];
  const indices: number[] = [];
  
  values.forEach((value, index) => {
    if (value < lowerBound || value > upperBound) {
      outliers.push(value);
      indices.push(index);
    }
  });
  
  return {
    outliers,
    indices,
    bounds: { lower: lowerBound, upper: upperBound }
  };
}

/**
 * Detect outliers using Z-score method
 */
export function detectOutliersZScore(
  values: number[],
  threshold: number = 3
): { outliers: number[]; indices: number[]; zScores: number[] } {
  const mean = calculateMean(values);
  const std = calculateStandardDeviation(values);
  
  const outliers: number[] = [];
  const indices: number[] = [];
  const zScores: number[] = [];
  
  values.forEach((value, index) => {
    const zScore = (value - mean) / std;
    zScores.push(zScore);
    
    if (Math.abs(zScore) > threshold) {
      outliers.push(value);
      indices.push(index);
    }
  });
  
  return { outliers, indices, zScores };
}

/**
 * Calculate mean (average)
 */
export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((a, b) => a + b, 0);
  return sum / values.length;
}

/**
 * Calculate median
 */
export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  
  return n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];
}

/**
 * Calculate mode (most frequent value)
 */
export function calculateMode(values: number[]): number | null {
  if (values.length === 0) return null;
  
  const frequency: Record<number, number> = {};
  let maxFreq = 0;
  let mode: number | null = null;
  
  values.forEach(value => {
    frequency[value] = (frequency[value] || 0) + 1;
    if (frequency[value] > maxFreq) {
      maxFreq = frequency[value];
      mode = value;
    }
  });
  
  // Return null if all values appear only once
  return maxFreq > 1 ? mode : null;
}

/**
 * Calculate variance
 */
export function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  
  const mean = calculateMean(values);
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Calculate standard deviation
 */
export function calculateStandardDeviation(values: number[]): number {
  return Math.sqrt(calculateVariance(values));
}

/**
 * Calculate skewness (measure of asymmetry)
 */
export function calculateSkewness(values: number[]): number {
  if (values.length < 3) return 0;
  
  const n = values.length;
  const mean = calculateMean(values);
  const std = calculateStandardDeviation(values);
  
  if (std === 0) return 0;
  
  const cubedDiffs = values.map(v => Math.pow((v - mean) / std, 3));
  const sum = cubedDiffs.reduce((a, b) => a + b, 0);
  
  return (n / ((n - 1) * (n - 2))) * sum;
}

/**
 * Calculate kurtosis (measure of tailedness)
 */
export function calculateKurtosis(values: number[]): number {
  if (values.length < 4) return 0;
  
  const n = values.length;
  const mean = calculateMean(values);
  const std = calculateStandardDeviation(values);
  
  if (std === 0) return 0;
  
  const fourthPowerDiffs = values.map(v => Math.pow((v - mean) / std, 4));
  const sum = fourthPowerDiffs.reduce((a, b) => a + b, 0);
  
  const kurtosis = (n * (n + 1) / ((n - 1) * (n - 2) * (n - 3))) * sum;
  const adjustment = (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
  
  return kurtosis - adjustment; // Excess kurtosis
}

/**
 * Calculate comprehensive descriptive statistics
 */
export function calculateDescriptiveStats(values: number[]): DescriptiveStats {
  if (values.length === 0) {
    return {
      count: 0,
      sum: 0,
      mean: 0,
      median: 0,
      mode: null,
      variance: 0,
      std: 0,
      min: 0,
      max: 0,
      range: 0,
      skewness: 0,
      kurtosis: 0
    };
  }
  
  const count = values.length;
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = calculateMean(values);
  const median = calculateMedian(values);
  const mode = calculateMode(values);
  const variance = calculateVariance(values);
  const std = Math.sqrt(variance);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const skewness = calculateSkewness(values);
  const kurtosis = calculateKurtosis(values);
  
  return {
    count,
    sum: Number(sum.toFixed(3)),
    mean: Number(mean.toFixed(3)),
    median: Number(median.toFixed(3)),
    mode,
    variance: Number(variance.toFixed(3)),
    std: Number(std.toFixed(3)),
    min,
    max,
    range,
    skewness: Number(skewness.toFixed(3)),
    kurtosis: Number(kurtosis.toFixed(3))
  };
}

/**
 * Calculate Pearson correlation coefficient
 */
export function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const n = x.length;
  const meanX = calculateMean(x);
  const meanY = calculateMean(y);
  const stdX = calculateStandardDeviation(x);
  const stdY = calculateStandardDeviation(y);
  
  if (stdX === 0 || stdY === 0) return 0;
  
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += ((x[i] - meanX) / stdX) * ((y[i] - meanY) / stdY);
  }
  
  return sum / (n - 1);
}

/**
 * Calculate percentile
 */
export function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  if (percentile < 0 || percentile > 100) {
    throw new Error('Percentile must be between 0 and 100');
  }
  
  const sorted = [...values].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  
  if (Number.isInteger(index)) {
    return sorted[index];
  }
  
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Normalize values to 0-1 range
 */
export function normalizeMinMax(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  
  if (range === 0) return values.map(() => 0);
  
  return values.map(v => (v - min) / range);
}

/**
 * Standardize values (z-score normalization)
 */
export function standardize(values: number[]): number[] {
  const mean = calculateMean(values);
  const std = calculateStandardDeviation(values);
  
  if (std === 0) return values.map(() => 0);
  
  return values.map(v => (v - mean) / std);
}

/**
 * Calculate frequency distribution
 */
export function calculateFrequency(values: any[]): Record<string, number> {
  const frequency: Record<string, number> = {};
  
  values.forEach(value => {
    const key = String(value);
    frequency[key] = (frequency[key] || 0) + 1;
  });
  
  return frequency;
}

/**
 * Calculate relative frequency (proportions)
 */
export function calculateRelativeFrequency(values: any[]): Record<string, number> {
  const frequency = calculateFrequency(values);
  const total = values.length;
  
  const relativeFreq: Record<string, number> = {};
  Object.entries(frequency).forEach(([key, count]) => {
    relativeFreq[key] = count / total;
  });
  
  return relativeFreq;
}
