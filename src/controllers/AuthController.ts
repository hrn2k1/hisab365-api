import { Request, Response } from 'express';
import { Controller, Post, Authenticated } from '../decorators';
import { UserService } from '../services/UserService';
import { generateToken } from '../utils/jwt';
import { CompanyService } from '../services/CompanyService';

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication endpoints
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Login with email or contact number and password
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - loginName
 *               - password
 *             properties:
 *               loginName:
 *                 type: string
 *                 description: Email address or contact number
 *               password:
 *                 type: string
 *           example:
 *             loginName: "john.doe@example.com"
 *             password: "Pass@123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImlzcyI6ImhybnNvZnQuY29tIn0..."
 *               data:
 *                 id: "6a61aded-906a-4801-8543-d1d5ca9e0193"
 *                 name: "John Doe"
 *                 email: "john.doe@example.com"
 *                 contactNumber: "+880123456789"
 *                 type: "user"
 *                 companyId: "12345678-90ab-cdef-1234-567890abcdef"
 *                 divisionId: 1
 *                 districtId: 1
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Email/Contact number and password are required"
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Invalid email/contact number or password"
 */

/**
 * @swagger
 * /auth/resolve-user:
 *   post:
 *     summary: Resolve existing user and issue token
 *     description: Find a user by email or contact number and return a login token if found.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - contactNumber
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               name:
 *                 type: string
 *               contactNumber:
 *                 type: string
 *           example:
 *             email: "john.doe@example.com"
 *             name: "John Doe"
 *             contactNumber: "+880123456789"
 *     responses:
 *       200:
 *         description: User resolved and token generated
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImlzcyI6ImhybnNvZnQuY29tIn0..."
 *               data:
 *                 id: "6a61aded-906a-4801-8543-d1d5ca9e0193"
 *                 name: "John Doe"
 *                 email: "john.doe@example.com"
 *                 contactNumber: "+880123456789"
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "email, name and contactNumber are required"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "No user found with the provided email or contact number"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred"
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Organization registration
 *     description: Register a new organization (company) along with an admin user.
 *     tags:
 *       - Authentication
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
 *               - type
 *               - contactPerson
 *               - contactNumber
 *               - contactEmail
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               addressLine1:
 *                 type: string
 *               addressLine2:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [Masjid, Mess, Buildling]
 *               contactPerson:
 *                 type: string
 *               contactNumber:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *           example:
 *             name: "Masjid Al Azad"
 *             addressLine1: "Sheikhpara, Joypurhat"
 *             addressLine2: "Joypurhat, Bangladesh"
 *             type: "Masjid"
 *             contactPerson: "Abdullah"
 *             contactNumber: "+880123456789"
 *             contactEmail: "abdullah@example.com"
 *             password: "Pass@123"
 *     responses:
 *       201:
 *         description: Organization registered successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: "6a61aded-906a-4801-8543-d1d5ca9e0193"
 *                 name: "Masjid Al Azad"
 *                 addressLine1: "Sheikhpara, Joypurhat"
 *                 addressLine2: "Joypurhat, Bangladesh"
 *                 type: "Masjid"
 *                 contactPerson: "Abdullah"
 *                 contactNumber: "+880123456789"
 *                 contactEmail: "abdullah@example.com"
 *                 status: "pending"
 *       400:
 *         description: Invalid input or duplicate organization name
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Organization already exists"
 */

/**
 * @swagger
 * /auth/select-company:
 *   post:
 *     summary: Select a company for the current session
 *     description: After login, user can select one of their companies to work with. This will return a new JWT token with loggedInCompanyId set.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
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
 *                 description: ID of the company to select
 *           example:
 *             companyId: "12345678-90ab-cdef-1234-567890abcdef"
 *     responses:
 *       200:
 *         description: Company selected successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImlzcyI6ImhybnNvZnQuY29tIn0..."
 *               data: 
 *                  id: "12345678-90ab-cdef-1234-567890abcdef"
 *                  name: "Masjid Al Azad"
 *                  addressLine1: "Sheikhpara, Joypurhat"
 *                  addressLine2: "Joypurhat, Bangladesh"
 *                  type: "Masjid"
 *                  contactPerson: "Abdullah"
 *                  contactNumber: "+880123456789"
 *                  contactEmail: "abdullah@example.com"
 *                  status: "active"
 *               message: "Successfully selected company: 12345678-90ab-cdef-1234-567890abcdef"
 *       400:
 *         description: Missing or invalid companyId
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "companyId is required"
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "User not authenticated"
 *       403:
 *         description: User does not have access to the company
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "User does not have access to this company"
 */

