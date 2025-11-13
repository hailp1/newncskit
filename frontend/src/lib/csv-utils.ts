import { readFile } from 'fs/promises';
import Papa from 'papaparse';

/**
 * Reads a CSV file from the file system and parses it into a 2D array
 * @param filePath - Absolute or relative path to the CSV file
 * @returns Promise resolving to a 2D array of CSV data
 * @throws Error if file not found or parsing fails
 */
export async function readCsvFile(filePath: string): Promise<string[][]> {
  try {
    // Read the file content
    const fileContent = await readFile(filePath, 'utf-8');
    
    // Parse CSV content
    const parseResult = Papa.parse<string[]>(fileContent, {
      skipEmptyLines: true,
      header: false, // Return as 2D array, not objects
    });

    if (parseResult.errors.length > 0) {
      const errorMessages = parseResult.errors
        .map(err => `Row ${err.row}: ${err.message}`)
        .join('; ');
      throw new Error(`CSV parsing errors: ${errorMessages}`);
    }

    if (!parseResult.data || parseResult.data.length === 0) {
      throw new Error('CSV file is empty or contains no valid data');
    }

    return parseResult.data;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`CSV file not found: ${filePath}`);
    }
    if ((error as NodeJS.ErrnoException).code === 'EACCES') {
      throw new Error(`Permission denied reading CSV file: ${filePath}`);
    }
    throw error;
  }
}

/**
 * R-compatible data format
 */
export interface RAnalysisData {
  data: Record<string, any[]>; // Column name -> values
  variables: {
    numeric: string[];
    categorical: string[];
  };
  groups: Record<string, string[]>; // Group name -> variable names
  demographics?: Record<string, DemographicInfo>;
}

export interface DemographicInfo {
  columnName: string;
  type: string;
  categories?: string[];
  ranks?: RankDefinition[];
}

export interface RankDefinition {
  label: string;
  min?: number;
  max?: number;
  values?: any[];
}

export interface AnalysisVariable {
  columnName: string;
  displayName?: string | null;
  dataType?: string | null;
  isDemographic: boolean;
  demographicType?: string | null;
  group?: { name: string } | null;
}

export interface VariableGroup {
  name: string;
  variables: { columnName: string }[];
}

/**
 * Transforms CSV data and variables into R-compatible format
 * @param csvData - 2D array of CSV data (first row is headers)
 * @param variables - Array of analysis variables with metadata
 * @param groups - Array of variable groups
 * @returns R-compatible data structure
 */
export function prepareDataForR(
  csvData: string[][],
  variables: AnalysisVariable[],
  groups: VariableGroup[] = []
): RAnalysisData {
  if (!csvData || csvData.length === 0) {
    throw new Error('CSV data is empty');
  }

  // Extract headers (first row)
  const headers = csvData[0];
  const dataRows = csvData.slice(1);

  // Convert 2D array to column-based object structure
  const data: Record<string, any[]> = {};
  headers.forEach((header, colIndex) => {
    data[header] = dataRows.map(row => row[colIndex]);
  });

  // Separate variables into numeric and categorical
  const numericVars: string[] = [];
  const categoricalVars: string[] = [];

  variables.forEach(variable => {
    const dataType = variable.dataType?.toLowerCase();
    if (dataType === 'numeric' || dataType === 'number' || dataType === 'integer' || dataType === 'float') {
      numericVars.push(variable.columnName);
    } else {
      categoricalVars.push(variable.columnName);
    }
  });

  // Transform variable groups into group name to variable names mapping
  const groupsMap: Record<string, string[]> = {};
  groups.forEach(group => {
    groupsMap[group.name] = group.variables.map(v => v.columnName);
  });

  return {
    data,
    variables: {
      numeric: numericVars,
      categorical: categoricalVars,
    },
    groups: groupsMap,
  };
}

/**
 * Applies demographic ranks and categories to R data format
 * @param rData - R-compatible data structure
 * @param variables - Array of analysis variables with demographic information
 * @returns Updated R data with demographic information
 */
export function applyDemographicData(
  rData: RAnalysisData,
  variables: AnalysisVariable[]
): RAnalysisData {
  // Extract demographic variables
  const demographicVars = variables.filter(v => v.isDemographic);

  if (demographicVars.length === 0) {
    return rData;
  }

  // Build demographics mapping
  const demographics: Record<string, DemographicInfo> = {};

  demographicVars.forEach(variable => {
    const columnName = variable.columnName;
    const demographicType = variable.demographicType || 'unknown';

    // Get unique values from the data for this column
    const columnData = rData.data[columnName] || [];
    const uniqueValues = Array.from(new Set(columnData.filter(v => v !== null && v !== undefined && v !== '')));

    demographics[columnName] = {
      columnName,
      type: demographicType,
      categories: uniqueValues.map(v => String(v)),
    };

    // For numeric demographic types (age, income), we might want to add rank definitions
    // This can be extended based on specific demographic type requirements
    if (variable.dataType?.toLowerCase() === 'numeric' || variable.dataType?.toLowerCase() === 'number') {
      const numericValues = columnData
        .map(v => parseFloat(v))
        .filter(v => !isNaN(v));

      if (numericValues.length > 0) {
        const min = Math.min(...numericValues);
        const max = Math.max(...numericValues);

        demographics[columnName].ranks = [
          {
            label: `${min} - ${max}`,
            min,
            max,
          },
        ];
      }
    }
  });

  return {
    ...rData,
    demographics,
  };
}
