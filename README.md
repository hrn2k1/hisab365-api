# Hisab365 Accounts Management API

A TypeScript-based REST API for accounts management using Express, Mongoose (MongoDB), and the decorator pattern.

## Features

- ✅ TypeScript for type safety
- ✅ Express.js REST API framework
- ✅ Decorator pattern for clean and maintainable code
- ✅ MongoDB Atlas integration
- ✅ Swagger UI for API documentation
- ✅ CORS enabled
- ✅ Environment configuration management
- ✅ Error handling
- ✅ Organized folder structure

## Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Web Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **ORM/ODM:** Mongoose
- **Additional:** Reflect Metadata for decorators

## Project Structure

```
src/
├── config/           # Configuration files
│   ├── config.ts     # Environment config
│   └── database.ts   # Database connection
├── controllers/      # Route controllers (with decorators)
│   └── DonorController.ts
├── models/          # MongoDB schemas
│   └── Donor.ts
├── services/        # Business logic
│   └── DonorService.ts
├── middlewares/     # Custom middlewares
├── decorators/      # Custom decorators
│   └── index.ts
├── utils/           # Utility functions
│   └── router.ts    # Route registration
└── index.ts         # Application entry point
```

## Prerequisites

- Node.js v16+ and npm
- MongoDB Atlas account (for cloud database)
- .env file configured with MongoDB URI

## Installation

1. **Clone the repository** (if applicable):
   ```bash
   cd hisab365-api
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create `.env` file**:
   ```bash
   cp .env.example .env
   ```

4. **Configure MongoDB URI** in `.env`:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   ```

## Development

### Run in Development Mode

```bash
npm run dev
```

This uses `ts-node` to run TypeScript directly without compilation.

### Build

```bash
npm run build
```

Compiles TypeScript to JavaScript in the `dist/` directory.

### Production Mode

```bash
npm start
```

Runs the compiled JavaScript from the `dist/` directory.

### Watch Mode

```bash
npm run watch
```

Watches for changes and recompiles TypeScript automatically.

## Swagger UI Documentation

The API is fully documented with Swagger UI. You can:
- View all available endpoints
- See detailed request and response schemas
- Test endpoints directly from the browser
- Generate client code from the OpenAPI specification

Access the API documentation at: **http://localhost:3000/api-docs**

### Testing the API

Once the server is running:

```bash
# Health check
curl http://localhost:3000/health

# Get all donors (via Swagger UI or terminal)
curl http://localhost:3000/api/donors

# Create a donor
curl -X POST http://localhost:3000/api/donors \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "bloodType": "O+"
  }'
```

**Recommended:** Use Swagger UI (http://localhost:3000/api-docs) for interactive testing with automatic validation and response examples.

## API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Donor Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/donors` | Get all donors |
| GET | `/donors/:id` | Get donor by ID |
| GET | `/donors/blood-type/:bloodType` | Get donors by blood type |
| POST | `/donors` | Create a new donor |
| PUT | `/donors/:id` | Update a donor |
| DELETE | `/donors/:id` | Delete a donor |

### Example Requests

**Get all donors:**
```bash
curl http://localhost:3000/api/donors
```

**Create a donor:**
```bash
curl -X POST http://localhost:3000/api/donors \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "bloodType": "O+"
  }'
```

**Get donors by blood type:**
```bash
curl http://localhost:3000/api/donors/blood-type/O+
```

## Decorator Pattern Implementation

This project uses TypeScript decorators to define REST routes cleanly:

```typescript
@Controller('/donors')
export class DonorController {
  @Get()
  async getAllDonors(req: Request, res: Response): Promise<void> {
    // Implementation
  }

  @Post()
  async createDonor(req: Request, res: Response): Promise<void> {
    // Implementation
  }

  @Get('/:id')
  async getDonorById(req: Request, res: Response): Promise<void> {
    // Implementation
  }
}
```

Available decorators:
- `@Controller(prefix)` - Marks a class as a controller
- `@Get(path)` - Handles GET requests
- `@Post(path)` - Handles POST requests
- `@Put(path)` - Handles PUT requests
- `@Delete(path)` - Handles DELETE requests
- `@Patch(path)` - Handles PATCH requests

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` or `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `API_PREFIX` | API route prefix | `/api` |

## Extending the Project

### Adding a New Controller

1. Create a new file in `src/controllers/YourController.ts`:
   ```typescript
   import { Controller, Get, Post } from '../decorators';

   @Controller('/your-route')
   export class YourController {
     @Get()
     async getAll(req: Request, res: Response) {
       // Your implementation
     }
   }
   ```

2. Register it in `src/index.ts`:
   ```typescript
   registerControllers(apiRouter, [DonorController, YourController]);
   ```

### Adding a New Model

1. Create a schema in `src/models/`:
   ```typescript
   import { Schema, model } from 'mongoose';

   export interface IYourModel extends Document {
     // Your fields
   }

   const schema = new Schema<IYourModel>({
     // Define your schema
   });

   export const YourModel = model<IYourModel>('YourModel', schema);
   ```

2. Create a service in `src/services/YourService.ts` with business logic.

3. Use the service in your controller.

## Health Check

A health check endpoint is available at:
```bash
curl http://localhost:3000/health
```

## Error Handling

The API returns standardized error responses:

```json
{
  "success": false,
  "message": "Error description here"
}
```

Success responses:
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

## License

ISC

## Notes

- Ensure MongoDB Atlas is configured and the connection string is correct in `.env`
- All dates are automatically managed by Mongoose (createdAt, updatedAt)
- Use `npm run lint` to check code quality (ESLint configuration may need setup)
- For production, build the project and run with `npm start`
