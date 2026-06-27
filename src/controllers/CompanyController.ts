import { Request, Response } from 'express';
import { Controller, Get, Post, Put, Patch, Delete, Authenticated } from '../decorators';
import { CompanyService } from '../services/CompanyService';
import { UserService } from '../services/UserService';

/**
 * @swagger
 * tags:
 *   - name: Companies
 *     description: Company management endpoints
 */

/**
 * @swagger
 * /companies:
 *   get:
 *     summary: Get all companies
 *     description: Retrieve a list of all companies
 *     tags:
 *       - Companies
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of companies retrieved successfully
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
 *                     $ref: '#/components/schemas/Company'
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     summary: Create a new company
 *     description: Create a new company in the system
 *     tags:
 *       - Companies
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
 *               - addressLine1
 *               - addressLine2
 *               - phone
 *               - email
 *               - type
 *               - contactPerson
 *               - contactNumber
 *               - contactEmail
 *             properties:
 *               name:
 *                 type: string
 *               addressLine1:
 *                 type: string
 *               addressLine2:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               website:
 *                 type: string
 *               logoUrl:
 *                 type: string
 *               type:
 *                 type: string
 *               contactPerson:
 *                 type: string
 *               contactNumber:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: ['active', 'inactive', 'pending']
 *               props:
 *                 type: object
 *           example:
 *             name: "HrnSoft Ltd."
 *             addressLine1: "123 Main Street"
 *             addressLine2: "Dhaka, Bangladesh"
 *             phone: "+880123456789"
 *             email: "info@hisab365.com"
 *             website: "https://www.hisab365.com"
 *             logoUrl: "https://www.hisab365.com/logo.png"
 *             type: "Mess"
 *             contactPerson: "John Doe"
 *             contactNumber: "+880123456789"
 *             contactEmail: "john.doe@hisab365.com"
 *             status: "pending"
 *             props:
 *               foundedYear: 2026
 *               numberOfEmployees: 50
 *     responses:
 *       201:
 *         description: Company created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Company'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 */

/**
 * @swagger
 * /companies/{id}:
 *   get:
 *     summary: Get company by ID
 *     description: Retrieve a specific company by its unique ID
 *     tags:
 *       - Companies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "1a2b3c4d-5e6f-7890-abcd-1234567890ab"
 *     responses:
 *       200:
 *         description: Company retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Company'
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   put:
 *     summary: Update company
 *     description: Update company information
 *     tags:
 *       - Companies
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
 *               addressLine1:
 *                 type: string
 *               addressLine2:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               website:
 *                 type: string
 *               logoUrl:
 *                 type: string
 *               type:
 *                 type: string
 *               contactPerson:
 *                 type: string
 *               contactNumber:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: ['active', 'inactive', 'pending']
 *               props:
 *                 type: object
 *     responses:
 *       200:
 *         description: Company updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Company'
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   patch:
 *     summary: Partially update company
 *     description: Update only company type, status, and note. The note is saved as props.note.
 *     tags:
 *       - Companies
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
 *               type:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: ['active', 'inactive', 'pending']
 *               note:
 *                 type: string
 *                 description: Saved as props.note in the database
 *           example:
 *             type: "MESS"
 *             status: "active"
 *             note: "Approved and ready for onboarding"
 *     responses:
 *       200:
 *         description: Company updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Company'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     summary: Delete company
 *     description: Remove a company from the system
 *     tags:
 *       - Companies
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
 *         description: Company deleted successfully
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 */

/**
 * @swagger
 * /companies/search:
 *   get:
 *     summary: Search companies by name
 *     description: Search for companies using a name query
 *     tags:
 *       - Companies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *         example: "HrnSoft"
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: "1a2b3c4d-5e6f-7890-abcd-1234567890ab"
 *                   name: "HrnSoft Ltd."
 *                   email: "info@hisab365.com"
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 */

