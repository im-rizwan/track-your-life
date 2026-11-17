import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './env.config';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Muhasabah API',
    version: '1.0.0',
    description:
      'Production-grade Node.js + Express REST API with TypeScript, Prisma, and PostgreSQL',
    contact: {
      name: 'API Support',
      email: 'support@trackyrlife.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: config.isDevelopment
        ? `http://localhost:${config.port}/api`
        : 'https://your-production-domain.com/api',
      description: config.isDevelopment ? 'Development server' : 'Production server',
    },
    {
      url: 'https://track-your-life.onrender.com/api',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token in the format: Bearer <token>',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          error: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                example: 'VALIDATION_ERROR',
              },
              message: {
                type: 'string',
                example: 'Validation failed',
              },
            },
          },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'object',
          },
          message: {
            type: 'string',
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'clxxx123456789',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          firstName: {
            type: 'string',
            nullable: true,
            example: 'John',
          },
          lastName: {
            type: 'string',
            nullable: true,
            example: 'Doe',
          },
          isActive: {
            type: 'boolean',
            example: true,
          },
          emailVerified: {
            type: 'boolean',
            example: false,
          },
          emailVerifiedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
          lastLoginAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
          passwordChangedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Tokens: {
        type: 'object',
        properties: {
          accessToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
          refreshToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: {
            $ref: '#/components/schemas/User',
          },
          tokens: {
            $ref: '#/components/schemas/Tokens',
          },
        },
      },
      CustomizationItem: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'clxxx123456789' },
          name: { type: 'string', example: 'Masjid' },
          isDefault: { type: 'boolean', example: true },
          isActive: { type: 'boolean', example: true },
          userId: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              items: { type: 'array', items: { type: 'object' } },
              total: { type: 'integer', example: 50 },
              page: { type: 'integer', example: 1 },
              totalPages: { type: 'integer', example: 3 },
              limit: { type: 'integer', example: 20 },
            },
          },
          message: { type: 'string' },
        },
      },
    },
  },
  tags: [
    { name: 'Authentication', description: 'User authentication and authorization endpoints' },
    { name: 'Users', description: 'User profile and account management (protected)' },
    { name: 'Health', description: 'Health check endpoints' },
    { name: 'Prayer Times', description: 'Prayer times configuration and retrieval' },
    { name: 'Reference', description: 'System reference data (read-only lookups)' },
    {
      name: 'Customization - Prayer Locations',
      description: 'Manage prayer location options (system defaults + custom)',
    },
    {
      name: 'Customization - Other Prayer Types',
      description: 'Manage other prayer type options (system defaults + custom)',
    },
    {
      name: 'Customization - Dhikr Types',
      description: 'Manage dhikr type options (system defaults + custom)',
    },
    {
      name: 'Customization - Fasting Types',
      description: 'Manage fasting type options (system defaults + custom)',
    },
    {
      name: 'Customization - Charity Types',
      description: 'Manage charity type options (system defaults + custom)',
    },
    {
      name: 'Customization - Islamic Study Subjects',
      description: 'Manage Islamic study subject options (system defaults + custom)',
    },
    {
      name: 'Customization - Study Modes',
      description: 'Manage study mode options (system defaults + custom)',
    },
    {
      name: 'Customization - Fitness Activities',
      description: 'Manage fitness activity options (system defaults + custom)',
    },
    {
      name: 'Customization - Nutrition Foods',
      description: 'Manage nutrition food options (system defaults + custom)',
    },
    {
      name: 'Customization - Fitrah Practices',
      description: 'Manage fitrah practice options (system defaults + custom)',
    },
    { name: 'Customization - Skills', description: 'Manage user-owned skills and their topics' },
    { name: 'Customization - Intentions', description: 'Manage user-owned intentions' },
    {
      name: 'Tracking - Daily Prayers',
      description: 'Log and manage daily obligatory prayer records',
    },
    {
      name: 'Tracking - Other Prayers',
      description: 'Log and manage voluntary/sunnah prayer records',
    },
    { name: 'Tracking - Quran', description: 'Log and manage Quran reading/memorization records' },
    { name: 'Tracking - Dhikr', description: 'Log and manage dhikr (remembrance) records' },
    { name: 'Tracking - Fasting', description: 'Log and manage fasting records' },
    { name: 'Tracking - Charity', description: 'Log and manage charity/sadaqah records' },
    {
      name: 'Tracking - Islamic Study',
      description: 'Log and manage Islamic study session records',
    },
    {
      name: 'Tracking - Skill Progress',
      description: 'Log and manage skill learning progress records',
    },
    { name: 'Tracking - Fitness', description: 'Log and manage fitness/exercise records' },
    { name: 'Tracking - Nutrition', description: 'Log and manage nutrition/food intake records' },
    { name: 'Tracking - Sleep', description: 'Log and manage sleep records' },
    {
      name: 'Tracking - Fitrah Practices',
      description: 'Log and manage fitrah (natural hygiene) practice records',
    },
    { name: 'Tracking - Tasks', description: 'Log and manage daily task records' },
    { name: 'Tracking - Intentions', description: 'Log and manage intention tracking records' },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/modules/**/*.routes.ts', './src/modules/**/*.routes.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
