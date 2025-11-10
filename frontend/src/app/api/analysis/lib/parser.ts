import Papa from 'papaparse';
import { ApiError } from './errors';

export interface ParsedCsvData {
  headers: string[];
  allRows: string[][];
  previewRows: Record<string, string>[];
}

/**
 * Parse raw CSV content with delimiter detection and sanitization.
 */
export function parseCsvContent(content: string, correlationId: string): ParsedCsvData {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    throw new ApiError('File must contain at least a header row and one data row', {
      status: 400,
      details: { correlationId },
    });
  }

  const delimiter = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0]
    .split(delimiter)
    .map((header) => header.trim().replace(/^["']|["']$/g, ''))
    .filter((header) => header.length > 0);

  if (headers.length === 0) {
    throw new ApiError('No valid headers found in CSV file', {
      status: 400,
      details: { correlationId },
    });
  }

  const allRows = lines.map((line) =>
    line
      .split(delimiter)
      .map((value) => value.trim().replace(/^["']|["']$/g, ''))
  );

  const previewRows = lines.slice(1, Math.min(6, lines.length)).map((line) => {
    const values = line
      .split(delimiter)
      .map((value) => value.trim().replace(/^["']|["']$/g, ''));

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    return row;
  });

  return {
    headers,
    allRows,
    previewRows,
  };
}

/**
 * Parse CSV via Papa Parse (used in health route) for typed rows.
 */
export function parseCsvWithPapa(content: string, correlationId: string) {
  const parsed = Papa.parse(content, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    throw new ApiError('CSV parsing failed', {
      status: 500,
      details: { correlationId, errors: parsed.errors.slice(0, 3) },
    });
  }

  const headers = Object.keys(parsed.data[0] || {});
  const allRows = [
    headers,
    ...parsed.data.map((row: any) => headers.map((header) => row[header] ?? '')),
  ];

  return { parsed, headers, allRows };
}