@Controller('/auth')
export class AuthController {
  private companyService: CompanyService;
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
    this.companyService = new CompanyService();
  }

  @Post('/login')
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { loginName, password } = req.body;

      if (!loginName || !password) {
        res.status(400).json({
          success: false,
          message: 'Email/Contact number and password are required',
        });
        return;
      }

      const user = await this.userService.login(loginName, password);

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid email/contact number or password',
        });
        return;
      }

      // Convert to plain object and remove password
      const userResponse = user.toObject();
      delete userResponse.password;

      // Generate JWT token
      const tokenPayload: any = {
        userId: user._id,
        email: user.email,
        contactNumber: user.contactNumber,
        name: user.name,
        companyIds: user.memberships.map(membership => membership.companyId),
      };

      if (user.memberships.length === 1) {
        tokenPayload.loggedInCompanyId = user.memberships[0].companyId;
        const company = await this.companyService.getCompanyById(tokenPayload.loggedInCompanyId);
        if (company) {
          tokenPayload.loggedInCompanyName = company.name;
        }
      }

      const token = generateToken(tokenPayload);
      res.json({
        success: true,
        token,
        data: userResponse,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }

  @Post('/resolve-user')
  async resolveUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, name, contactNumber } = req.body;

      if (!email || !name) {
        res.status(400).json({
          success: false,
          message: 'Email and name are required',
        });
        return;
      }

      const user = await this.userService.getUserByEmailOrContact(email, contactNumber);
      if (!user) {
        res.status(200).json({
          success: false,
          messageCode: 'USER_NOT_FOUND',
          message: 'Your email address or phone number is not registered with any organization. Please contact your organization admin to get access or register your organization if you are an admin.',
        });
        return;
      }

      const userResponse = user.toObject();
      delete userResponse.password;
      const tokenPayload: any = {
        userId: user._id,
        email: user.email,
        contactNumber: user.contactNumber,
        name: user.name,
        companyIds: user.memberships.map((membership) => membership.companyId),
      };
      if (user.memberships.length === 1) {
        tokenPayload.loggedInCompanyId = user.memberships[0].companyId;
        const company = await this.companyService.getCompanyById(tokenPayload.loggedInCompanyId);
        if (company) {
          tokenPayload.loggedInCompanyName = company.name;
        }
      }
      const token = generateToken(tokenPayload);

      res.json({
        success: true,
        token,
        data: userResponse,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }

  @Post('/register')
  async register(req: Request, res: Response): Promise<void> {
    try {
      const payload = req.body;

      // Validate required fields
      const requiredFields = [
        'name',
        'addressLine1',
        'contactPerson',
        'contactNumber',
        'contactEmail',
        'type',
        'password'
      ];

      for (const field of requiredFields) {
        if (!payload[field]) {
          res.status(400).json({
            success: false,
            message: `${field} is required`,
          });
          return;
        }
      }

      const existingCompany = await this.companyService.getCompanyByName(payload.name);
      if (existingCompany) {
        res.status(409).json({
          success: false,
          message: `A company with the name "${payload.name}" already exists`,
        });
        return;
      }

      const company = await this.companyService.createCompany({
        name: payload.name,
        addressLine1: payload.addressLine1,
        addressLine2: payload.addressLine2,
        phone: payload.contactNumber,
        email: payload.contactEmail,
        website: payload.website,
        contactPerson: payload.contactPerson,
        contactNumber: payload.contactNumber,
        contactEmail: payload.contactEmail,
        type: payload.type,
        status: 'pending',
      });

      const existingUser = await this.userService.getUserByEmail(payload.contactEmail);
      if (!existingUser) {
        const user = await this.userService.createUser({
          name: payload.contactPerson,
          email: payload.contactEmail,
          contactNumber: payload.contactNumber,
          password: payload.password,
          memberships: [{
            companyId: company.id,
            role: 'admin',
            joinedAt: new Date(),
            status: 'active',
            statusDate: new Date(),
          }],
          type: 'user',
        });
      } else {
        // If user already exists, push membership to the new company
        await this.userService.addMembership(existingUser._id, {
          companyId: company.id,
          role: 'admin',
          joinedAt: new Date(),
          status: 'active',
          statusDate: new Date(),
        });
      }

      res.status(201).json({
        success: true,
        data: {
          id: company._id,
          ...company.toObject(),
        },
        message: 'Company registered successfully. An admin user has been created with the contact email. Please login to select the company and start using the application.',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }

  @Post('/select-company')
  @Authenticated()
  async selectCompany(req: Request, res: Response): Promise<void> {
    try {
      // Verify user is authenticated
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const { companyId } = req.body;

      if (!companyId) {
        res.status(400).json({
          success: false,
          message: 'companyId is required',
        });
        return;
      }

      // Validate that user has access to this company
      if (!req.user.companyIds.includes(companyId)) {
        res.status(403).json({
          success: false,
          message: 'User does not have access to this company',
        });
        return;
      }
      const company = await this.companyService.getCompanyById(companyId);
      if (!company) {
        res.status(400).json({
          success: false,
          message: 'Invalid companyId',
        });
        return;
      }
      // Generate new token with loggedInCompanyId
      const newToken = generateToken({
        userId: req.user.userId,
        email: req.user.email,
        contactNumber: req.user.contactNumber,
        name: req.user.name,
        companyIds: req.user.companyIds,
        loggedInCompanyId: companyId,
        loggedInCompanyName: company.name,
      });

      res.json({
        success: true,
        token: newToken,
        data: {
          id: company._id,
          ...company.toObject(),
          _id: undefined,
        },
        message: `Successfully selected company: ${companyId}`,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }

}
