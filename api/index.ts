import 'reflect-metadata';
import express, { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { connectDatabase } from '../src/config/database';
import Config from '../src/config/config';
import { swaggerSpec } from '../src/config/swagger';
import { registerControllers } from '../src/utils/router';
import { CompanyController } from '../src/controllers/CompanyController';
import { AuthController } from '../src/controllers/AuthController';
import { UserController } from '../src/controllers/UserController';
import { ProfileController } from '../src/controllers/ProfileController';
import { LocationController } from '../src/controllers/LocationController';
import { AccountController } from '../src/controllers/AccountController';
import { TransactionController } from '../src/controllers/TransactionController';

// Create Express app
const app: Express = express();

// CORS middleware
app.use(cors());

// Body parser middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Swagger UI - with auto-token capture from login
const swaggerUiOptions = {
  swaggerOptions: {
    defaultModelsExpandDepth: 2,
    persistAuthorization: true,
    // Custom plugin to intercept login response and set token
    plugins: [(function() {
      return {
        statePlugins: {
          auth: {
            selectors: {
              selectPersistedToken: () => localStorage.getItem('swagger-bearer-token')
            },
            actions: {
              setToken: (token: any) => {
                localStorage.setItem('swagger-bearer-token', token);
              }
            }
          }
        },
        requestInterceptor: (request: any) => {
          const token = localStorage.getItem('swagger-bearer-token');
          if (token) {
            request.headers.Authorization = `Bearer ${token}`;
          }
          return request;
        },
        responseInterceptor: (response: any) => {
          // Capture token from login response
          if (response.url && response.url.includes('/auth/login') && response.ok) {
            response.text().then((text: string) => {
              try {
                const data = JSON.parse(text);
                if (data.success && data.token) {
                  localStorage.setItem('swagger-bearer-token', data.token);
                  console.log('✓ Token automatically set from login!');
                }
              } catch (e) {
                // Response wasn't JSON
              }
            });
          }
          return response;
        }
      };
    }) as any]
  },
  customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css',
  customJs: [
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.min.js',
  ],
};

app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// API routes
const apiRouter = express.Router();
registerControllers(apiRouter, [CompanyController, AuthController, UserController, ProfileController, LocationController, AccountController, TransactionController]);
app.use(Config.API_PREFIX, apiRouter);

// Database connection state
let isConnected = false;

// Serverless handler
const handler = async (req: Request, res: Response) => {
  if (!isConnected) {
    try {
      await connectDatabase();
      isConnected = true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return res.status(500).json({ error: 'Database connection failed' });
    }
  }
  return app(req, res);
};

export default handler;