/**
 * @swagger
 * /companies/type/{type}:
 *   get:
 *     summary: Get companies by business type
 *     description: Retrieve companies filtered by business type
 *     tags:
 *       - Companies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: Business type
 *         example: "Software Development"
 *     responses:
 *       200:
 *         description: List of companies by business type
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: "1a2b3c4d-5e6f-7890-abcd-1234567890ab"
 *                   name: "HrnSoft Ltd."
 *                   businessType: "Software Development"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /companies/{id}/users:
 *   get:
 *     summary: Get users of a company
 *     description: Retrieve all users who are members of the specified company
 *     tags:
 *       - Companies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *         example: "1a2b3c4d-5e6f-7890-abcd-1234567890ab"
 *     responses:
 *       200:
 *         description: Company users retrieved successfully
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
 * /companies/{id}/users:
 *   post:
 *     summary: Add user to company
 *     description: Add a user to the specified company. Creates the user if not already present, and adds or updates their membership.
 *     tags:
 *       - Companies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
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
 *               password:
 *                 type: string
 *               props:
 *                type: object
 *               membershipType:
 *                 type: string
 *               role:
 *                 type: string
 *               status:
 *                 type: string
 *           example:
 *             name: "John Doe"
 *             email: "john@example.com"
 *             contactNumber: "0123456789"
 *             password: "securepassword"
 *             props: {}
 *             membershipType: "admin"
 *             role: "manager"
 *             status: "active"
 *     responses:
 *       200:
 *         description: User added or updated successfully
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
 *         description: Invalid input
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /companies/{id}/users:
 *   delete:
 *     summary: Remove user from company
 *     description: Remove a user's membership from the specified company.
 *     tags:
 *       - Companies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *           example:
 *             userId: "1234567890abcdef"
 *     responses:
 *       200:
 *         description: User removed from company successfully
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
 *         description: Invalid input
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

@Controller('/companies')
export class CompanyController {
  private companyService: CompanyService;
  private userService: UserService;

  constructor() {
    this.companyService = new CompanyService();
    this.userService = new UserService();
  }

  @Authenticated()
  @Get()
  async getAllCompanies(req: Request, res: Response): Promise<void> {
    try {
      const companies = await this.companyService.getAllCompanies();

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
  async getCompanyById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const company = await this.companyService.getCompanyById(id);

      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Company not found',
        });
        return;
      }

      res.json({
        success: true,
        data: company,
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
  async createCompany(req: Request, res: Response): Promise<void> {
    try {
      const companyData = req.body;
      const company = await this.companyService.createCompany(companyData);

      res.status(201).json({
        success: true,
        data: company,
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
  async updateCompany(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const companyData = req.body;
      const company = await this.companyService.updateCompany(id, companyData);

      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Company not found',
        });
        return;
      }

      res.json({
        success: true,
        data: company,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }

  @Authenticated()
  @Patch('/:id')
  async patchCompany(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { type, status, note } = req.body ?? {};

      if (type === undefined && status === undefined && note === undefined) {
        res.status(400).json({
          success: false,
          message: 'At least one of type, status, or note is required',
        });
        return;
      }

      const updateData: Record<string, unknown> = {};

      if (type !== undefined) {
        updateData.type = type;
      }

      if (status !== undefined) {
        updateData.status = status;
      }

      if (note !== undefined) {
        updateData['note'] = note;
      }

      const company = await this.companyService.setCompany(id, updateData);

      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Company not found',
        });
        return;
      }

      res.json({
        success: true,
        data: company,
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
  async deleteCompany(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const company = await this.companyService.deleteCompany(id);

      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Company not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Company deleted successfully',
        data: company,
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
  async searchCompanies(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Search query is required',
        });
        return;
      }

      const companies = await this.companyService.searchCompanies(q);

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
  @Get('/type/:type')
  async getCompaniesByBusinessType(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.params;
      const companies = await this.companyService.getCompaniesByBusinessType(type);

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
  @Get('/:id/users')
  async getCompanyUsers(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const users = await this.userService.getUsersByCompanyId(id);

      const usersResponse = users.map((user) => {
        const userResponse = user.toObject();
        delete userResponse.password;
        return userResponse;
      });

      res.json({
        success: true,
        data: usersResponse,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }

  @Authenticated()
  @Post('/:id/users')
  async addCompanyUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, email, contactNumber, membershipType, role, status, password, props } = req.body;
      const user = await this.userService.addUserToCompany(
        id,
        { name, email, contactNumber, type: "user", password, props },
        { membershipType, role, status }
      );

      res.json({
        success: true,
        data: user?.toObject(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }

  @Authenticated()
  @Delete('/:id/users')
  async removeCompanyUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      const user = await this.userService.removeUserFromCompany(
        id,
        userId
      );

      res.json({
        success: true,
        data: user?.toObject(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }
}