import bcrypt from 'bcryptjs';

/**
 * 🔒 Service Password
 * 
 * Gère le hashage et la vérification des mots de passe
 */
class PasswordService {
    private readonly saltRounds: number = 10;

    /**
     * Hash un mot de passe
     * 
     * @param password - Mot de passe en clair
     * @returns Mot de passe hashé
     */
    async hash(password: string): Promise<string> {
        return bcrypt.hash(password, this.saltRounds);
    }

    /**
     * Vérifie si un mot de passe correspond au hash
     * 
     * @param password - Mot de passe en clair
     * @param hash - Hash à comparer
     * @returns true si le mot de passe correspond
     */
    async verify(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    /**
     * Valide la force d'un mot de passe
     * 
     * @param password - Mot de passe à valider
     * @returns true si le mot de passe est assez fort
     */
    validateStrength(password: string): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }

    /**
     * Génère un mot de passe aléatoire sécurisé
     * 
     * @param length - Longueur du mot de passe (défaut: 16)
     * @returns Mot de passe généré
     */
    generateSecure(length: number = 16): string {
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const special = '!@#$%^&*(),.?":{}|<>';
        const all = uppercase + lowercase + numbers + special;

        let password = '';

        // Assurer au moins un caractère de chaque type
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += special[Math.floor(Math.random() * special.length)];

        // Remplir le reste
        for (let i = password.length; i < length; i++) {
            password += all[Math.floor(Math.random() * all.length)];
        }

        // Mélanger les caractères
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }
}

export const passwordService = new PasswordService();
