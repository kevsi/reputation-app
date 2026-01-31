import { prisma } from '../config/database'
import { aiService } from '../services/ai.service'

export async function extractKeywords(text: string, brandId: string): Promise<string[]> {
  try {
    // Récupérer les mots-clés de la marque
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      select: { keywords: true },
    })

    const brandKeywords = brand?.keywords || []

    // Matcher les mots-clés avec le texte
    const detectedKeywords = brandKeywords.filter((keyword: string) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      return regex.test(text)
    })

    // Appel optionnel au service IA pour extraction avancée
    try {
      const aiKeywords = await aiService.extractKeywords(text, 5)
      return [...new Set([...detectedKeywords, ...aiKeywords])] // Déduplication
    } catch (e) {
      console.warn('AI keyword extraction failed, using manual extraction')
      return detectedKeywords
    }
  } catch (error) {
    console.error('Keyword extraction error:', error)
    return []
  }
}