import 'reflect-metadata';
import express, { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { connectDatabase } from './config/database';
import Config from './config/config';
import { swaggerSpec } from './config/swagger';
import { registerControllers } from './utils/router';
import { AuthController } from './controllers/AuthController';
import { UserController } from './controllers/UserController';
import { ProfileController } from './controllers/ProfileController';
import { LocationController } from './controllers/LocationController';
import { AccountController } from './controllers/AccountController';
import { TransactionController } from './controllers/TransactionController';
import { CompanyController } from './controllers/CompanyController';

class App {
  public app: Express;
  private port: number;

  constructor() {
    this.app = express();
    this.port = Number(Config.PORT);

    this.middleware();
    this.routes();
  }

  private middleware(): void {
    // CORS middleware
    this.app.use(cors());

    // Body parser middleware
    this.app.use(bodyParser.json({ limit: '50mb' }));
    this.app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

    // Health check route
    this.app.get('/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    // Swagger UI with auto-token capture from login
    this.app.use('/api-docs', swaggerUi.serve);
    this.app.get('/api-docs', swaggerUi.setup(swaggerSpec, { 
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
      } 
    }));
  }

  private routes(): void {
    // API routes
    const apiRouter = express.Router();

    // Register decorated controllers
    registerControllers(apiRouter, [AuthController, UserController, ProfileController, LocationController, AccountController, TransactionController, CompanyController]);

    // Mount API router
    this.app.use(Config.API_PREFIX, apiRouter);
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await connectDatabase();

      // Start server
      this.app.listen(this.port, () => {
        console.log(`
╔════════════════════════════════════════════════════════╗
║          Hisab365 API Server Running                   ║
╠════════════════════════════════════════════════════════╣
║ Environment: ${Config.NODE_ENV.padEnd(41)} ║
║ Port: ${String(this.port).padEnd(48)} ║
║ API Prefix: ${Config.API_PREFIX.padEnd(42)} ║
║ Database: Connected                                    ║
║                                                        ║
║ Swagger UI: http://localhost:${this.port}/api-docs             ║
╚════════════════════════════════════════════════════════╝
        `);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Start the application
const app = new App();
app.start().catch((error) => {
  console.error(error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
