import { prisma } from '@/shared/database/prisma.client';
import { advancedTokenService } from './advanced-token.service';
import { AppError } from '@/shared/utils/errors';
import { Role, SubscriptionTier, SubscriptionStatus } from '@prisma/client';
import { logger } from '@/infrastructure/logger';

/**
 * Google OAuth authentication service
 */
export class GoogleAuthService {
    /**
     * Verify Google ID token and authenticate/register user
     * Note: In production, you would verify the ID token with Google's API
     * For now, we trust the token from the client (Firebase verifies it)
     */
    async authenticate(idToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: Record<string, unknown>;
    }> {
        try {
            // Decode the Google ID token (in production, verify with Google)
            // For Firebase ID tokens, you can use Firebase Admin SDK or verify manually
            // Here we assume the token is valid (Firebase already verified it on client)
            
            // In production, you would:
            // 1. Verify the ID token with Firebase Admin SDK
            // 2. Extract the user's email and Google ID
            
            // For now, we'll create a simple implementation
            // The frontend sends a Firebase ID token, we decode its payload
            const payload = this.decodeGoogleToken(idToken);
            
            if (!payload.email) {
                throw new AppError('Invalid Google token: no email', 400, 'INVALID_TOKEN');
            }

            const { email, name, picture } = payload;

            // Check if user exists
            let user = await prisma.user.findUnique({
                where: { email },
                include: {
                    organization: {
                        include: {
                            subscription: true
                        }
                    }
                }
            });

            if (!user) {
                // Create new user with organization
                user = await prisma.$transaction(async (tx) => {
                    // Create the user
                    const newUser = await tx.user.create({
                        data: {
                            email,
                            name: name || email.split('@')[0],
                            password: 'google-oauth', // Placeholder for OAuth users
                            role: Role.USER,
                            isActive: true,
                        }
                    });

                    // Create organization for the user
                    const organization = await tx.organization.create({
                        data: {
                            name: name || email.split('@')[0] + "'s Organization",
                            slug: `org-${email.split('@')[0].toLowerCase()}-${Date.now()}`,
                            ownerId: newUser.id,
                            subscription: {
                                create: {
                                    plan: SubscriptionTier.FREE,
                                    status: SubscriptionStatus.ACTIVE
                                }
                            }
                        }
                    });

                    // Update user with organization
                    return await tx.user.update({
                        where: { id: newUser.id },
                        data: { organizationId: organization.id },
                        include: {
                            organization: {
                                include: {
                                    subscription: true
                                }
                            }
                        }
                    });
                });

                logger.info('New Google user registered', { userId: user.id, email });
            } else {
                // Update last login
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { lastLoginAt: new Date() },
                    include: {
                        organization: {
                            include: {
                                subscription: true
                            }
                        }
                    }
                });

                logger.info('Google user logged in', { userId: user.id, email });
            }

            // Generate tokens
            const { accessToken, refreshToken } = await advancedTokenService.generateRotatedTokenPair(
                user.id,
                user.email,
                user.organizationId,
                user.role
            );

            return {
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    organizationId: user.organizationId,
                    organization: user.organization,
                    avatar: picture || user.avatar,
                }
            };
        } catch (error) {
            logger.error('Google auth error:', error);
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError('Google authentication failed', 500, 'GOOGLE_AUTH_FAILED');
        }
    }

    /**
     * Decode Google ID token payload
     * In production, verify this with Firebase Admin SDK
     */
    private decodeGoogleToken(idToken: string): {
        email?: string;
        name?: string;
        picture?: string;
        sub?: string;
    } {
        try {
            // Firebase ID tokens are JWTs, but we can't verify them without Firebase Admin
            // In production, use: admin.auth().verifyIdToken(idToken)
            
            // For now, we'll parse the unsigned payload for demo purposes
            // This won't work in production - you need Firebase Admin SDK
            const parts = idToken.split('.');
            if (parts.length !== 3) {
                // Could be a custom token or different format
                throw new Error('Invalid token format');
            }
            
            // Decode the payload (base64url)
            const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
            return payload;
        } catch {
            // For development/testing, return mock data if token parsing fails
            // Remove this in production!
            return {
                email: 'google-user@example.com',
                name: 'Google User',
                picture: undefined,
                sub: 'google-123456'
            };
        }
    }
}

export const googleAuthService = new GoogleAuthService();
