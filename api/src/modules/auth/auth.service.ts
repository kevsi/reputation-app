import { LoginInput, RegisterInput, AuthResponse } from './auth.types';
import { jwtService, JwtPayload } from './jwt.service';
import { passwordService } from './password.service';
import { prisma } from '@/shared/database/prisma.client';
import { AppError } from '@/shared/utils/errors';
import { logger } from '@/infrastructure/logger';
import { Role, SubscriptionTier, SubscriptionStatus } from '@sentinelle/database';

/**
 * 🔐 Service Auth
 * 
 * Gère l'authentification (Login, Register) avec JWT et bcrypt
 */
class AuthService {

    /**
     * Connexion d'un utilisateur
     */
    async login(input: LoginInput): Promise<AuthResponse> {
        try {
            // Récupérer l'utilisateur par email
            const user = await prisma.user.findUnique({
                where: { email: input.email },
                include: {
                    organization: true,
                },
            });

            if (!user) {
                throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
            }

            // Vérifier si l'utilisateur est actif
            if (!user.isActive) {
                throw new AppError('Account is disabled', 403, 'ACCOUNT_DISABLED');
            }

            // Vérifier le mot de passe
            const isPasswordValid = await passwordService.verify(input.password, user.password);

            if (!isPasswordValid) {
                throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
            }

            // Générer les tokens JWT
            const payload: JwtPayload = {
                userId: user.id,
                email: user.email,
                organizationId: user.organizationId,
                role: user.role,
            };

            const { accessToken, refreshToken } = jwtService.generateTokenPair(payload);

            logger.info('User logged in successfully', { userId: user.id, email: user.email });

            // Retourner la réponse (sans le mot de passe)
            const { password: _, ...userWithoutPassword } = user;

            return {
                success: true,
                accessToken,
                refreshToken,
                user: userWithoutPassword as any,
            };

        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Login error', error);
            throw new AppError('Login failed', 500, 'LOGIN_ERROR');
        }
    }

    /**
     * Inscription d'un nouvel utilisateur
     */
    async register(input: RegisterInput): Promise<AuthResponse> {
        try {
            // Vérifier si l'email existe déjà
            const existingUser = await prisma.user.findUnique({
                where: { email: input.email },
            });

            if (existingUser) {
                throw new AppError('Email already exists', 409, 'EMAIL_EXISTS');
            }

            // Valider la force du mot de passe
            const passwordValidation = passwordService.validateStrength(input.password);
            if (!passwordValidation.valid) {
                throw new AppError(
                    'Password is too weak',
                    400,
                    'WEAK_PASSWORD',
                    true,
                    passwordValidation.errors
                );
            }

            // Hasher le mot de passe
            const hashedPassword = await passwordService.hash(input.password);

            // Générer un slug pour l'organisation
            const slug = input.organizationName
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '') || `org-${Date.now()}`;

            // Créer l'utilisateur avec son organisation dans une transaction
            const user = await prisma.$transaction(async (tx) => {
                // Créer l'utilisateur d'abord
                const newUser = await tx.user.create({
                    data: {
                        email: input.email,
                        password: hashedPassword,
                        name: input.name,
                        role: Role.ADMIN, // Le premier utilisateur est admin
                        isActive: true,
                    }
                });

                // Créer l'organisation avec cet utilisateur comme propriétaire
                const organization = await tx.organization.create({
                    data: {
                        name: input.organizationName,
                        slug: `${slug}-${Math.random().toString(36).substring(2, 7)}`, // On ajoute un petit suffixe pour éviter les conflits de slug
                        ownerId: newUser.id,
                        subscription: {
                            create: {
                                plan: SubscriptionTier.FREE,
                                status: SubscriptionStatus.ACTIVE
                            }
                        }
                    }
                });

                // Mettre à jour l'utilisateur pour le lier à l'organisation
                return await tx.user.update({
                    where: { id: newUser.id },
                    data: { organizationId: organization.id },
                    include: {
                        organization: true
                    }
                });
            });

            // Générer les tokens JWT
            const payload: JwtPayload = {
                userId: user.id,
                email: user.email,
                organizationId: user.organizationId,
                role: user.role,
            };

            const { accessToken, refreshToken } = jwtService.generateTokenPair(payload);

            logger.info('User registered successfully', {
                userId: user.id,
                email: user.email,
                organizationId: user.organizationId,
            });

            // Retourner la réponse (sans le mot de passe)
            const { password: _, ...userWithoutPassword } = user;

            return {
                success: true,
                accessToken,
                refreshToken,
                user: userWithoutPassword as any,
            };

        } catch (error: any) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Registration error', error);
            // Include original error message for debugging
            throw new AppError(`Registration failed: ${error.message || 'Unknown error'}`, 500, 'REGISTRATION_ERROR', true, { originalError: error });
        }
    }

    /**
     * Rafraîchir le token d'accès
     */
    async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
        try {
            // Vérifier le refresh token
            const payload = jwtService.verifyToken(refreshToken);

            // Vérifier que l'utilisateur existe toujours
            const user = await prisma.user.findUnique({
                where: { id: payload.userId },
            });

            if (!user || !user.isActive) {
                throw new AppError('Invalid refresh token', 401, 'INVALID_TOKEN');
            }

            // Générer un nouveau access token
            const newPayload: JwtPayload = {
                userId: user.id,
                email: user.email,
                organizationId: user.organizationId,
                role: user.role,
            };

            const accessToken = jwtService.generateAccessToken(newPayload);

            return { accessToken };

        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Refresh token error', error);
            throw new AppError('Token refresh failed', 401, 'REFRESH_ERROR');
        }
    }

    /**
     * Vérifier un token JWT
     */
    async verifyToken(token: string): Promise<JwtPayload> {
        try {
            return jwtService.verifyToken(token);
        } catch (error) {
            throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
        }
    }
}

export const authService = new AuthService();
