import swaggerJsdoc from 'swagger-jsdoc';
import Config from './config';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hisab365 API',
      version: '1.0.0',
      description: 'REST API for managing hisab365 operations including user management, accounting, and financial transactions',
      contact: {
        name: 'Hisab365 Team',
      },
    },
    servers: [
      {
        url: Config.API_PREFIX,
        description: 'Current Server',
      },
    ],
    security: [
      {
        bearerAuth: [],
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['id', 'name', 'contactNumber', 'email', 'password', 'type', 'gender', 'divisionId', 'districtId'],
          properties: {
            id: {
              type: 'string',
              description: 'User ID',
              example: '6a61aded-906a-4801-8543-d1d5ca9e0193',
            },
            name: {
              type: 'string',
              description: 'User name',
              example: 'John Doe',
            },
            contactNumber: {
              type: 'string',
              description: 'Contact number',
              example: '+880123456789',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address',
              example: 'john@example.com',
            },
            password: {
              type: 'string',
              description: 'User password (hashed in DB)',
            },
            type: {
              type: 'string',
              enum: ['user', 'admin', 'superadmin'],
              description: 'User type',
              example: 'user',
            },
            gender: {
              type: 'string',
              description: 'User gender',
              example: 'Male',
            },
            divisionId: {
              type: 'number',
              description: 'Division ID',
            },
            districtId: {
              type: 'number',
              description: 'District ID',
            },
            thanaId: {
              type: 'number',
              description: 'Thana ID',
            },
            props: {
              type: 'object',
              description: 'Additional properties',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation date',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'User last update date',
            },
          },
        },
        Location: {
          type: 'object',
          required: ['id', 'type', 'name'],
          properties: {
            id: {
              type: 'number',
              description: 'Location ID',
            },
            parentId: {
              type: 'number',
              description: 'Parent location ID (for hierarchy)',
            },
            type: {
              type: 'string',
              enum: ['division', 'district', 'thana', 'area'],
              description: 'Location type',
            },
            name: {
              type: 'string',
              description: 'Location name',
            },
          },
        },
        ApiResponse: {
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
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
            },
          },
        },
        Account: {
          type: 'object',
          required: ['name', 'type'],
          properties: {
            _id: {
              type: 'string',
              description: 'Account ID (UUID)',
              example: '3ae8a0e0-b345-437b-b0ee-591d5eb8ca4f',
            },
            name: {
              type: 'string',
              description: 'Account name',
              example: 'Harun Or Rashid',
            },
            openingBalance: {
              type: 'number',
              description: 'Opening balance',
              example: 0,
            },
            currentBalance: {
              type: 'number',
              description: 'Current balance',
              example: 0,
            },
            type: {
              type: 'string',
              enum: ['Asset', 'Cash', 'Bank', 'Supplier', 'Customer', 'Income', 'Expense'],
              description: 'Account type',
              example: 'Customer',
            },
            props: {
              type: 'object',
              description: 'Additional properties (flexible)',
              example: { membershipType: 'member' },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation date',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account last update date',
            },
          },
        },
      },
      responses: {
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        BadRequest: {
          description: 'Bad request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
