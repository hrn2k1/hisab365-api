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
          required: ['id', 'name', 'contactNumber', 'email', 'password', 'type', 'companyId', 'gender', 'divisionId', 'districtId'],
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
            companyId: {
              type: 'string',
              description: 'Company ID',
              example: '12345678-90ab-cdef-1234-567890abcdef',
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
        Transaction: {
          type: 'object',
          required: ['date', 'voucherNo', 'voucherType', 'amount', 'description', 'details', 'status', 'createdBy'],
          properties: {
            id: {
              type: 'string',
              description: 'Transaction ID',
              example: 'd1c9e5b8-7a0c-4f1b-9c3e-2a5f8e6b9c7d',
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Transaction date',
              example: '2024-06-01',
            },
            voucherNo: {
              type: 'string',
              description: 'Voucher number',
              example: 'VCH-001',
            },
            voucherType: {
              type: 'string',
              enum: ['Credit', 'Debit', 'Journal'],
              description: 'Voucher type',
              example: 'Credit',
            },
            amount: {
              type: 'number',
              description: 'Transaction amount',
              example: 10000,
            },
            description: {
              type: 'string',
              description: 'Transaction description',
              example: 'Donation from Harun Or Rashid',
            },
            details: {
              type: 'array',
              description: 'Transaction details',
              items: {
                type: 'object',
                properties: {
                  accountId: {
                    type: 'string',
                    description: 'Account ID',
                  },
                  type: {
                    type: 'string',
                    enum: ['Credit', 'Debit'],
                    description: 'Detail type',
                  },
                  amount: {
                    type: 'number',
                    description: 'Detail amount',
                  },
                },
              },
            },
            attachments: {
              type: 'array',
              description: 'Transaction attachments',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    description: 'Attachment ID',
                  },
                  fileName: {
                    type: 'string',
                    description: 'File name',
                  },
                  fileType: {
                    type: 'string',
                    description: 'File type',
                  },
                  fileSize: {
                    type: 'number',
                    description: 'File size in bytes',
                  },
                  url: {
                    type: 'string',
                    description: 'File URL',
                  },
                },
              },
            },
            status: {
              type: 'string',
              description: 'Transaction status',
              example: 'Approved',
            },
            createdBy: {
              type: 'string',
              description: 'Created by user ID',
              example: '6a61aded-906a-4801-8543-d1d5ca9e0193',
            },
            checkedBy: {
              type: 'array',
              description: 'Checked by user IDs',
              items: {
                type: 'string',
              },
            },
            approvedBy: {
              type: 'array',
              description: 'Approved by user IDs',
              items: {
                type: 'string',
              },
            },
            props: {
              type: 'object',
              description: 'Additional properties',
              example: { checkNumber: '789038', checkDate: '2024-06-01' },
            },
            activityLog: {
              type: 'array',
              description: 'Activity log',
              items: {
                type: 'object',
                properties: {
                  timestamp: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Activity timestamp',
                  },
                  userId: {
                    type: 'string',
                    description: 'User ID who performed the action',
                  },
                  action: {
                    type: 'string',
                    description: 'Action performed',
                  },
                  comment: {
                    type: 'string',
                    description: 'Action comment',
                  },
                },
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Transaction creation date',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Transaction last update date',
            },
          },
        },
        Company: {
          type: 'object',
          required: ['name', 'address', 'phone', 'email', 'businessType'],
          properties: {
            id: {
              type: 'string',
              description: 'Company ID',
              example: '1a2b3c4d-5e6f-7890-abcd-1234567890ab',
            },
            name: {
              type: 'string',
              description: 'Company name',
              example: 'HrnSoft Ltd.',
            },
            address: {
              type: 'string',
              description: 'Company address',
              example: '123 Main Street, Dhaka, Bangladesh',
            },
            phone: {
              type: 'string',
              description: 'Company phone number',
              example: '+880123456789',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Company email address',
              example: 'info@hisab365.com',
            },
            website: {
              type: 'string',
              description: 'Company website URL',
              example: 'https://www.hisab365.com',
            },
            logoUrl: {
              type: 'string',
              description: 'Company logo URL',
              example: 'https://www.hisab365.com/logo.png',
            },
            businessType: {
              type: 'string',
              description: 'Company business type',
              example: 'Software Development',
            },
            props: {
              type: 'object',
              description: 'Additional properties (flexible)',
              example: { foundedYear: 2020, numberOfEmployees: 50 },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Company creation date',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Company last update date',
            },
          },
        },
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
