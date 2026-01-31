import { BaseParser, GenericWebParser } from './base.parser';
import { ScrapedMention, ScraperConfig } from '../types/scraping.types';

export class ForumParser extends GenericWebParser {
    // Forums often have specific pagination or thread structures
    // This can be extended later for specific forum software (vBulletin, XenForo, etc.)
    override parse(html: string, config: ScraperConfig): ScrapedMention[] {
        const mentions = super.parse(html, config);

        // Additional forum-specific logic could go here
        // e.g., identifying if it's a main post or a reply

        return mentions.map(m => ({
            ...m,
            rawData: {
                ...m.rawData,
                isForumPost: true
            }
        }));
    }
}
