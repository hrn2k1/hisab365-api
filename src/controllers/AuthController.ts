import { Request, Response } from 'express';
import { Controller, Post, Authenticated } from '../decorators';
import { UserService } from '../services/UserService';
import { generateToken } from '../utils/jwt';

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
 * /auth/register:
 *   post:
 *     summary: User or bank registration
 *     description: Register a new user or blood bank in the system
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
 *               - contactNumber
 *               - email
 *               - password
 *               - type
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
 *             divisionId: null
 *             districtId: null
 *             props:
 *               address: "Sheikhpara, Joypurhat"
 *               photo: "https://example.com/photos/john_doe.jpg"
 *               birthDate: "1985-01-01"
 *               bloodGroup: "A+"
 *               geolocation:
 *                  latitude: 23.8103
 *                  longitude: 89.5103
 *     responses:
 *       201:
 *         description: User or bank registered successfully
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
 *                 gender: "Male"
 *                 divisionId: 1
 *                 districtId: 1
 *                 props:
 *                   address: "Sheikhpara, Joypurhat"
 *       400:
 *         description: Invalid input or duplicate email/contact number
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Email already exists"
 */

@Controller('/auth')
export class AuthController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
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
      const token = generateToken({
        userId: user._id,
        email: user.email,
        contactNumber: user.contactNumber,
        name: user.name,
      });
      
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
      const userData = req.body;

      // Validate required fields
      const requiredFields = [
        'name',
        'contactNumber',
        'email',
        'password',
        'type'
      ];

      for (const field of requiredFields) {
        if (!userData[field]) {
          res.status(400).json({
            success: false,
            message: `${field} is required`,
          });
          return;
        }
      }

      // Validate type is either 'user' or 'admin'
      if (!['user', 'admin', 'superadmin'].includes(userData.type)) {
        res.status(400).json({
          success: false,
          message: 'Type must be either "user", "admin", or "superadmin"',
        });
        return;
      }

      const user = await this.userService.createUser(userData);

      // Convert to plain object and remove password
      const userResponse = user.toObject();
      delete userResponse.password;

      res.status(201).json({
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

}
