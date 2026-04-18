import { Request, Response } from 'express';
import { Controller, Get, Post, Put, Delete, Authenticated } from '../decorators';
import { UserService } from '../services/UserService';

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User and blood bank management endpoints
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users and blood banks with optional filters
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [user, admin, superadmin]
 *         description: Filter by user type
 *       - in: query
 *         name: divisionId
 *         schema:
 *           type: number
 *         description: Filter by division ID
 *       - in: query
 *         name: districtId
 *         schema:
 *           type: number
 *         description: Filter by district ID
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               data:
 *                 - id: "6a61aded-906a-4801-8543-d1d5ca9e0193"
 *                   name: "John Doe"
 *                   contactNumber: "+880123456789"
 *                   email: "john.doe@example.com"
 *                   type: "user"
 *                   gender: "Male"
 *                   divisionId: 1
 *                   districtId: 1
 *                   props:
 *                     address: "Sheikhpara, Joypurhat"
 *                     bloodGroup: "A+"
 *                   createdAt: "2024-06-01T00:00:00Z"
 *                   updatedAt: "2024-06-01T00:00:00Z"
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: Register a new user or blood bank in the system
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - contactNumber
 *               - email
 *               - password
 *               - type
 *               - gender
 *               - divisionId
 *               - districtId
 *             properties:
 *               name:
 *                 type: string
 *               contactNumber:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [user, admin, superadmin]
 *               gender:
 *                 type: string
 *               divisionId:
 *                 type: number
 *               districtId:
 *                 type: number
 *               thanaId:
 *                 type: number
 *               props:
 *                 type: object
 *           example:
 *             name: "John Doe"
 *             contactNumber: "+880123456789"
 *             email: "john.doe@example.com"
 *             password: "Pass@123"
 *             type: "user"
 *             gender: "Male"
 *             divisionId: 1
 *             districtId: 1
 *             props:
 *               address: "Sheikhpara, Joypurhat"
 *               photo: "https://example.com/photos/john_doe.jpg"
 *               birthDate: "1985-01-01"
 *               bloodGroup: "A+"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               data:
 *                 id: "6a61aded-906a-4801-8543-d1d5ca9e0193"
 *                 name: "John Doe"
 *                 contactNumber: "+880123456789"
 *                 email: "john.doe@example.com"
 *                 type: "user"
 *                 gender: "Male"
 *                 divisionId: 1
 *                 districtId: 1
 *                 props:
 *                   address: "Sheikhpara, Joypurhat"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve a specific user by their unique ID
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "6a61aded-906a-4801-8543-d1d5ca9e0193"
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "6a61aded-906a-4801-8543-d1d5ca9e0193"
 *                 name: "John Doe"
 *                 contactNumber: "+880123456789"
 *                 email: "john.doe@example.com"
 *                 type: "user"
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   put:
 *     summary: Update user
 *     description: Update user information
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Jane Doe"
 *             contactNumber: "+880987654321"
 *             props:
 *               address: "New Address, Dhaka"
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 *   delete:
 *     summary: Delete user
 *     description: Remove a user from the system
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 */

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Search users by name
 *     description: Search for users using a name query
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *         example: "John"
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: "6a61aded-906a-4801-8543-d1d5ca9e0193"
 *                   name: "John Doe"
 *                   email: "john@example.com"
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 */

/**
 * @swagger
 * /users/{type}:
 *   get:
 *     summary: Get users by type
 *     description: Retrieve users filtered by type and optionally by location
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, admin, superadmin]
 *         description: User type
 *         example: admin
 *       - in: query
 *         name: divisionId
 *         schema:
 *           type: number
 *         description: Division ID (optional)
 *         example: 1
 *       - in: query
 *         name: districtId
 *         schema:
 *           type: number
 *         description: District ID (optional)
 *         example: 1
 *     responses:
 *       200:
 *         description: List of users by type
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: "0af25096-8a67-4c44-b990-e5848ff80069"
 *                   name: "John Admin"
 *                   type: "admin"
 *                   divisionId: 1
 *                   districtId: 1
 *                 - id: "1bf25096-8a67-4c44-b990-e5848ff80070"
 *                   name: "Jane Admin"
 *                   type: "admin"
 *                   divisionId: 1
 *                   districtId: 2
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve a specific user by their ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *   put:
 *     summary: Update user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Delete user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 */

@Controller('/users')
export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  @Authenticated()
  @Get()
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const { type, divisionId, districtId } = req.query;

      let users;
      if (type) {
        users = await this.userService.getUsersByType(type as 'user' | 'admin' | 'superadmin');
      } else if (divisionId) {
        users = await this.userService.getUsersByLocation(Number(divisionId), districtId ? Number(districtId) : undefined);
      } else {
        users = await this.userService.getAllUsers();
      }

      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }

  @Authenticated()
  @Get('/:id')
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }

  @Authenticated()
  @Post()
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData = req.body;
      const user = await this.userService.createUser(userData);

      res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }

  @Authenticated()
  @Put('/:id')
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userData = req.body;
      const user = await this.userService.updateUser(id, userData);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }

  @Authenticated()
  @Delete('/:id')
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userService.deleteUser(id);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'User deleted successfully',
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }

  @Authenticated()
  @Get('/search')
  async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Search query is required',
        });
        return;
      }

      const users = await this.userService.searchUsers(q);

      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }

  @Authenticated()
  @Get('/:type')
  async getUsersByType(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.params;
      const { divisionId, districtId } = req.query;

      const validTypes = ['user', 'admin', 'superadmin'];
      if (!validTypes.includes(type)) {
        res.status(400).json({
          success: false,
          message: 'Invalid type. Must be one of: user, admin, superadmin',
        });
        return;
      }

      const users = await this.userService.getUsersByTypeAndLocation(
        type,
        divisionId ? Number(divisionId) : undefined,
        districtId ? Number(districtId) : undefined
      );

      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }
}
