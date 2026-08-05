import { Request, Response } from 'express';
import { Controller, Get, Post, Put, Patch, Delete, Authenticated } from '../decorators';
import { UserService } from '../services/UserService';
import { CompanyService } from '../services/CompanyService';
import { hashPassword } from '../utils/passwordUtil';

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User management endpoints
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users with optional filters
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
 *     description: Register a new user in the system
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
 *             schema:
 *               $ref: '#/components/schemas/User'
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
 *   patch:
 *     summary: Partially update user
 *     description: Partially update user fields
 *     operationId: patchUser
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
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               contactNumber:
 *                 type: string
 *               type:
 *                 type: string
 *               photo:
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
 *             name: "Jane Doe"
 *             email: "jane.doe@example.com"
 *             contactNumber: "+880987654321"
 *             type: "user"
 *             photo: "https://example.com/photos/jane_doe.jpg"
 *             divisionId: 2
 *             districtId: 3
 *             thanaId: 4
 *             props:
 *               address: "New Address, Dhaka"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "6a61aded-906a-4801-8543-d1d5ca9e0193"
 *                 name: "Jane Doe"
 *                 email: "jane.doe@example.com"
 *                 contactNumber: "+880987654321"
 *                 type: "user"
 *                 photo: "https://example.com/photos/jane_doe.jpg"
 *                 divisionId: 2
 *                 districtId: 3
 *                 thanaId: 4
 *                 props:
 *                   address: "New Address, Dhaka"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 *       404:
 *         $ref: '#/components/responses/NotFound'
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
 * /users/{id}/membership:
 *   patch:
 *     summary: Partially update user membership
 *     description: Update a user's membership role, status, and/or type for a specific company
 *     operationId: patchUserMembership
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
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyId
 *             properties:
 *               companyId:
 *                 type: string
 *                 description: Company ID of the membership to update
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *               status:
 *                 type: string
 *                 enum: [active, pending, rejected, inactive]
 *               membershipType:
 *                 type: string
 *                 description: Type of membership (e.g., owner, member, guest)
 *           example:
 *             companyId: "12345678-90ab-cdef-1234-567890abcdef"
 *             role: "admin"
 *             status: "active"
 *             membershipType: "owner"
 *     responses:
 *       200:
 *         description: User membership updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "6a61aded-906a-4801-8543-d1d5ca9e0193"
 *                 name: "John Doe"
 *                 memberships:
 *                   - companyId: "12345678-90ab-cdef-1234-567890abcdef"
 *                     role: "admin"
 *                     status: "active"
 *                     membershipType: "owner"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /users/search:
 *   post:
 *     summary: Search users by name, email, or contact number
 *     description: Search for users using any combination of name, email, or contact number. Returns matched users and the criteria used.
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name to search for
 *                 example: "John"
 *               email:
 *                 type: string
 *                 description: Email to search for
 *                 example: "john@example.com"
 *               contactNumber:
 *                 type: string
 *                 description: Contact number to search for
 *                 example: "+880123456789"
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 users:
 *                   - id: "6a61aded-906a-4801-8543-d1d5ca9e0193"
 *                     name: "John Doe"
 *                     email: "john@example.com"
 *                     contactNumber: "+880123456789"
 *                 criteria: "matched with name or email"
 *       400:
 *         description: Bad request - No search criteria provided
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "At least one search criteria (name, email, or contactNumber) is required"
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

