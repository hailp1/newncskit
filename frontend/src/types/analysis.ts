export interface AnalysisResult {
  id: string;
  name: string;
  type: string;
  data: any;
  charts?: any[];
  summary?: string;
  created_at: string;
}