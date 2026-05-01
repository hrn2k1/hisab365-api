import { Request, Response } from 'express';
import { Controller, Get, Post, Put, Delete, Authenticated } from '../decorators';
import { CompanyService } from '../services/CompanyService';

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
 *             contactEmail: "john.doe@hisab365.com",
 *             status: "pending",
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
 *         name: businessType
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

@Controller('/companies')
export class CompanyController {
  private companyService: CompanyService;

  constructor() {
    this.companyService = new CompanyService();
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
}