import { Request, Response } from 'express';
import { Controller, Get, Post, Authenticated } from '../decorators';
import { UserService } from '../services/UserService';
import { CompanyService } from '../services/CompanyService';

/**
 * @swagger
 * tags:
 *   - name: Profile
 *     description: User profile management endpoints
 */

/**
 * @swagger
 * /profile/me:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieve the profile of the currently authenticated user (from Bearer token)
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
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
 *                   bloodGroup: "A+"
 *                 createdAt: "2024-06-01T00:00:00Z"
 *                 updatedAt: "2024-06-01T00:00:00Z"
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 *       404:
 *         description: User not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /profile/change-password:
 *   post:
 *     summary: Change user password
 *     description: Change password for an authenticated user (requires Bearer token)
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID
 *               oldPassword:
 *                 type: string
 *                 description: Current password
 *               newPassword:
 *                 type: string
 *                 description: New password
 *           example:
 *             userId: "6a61aded-906a-4801-8543-d1d5ca9e0193"
 *             oldPassword: "Pass@123"
 *             newPassword: "NewPass@456"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Password changed successfully"
 *               data:
 *                 id: "6a61aded-906a-4801-8543-d1d5ca9e0193"
 *                 name: "John Doe"
 *                 email: "john.doe@example.com"
 *       400:
 *         description: Missing required fields or invalid input
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "User ID, current password, and new password are required"
 *       401:
 *         description: Current password is incorrect, user not found, or missing authorization
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Current password is incorrect"
 */

/**
 * @swagger
 * /profile/my-companies:
 *   get:
 *     summary: Get companies of current user
 *     description: Returns all companies the authenticated user is a member of.
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Companies retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: "12345678-90ab-cdef-1234-567890abcdef"
 *                   name: "Masjid Al Azad"
 *                   type: "Masjid"
 *                   status: "active"
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

@Controller('/profile')
export class ProfileController {
  private userService: UserService;
  private companyService: CompanyService;

  constructor() {
    this.userService = new UserService();
    this.companyService = new CompanyService();
  }

  @Authenticated()
  @Get('/my-companies')
  async getMyCompanies(req: Request, res: Response): Promise<void> {
    try {
      const companyIds = req.user?.companyIds ?? [];
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
  @Get('/me')
  async getMyProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User ID not found in authorization token',
        });
        return;
      }

      const user = await this.userService.getUserById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      // Convert to plain object and remove password
      const userResponse = user.toObject();
      delete userResponse.password;

      res.json({
        success: true,
        data: userResponse,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }

  @Authenticated()
  @Post('/change-password')
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const { userId, oldPassword, newPassword } = req.body;

      if (!userId || !oldPassword || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'User ID, current password, and new password are required',
        });
        return;
      }

      // Validate that new password is different from old password
      if (oldPassword === newPassword) {
        res.status(400).json({
          success: false,
          message: 'New password must be different from current password',
        });
        return;
      }

      const user = await this.userService.changePassword(userId, oldPassword, newPassword);

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      // Convert to plain object and remove password
      const userResponse = user.toObject();
      delete userResponse.password;

      res.json({
        success: true,
        message: 'Password changed successfully',
        data: userResponse,
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }
}
