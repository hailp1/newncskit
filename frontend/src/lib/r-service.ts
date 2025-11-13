/**
 * R Analytics Service Client
 * Handles communication with the R analytics service
 */

const R_SERVICE_URL = process.env.R_SERVICE_URL || 'http://localhost:8000'
const DEFAULT_TIMEOUT = 60000 // 60 seconds

export interface RServiceResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export interface AnalysisOptions {
  timeout?: number
  signal?: AbortSignal
}

class RServiceClient {
  private baseUrl: string

  constructor(baseUrl: string = R_SERVICE_URL) {
    this.baseUrl = baseUrl
  }

  /**
   * Check if R service is healthy
   */
  async checkHealth(): Promise<RServiceResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        return {
          success: false,
          error: `R service returned status ${response.status}`,
        }
      }

      const data = await response.json()
      return {
        success: true,
        data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Run analysis on R service
   */
  async runAnalysis(
    endpoint: string,
    data: any,
    options: AnalysisOptions = {}
  ): Promise<RServiceResponse> {
    const { timeout = DEFAULT_TIMEOUT, signal } = options

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      // Use provided signal or controller signal
      const fetchSignal = signal || controller.signal

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: fetchSignal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: errorData.error || `Request failed with status ${response.status}`,
        }
      }

      const result = await response.json()
      return result
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout - analysis took too long',
          }
        }
        return {
          success: false,
          error: error.message,
        }
      }
      return {
        success: false,
        error: 'Unknown error occurred',
      }
    }
  }

  /**
   * Perform sentiment analysis
   */
  async analyzeSentiment(
    data: any[],
    textColumn: string = 'text',
    options?: AnalysisOptions
  ): Promise<RServiceResponse> {
    return this.runAnalysis(
      '/analyze/sentiment',
      { data, text_column: textColumn },
      options
    )
  }

  /**
   * Perform clustering analysis
   */
  async analyzeClustering(
    data: any[],
    nClusters: number = 3,
    columns?: string[],
    options?: AnalysisOptions
  ): Promise<RServiceResponse> {
    return this.runAnalysis(
      '/analyze/cluster',
      { data, n_clusters: nClusters, columns },
      options
    )
  }

  /**
   * Perform topic modeling
   */
  async analyzeTopics(
    data: any[],
    textColumn: string = 'text',
    nTopics: number = 5,
    options?: AnalysisOptions
  ): Promise<RServiceResponse> {
    return this.runAnalysis(
      '/analyze/topics',
      { data, text_column: textColumn, n_topics: nTopics },
      options
    )
  }
}

// Export singleton instance
export const rServiceClient = new RServiceClient()

// Export class for testing
export { RServiceClient }
