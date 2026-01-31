"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractKeywords = extractKeywords;
const database_1 = require("../config/database");
const ai_service_1 = require("../services/ai.service");
async function extractKeywords(text, brandId) {
    try {
        // Récupérer les mots-clés de la marque
        const brand = await database_1.prisma.brand.findUnique({
            where: { id: brandId },
            select: { keywords: true },
        });
        const brandKeywords = brand?.keywords || [];
        // Matcher les mots-clés avec le texte
        const detectedKeywords = brandKeywords.filter((keyword) => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            return regex.test(text);
        });
        // Appel optionnel au service IA pour extraction avancée
        try {
            const aiKeywords = await ai_service_1.aiService.extractKeywords(text, 5);
            return [...new Set([...detectedKeywords, ...aiKeywords])]; // Déduplication
        }
        catch (e) {
            console.warn('AI keyword extraction failed, using manual extraction');
            return detectedKeywords;
        }
    }
    catch (error) {
        console.error('Keyword extraction error:', error);
        return [];
    }
}
