DELETE FROM sources;
INSERT INTO sources (id, name, url, type, "brandId", "isActive", "scrapingFrequency", "createdAt", "updatedAt") 
VALUES (gen_random_uuid(), 'Nike Google Reviews', 'https://www.google.com/search?q=Nike', 'GOOGLE_REVIEWS', 'cml9j4s6e0003f1w5014i0u09', true, 3600, NOW(), NOW());
