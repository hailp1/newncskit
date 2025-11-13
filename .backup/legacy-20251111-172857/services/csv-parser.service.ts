import Papa from 'papaparse';
import { DataType } from '@/types/analysis';

export interface ParsedCSV {
  data: any[];
  headers: string[];
  rowCount: number;
  columnCount: number;
  errors: Papa.ParseError[];
}

export interface DataTypeInfo {
  type: DataType;
  confidence: number;
  uniqueCount: number;
  missingCount: number;
  sampleValues: any[];
}

export class CSVParserService {
  /**
   * Parse CSV file content
   */
  static async parseCSV(fileContent: string): Promise<ParsedCSV> {
    return new Promise((resolve, reject) => {
      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false, // Keep as strings for better control
        complete: (results) => {
          const headers = results.meta.fields || [];
          const data = results.data;

          resolve({
            data,
            headers,
            rowCount: data.length,
            columnCount: headers.length,
            errors: results.errors,
          });
        },
        error: (error) => {
          reject(new Error(`CSV parsing failed: ${error.message}`));
        },
      });
    });
  }

  /**
   * Detect data type for a column
   */
  static detectDataType(values: any[]): DataTypeInfo {
    const nonEmptyValues = values.filter(v => v !== null && v !== undefined && v !== '');
    const uniqueValues = new Set(nonEmptyValues);
    const missingCount = values.length - nonEmptyValues.length;

    // Check if numeric
    const numericValues = nonEmptyValues.filter(v => !isNaN(Number(v)));
    const numericRatio = numericValues.length / nonEmptyValues.length;

    // Check if date
    const dateValues = nonEmptyValues.filter(v => {
      const date = new Date(v);
      return !isNaN(date.getTime()) && v.toString().match(/\d{1,4}[-/]\d{1,2}[-/]\d{1,4}/);
    });
    const dateRatio = dateValues.length / nonEmptyValues.length;

    // Determine type
    let type: DataType;
    let confidence: number;

    if (numericRatio > 0.9) {
      type = 'numeric';
      confidence = numericRatio;
    } else if (dateRatio > 0.8) {
      type = 'date';
      confidence = dateRatio;
    } else if (uniqueValues.size <= Math.min(20, nonEmptyValues.length * 0.5)) {
      type = 'categorical';
      confidence = 1 - (uniqueValues.size / nonEmptyValues.length);
    } else {
      type = 'text';
      confidence = 0.8;
    }

    return {
      type,
      confidence,
      uniqueCount: uniqueValues.size,
      missingCount,
      sampleValues: Array.from(uniqueValues).slice(0, 10),
    };
  }

  /**
   * Detect data types for all columns
   */
  static detectDataTypes(data: any[]): Map<string, DataTypeInfo> {
    const result = new Map<string, DataTypeInfo>();

    if (data.length === 0) return result;

    const headers = Object.keys(data[0]);

    for (const header of headers) {
      const values = data.map(row => row[header]);
      const typeInfo = this.detectDataType(values);
      result.set(header, typeInfo);
    }

    return result;
  }

  /**
   * Generate preview of data (first N rows)
   */
  static generatePreview(data: any[], rows: number = 10): any[] {
    return data.slice(0, rows);
  }

  /**
   * Validate CSV structure
   */
  static validateCSV(parsed: ParsedCSV): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (parsed.headers.length === 0) {
      errors.push('CSV file has no headers');
    }

    if (parsed.rowCount === 0) {
      errors.push('CSV file has no data rows');
    }

    // Check for duplicate headers
    const headerSet = new Set(parsed.headers);
    if (headerSet.size !== parsed.headers.length) {
      errors.push('CSV file has duplicate column headers');
    }

    // Check for empty headers
    const emptyHeaders = parsed.headers.filter(h => !h || h.trim() === '');
    if (emptyHeaders.length > 0) {
      errors.push(`CSV file has ${emptyHeaders.length} empty column header(s)`);
    }

    // Check for critical parsing errors
    const criticalErrors = parsed.errors.filter(
      e => e.type === 'Quotes' || e.type === 'FieldMismatch'
    );
    if (criticalErrors.length > 0) {
      errors.push(`CSV parsing errors: ${criticalErrors[0].message}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get basic statistics for numeric column
   */
  static getNumericStats(values: any[]): {
    min: number;
    max: number;
    mean: number;
    median: number;
    stdDev: number;
  } | null {
    const numericValues = values
      .filter(v => v !== null && v !== undefined && v !== '')
      .map(v => Number(v))
      .filter(v => !isNaN(v));

    if (numericValues.length === 0) return null;

    const sorted = [...numericValues].sort((a, b) => a - b);
    const sum = numericValues.reduce((acc, val) => acc + val, 0);
    const mean = sum / numericValues.length;

    const variance = numericValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numericValues.length;
    const stdDev = Math.sqrt(variance);

    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

    return {
      min: Math.min(...numericValues),
      max: Math.max(...numericValues),
      mean,
      median,
      stdDev,
    };
  }

  /**
   * Handle different encodings
   */
  static async detectEncoding(file: File): Promise<string> {
    // Try to detect encoding by reading first few bytes
    const buffer = await file.slice(0, 1000).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Check for BOM
    if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
      return 'UTF-8';
    }
    if (bytes[0] === 0xFF && bytes[1] === 0xFE) {
      return 'UTF-16LE';
    }
    if (bytes[0] === 0xFE && bytes[1] === 0xFF) {
      return 'UTF-16BE';
    }

    // Default to UTF-8
    return 'UTF-8';
  }

  /**
   * Clean and normalize data
   */
  static cleanData(data: any[]): any[] {
    return data.map(row => {
      const cleanedRow: any = {};
      for (const [key, value] of Object.entries(row)) {
        // Trim whitespace
        if (typeof value === 'string') {
          cleanedRow[key] = value.trim();
        } else {
          cleanedRow[key] = value;
        }
      }
      return cleanedRow;
    });
  }
}
