import axios from 'axios'

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'

export interface SentimentAnalysis {
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'MIXED'
  score: number
  confidence: number
}

export class AIService {
  async analyzeSentiment(text: string): Promise<SentimentAnalysis> {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/analyze/sentiment`,
        { text },
        { timeout: 5000 }
      )

      const { sentiment, scores, confidence } = response.data

      // Normaliser le score entre -1 et 1
      const score = scores?.positive - (scores?.negative || 0) || 0

      return {
        sentiment: sentiment || 'NEUTRAL',
        score: Math.max(-1, Math.min(1, score)),
        confidence: confidence || 0.5,
      }
    } catch (error) {
      console.error('Sentiment analysis service error:', error)
      throw error
    }
  }

  async extractKeywords(text: string, limit: number = 5): Promise<string[]> {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/analyze/keywords`,
        { text, limit },
        { timeout: 5000 }
      )

      // Extract just the words from the response
      const keywords = response.data?.keywords || []
      return keywords.map((k: any) => typeof k === 'string' ? k : k.word).slice(0, limit)
    } catch (error) {
      console.warn('AI keyword extraction failed:', error)
      return []
    }
  }
}

export const aiService = new AIService()