/**
 * @swagger
 * /users/{id}/companies:
 *   get:
 *     summary: Get companies for a user
 *     description: Returns all companies the user has a membership of
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
 *         description: List of companies the user is a member of
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: "12345678-90ab-cdef-1234-567890abcdef"
 *                   name: "Acme Corp"
 *                   email: "info@acme.com"
 *                   contactNumber: "+880123456789"
 *                   type: "business"
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "User not found"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /users/{id}/membership:
 *   delete:
 *     summary: Remove a user's membership for a company
 *     description: Remove a membership from a user for a specific company
 *     operationId: removeMembership
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
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyId
 *             properties:
 *               companyId:
 *                 type: string
 *                 description: Company ID to remove from memberships
 *           example:
 *             companyId: "12345678-90ab-cdef-1234-567890abcdef"
 *     responses:
 *       200:
 *         description: Membership removed successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "6a61aded-906a-4801-8543-d1d5ca9e0193"
 *                 memberships: []
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /users/{id}/reset-password:
 *   post:
 *     summary: Reset user password
 *     description: Reset the password for a user by their ID
 *     operationId: resetUserPassword
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
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 description: New password for the user
 *           example:
 *             password: "NewPass@123"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Password reset successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

@Controller('/users')
export class UserController {
  private userService: UserService;
  private companyService: CompanyService;

  constructor() {
    this.userService = new UserService();
    this.companyService = new CompanyService();
  }

  @Authenticated()
  @Get()
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const { type, divisionId, districtId } = req.query;

      let users;
      if (type) {
        users = await this.userService.getUsersByType(type as 'user' | 'superadmin');
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
  @Get('/:id/companies')
  async getUserCompanies(req: Request, res: Response): Promise<void> {
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

      const companyIds = user.memberships.map((m) => m.companyId);
      const companies = await this.companyService.getCompaniesByIds(companyIds);

      res.json({
        success: true,
        data: companies,
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
  @Patch('/:id/membership')
  async patchUserMembership(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { companyId, role, status, membershipType } = req.body ?? {};

      if (!companyId) {
        res.status(400).json({
          success: false,
          message: 'companyId is required',
        });
        return;
      }

      if (role === undefined && status === undefined && membershipType === undefined) {
        res.status(400).json({
          success: false,
          message: 'At least one of role, status, or membershipType is required',
        });
        return;
      }

      const user = await this.userService.addOrEditMembership(id, companyId, { role, status, membershipType });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const userResponse = user.toObject();
      delete userResponse.password;

      res.json({
        success: true,
        data: userResponse,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }


  @Authenticated()
  @Delete('/:id/membership')
  async removeUserMembership(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { companyId } = req.body ?? {};
      if (!companyId) {
        res.status(400).json({ success: false, message: 'companyId is required' });
        return;
      }
      const user = await this.userService.removeMembership(id, companyId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'An error occurred' });
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
  @Post('/search')
  async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, contactNumber, companyId } = req.body ?? {};

      if (!name && !email && !contactNumber && !companyId) {
        res.status(400).json({
          success: false,
          message: 'At least one search criteria (name, email, contactNumber, or companyId) is required',
        });
        return;
      }

      const users = await this.userService.searchUsers(name, email, contactNumber, companyId);

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

  @Authenticated()
  @Patch('/:id')
  async patchUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, email, contactNumber, type, photo, divisionId, districtId, thanaId, props } = req.body ?? {};

      if (name === undefined && email === undefined && contactNumber === undefined && type === undefined && photo === undefined && divisionId === undefined && districtId === undefined && thanaId === undefined && props === undefined) {
        res.status(400).json({
          success: false,
          message: 'At least one of name, email, contactNumber, type, photo, divisionId, districtId, thanaId, or props is required',
        });
        return;
      }

      const updateData: Record<string, unknown> = {};

      if (name !== undefined) {
        updateData.name = name;
      }

      if (email !== undefined) {
        updateData.email = email;
      }

      if (contactNumber !== undefined) {
        updateData.contactNumber = contactNumber;
      }

      if (type !== undefined) {
        updateData.type = type;
      }

      if (photo !== undefined) {
        updateData.photo = photo;
      }

      if (divisionId !== undefined) {
        updateData.divisionId = divisionId;
      }

      if (districtId !== undefined) {
        updateData.districtId = districtId;
      }

      if (thanaId !== undefined) {
        updateData.thanaId = thanaId;
      }

      if (props !== undefined) {
        updateData.props = props;
      }

      const user = await this.userService.setUser(id, updateData);

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
  @Post('/:id/reset-password')
  async resetUserPassword(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { password } = req.body ?? {};
      // Only superadmin can reset password
      /*
      if (req.user?.type !== 'superadmin') {
        res.status(403).json({ success: false, message: 'Only superadmin can reset passwords' });
        return;
      }
      */
      if (!password) {
        res.status(400).json({ success: false, message: 'password is required' });
        return;
      }
      const hashedPassword = await hashPassword(password);
      const user = await this.userService.setUser(id, { password: hashedPassword });
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'An error occurred' });
    }
  }
}
