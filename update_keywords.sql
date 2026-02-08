UPDATE sources 
SET config = CASE 
    WHEN config IS NULL THEN jsonb_build_object('keywords', ARRAY['moyen', 'bon'])
    ELSE config || jsonb_build_object('keywords', ARRAY['moyen', 'bon'])
END
WHERE name = 'The rip';
