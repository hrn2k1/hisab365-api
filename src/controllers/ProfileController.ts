import { Request, Response } from 'express';
import { Controller, Get, Post, Delete, Authenticated, Use } from '../decorators';
import { UserService } from '../services/UserService';
import { CompanyService } from '../services/CompanyService';
import { singleFileUpload } from '../middlewares/uploadMiddleware';
import CloudinaryService from '../services/storage/CloudinaryService';

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
 *                 thanaId: 1
 *                 photo: "https://res.cloudinary.com/dgzyst4sj/image/upload/v1696200000/hisab365/profile-photos/6a61aded-906a-4801-8543-d1d5ca9e0193.jpg"
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
 * /profile/me:
 *   post:
 *     summary: Update current user profile
 *     description: Update the profile of the currently authenticated user (from Bearer token)
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
 *             properties:
 *               name:
 *                 type: string
 *               contactNumber:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               gender:
 *                 type: string
 *               divisionId:
 *                 type: number
 *               districtId:
 *                 type: number
 *               thanaId:
 *                 type: number
 *                 nullable: true
 *               props:
 *                 type: object
 *                 description: Additional profile properties (address, photo, birthDate, bloodGroup, etc.)
 *           example:
 *             name: "John Doe"
 *             contactNumber: "+880123456789"
 *             email: "john.doe@example.com"
 *             gender: "Male"
 *             divisionId: 1
 *             districtId: 1
 *             thanaId: 1
 *             photo: "https://res.cloudinary.com/dgzyst4sj/image/upload/v1696200000/hisab365/profile-photos/6a61aded-906a-4801-8543-d1d5ca9e0193.jpg"
 *             props:
 *               address: "Sheikhpara, Joypurhat"
 *               bloodGroup: "A+"            
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Profile updated successfully"
 *               data:
 *                 id: "6a61aded-906a-4801-8543-d1d5ca9e0193"
 *                 name: "John Doe"
 *                 contactNumber: "+880123456789"
 *                 email: "john.doe@example.com"
 *                 type: "user"
 *                 gender: "Male"
 *                 divisionId: 1
 *                 districtId: 1
 *                 thanaId: 1
 *                 photo: "https://res.cloudinary.com/dgzyst4sj/image/upload/v1696200000/hisab365/profile-photos/6a61aded-906a-4801-8543-d1d5ca9e0193.jpg"
 *                 props:
 *                   address: "Sheikhpara, Joypurhat"
 *                   bloodGroup: "A+"
 *       400:
 *         description: Invalid request body
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "At least one profile field is required"
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

/**
 * @swagger
 * /profile/photograph:
 *   post:
 *     summary: Upload profile photograph
 *     description: Upload authenticated user's profile photo to Cloudinary and update user photo field.
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Profile photograph uploaded successfully
 *       400:
 *         description: Invalid image or upload failed
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 *       404:
 *         description: User not found
 *   delete:
 *     summary: Delete profile photograph
 *     description: Delete authenticated user's profile photo from Cloudinary and clear user photo field.
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile photograph deleted successfully
 *       400:
 *         description: Invalid photo data or delete failed
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 *       404:
 *         description: User or profile photo not found
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
  @Post('/me')
  async updateMyProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User ID not found in authorization token',
        });
        return;
      }

      const {
        name,
        contactNumber,
        email,
        gender,
        divisionId,
        districtId,
        thanaId,
        props,
      } = req.body ?? {};

      if (props !== undefined && (typeof props !== 'object' || Array.isArray(props) || props === null)) {
        res.status(400).json({
          success: false,
          message: 'props must be a valid object',
        });
        return;
      }

      const updateData: Record<string, unknown> = {};

      if (name !== undefined) updateData.name = name;
      if (contactNumber !== undefined) updateData.contactNumber = contactNumber;
      if (email !== undefined) updateData.email = email;
      if (gender !== undefined) updateData.gender = gender;
      if (divisionId !== undefined) updateData.divisionId = divisionId;
      if (districtId !== undefined) updateData.districtId = districtId;
      if (thanaId !== undefined) updateData.thanaId = thanaId;
      if (props !== undefined) updateData.props = props;

      if (Object.keys(updateData).length === 0) {
        res.status(400).json({
          success: false,
          message: 'At least one profile field is required',
        });
        return;
      }

      const updatedUser = await this.userService.setUser(userId, updateData);

      if (!updatedUser) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const userResponse = updatedUser.toObject();
      delete userResponse.password;

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: userResponse,
      });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && (error as { code?: number }).code === 11000) {
        const duplicateField = Object.keys((error as { keyPattern?: Record<string, unknown> }).keyPattern ?? {})[0] || 'field';
        res.status(400).json({
          success: false,
          message: `${duplicateField} already exists`,
        });
        return;
      }

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

  @Authenticated()
  @Post('/photograph')
  @Use(singleFileUpload)
  async uploadPhotograph(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User ID not found in authorization token',
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No image provided. Use multipart/form-data with field name "file".',
        });
        return;
      }

      const mimeTypeToExtension: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
      };

      const fileExtension = mimeTypeToExtension[req.file.mimetype];
      if (!fileExtension) {
        res.status(400).json({
          success: false,
          message: 'Only image files are allowed for profile photograph',
        });
        return;
      }

      const cloudinaryService = new CloudinaryService();
      const uploadResult = await cloudinaryService.uploadImage(req.file.buffer, {
        folder: 'hisab365/profile-photos',
        public_id: `${userId}`,
        overwrite: true,
      });

      const updatedUser = await this.userService.setUser(userId, {
        photo: uploadResult.secureUrl,
      });

      if (!updatedUser) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const userResponse = updatedUser.toObject();
      delete userResponse.password;

      res.status(201).json({
        success: true,
        message: 'Profile photograph uploaded successfully',
        data: {          
          ...userResponse,
          photo: uploadResult.secureUrl,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to upload profile photograph',
      });
    }
  }

  @Authenticated()
  @Delete('/photograph')
  async deletePhotograph(req: Request, res: Response): Promise<void> {
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

      if (!user.photo) {
        res.status(404).json({
          success: false,
          message: 'No profile photograph found',
        });
        return;
      }

      const cloudinaryService = new CloudinaryService();
      const imageExtensionMatch = user.photo.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
      const imageExtension = imageExtensionMatch?.[1]?.toLowerCase();

      if (!imageExtension) {
        res.status(400).json({
          success: false,
          message: 'Could not determine image extension from photo URL',
        });
        return;
      }

      await cloudinaryService.deleteFile(`hisab365/profile-photos/${userId}`, 'image');

      const updatedUser = await this.userService.setUser(userId, {
        photo: '',
      });

      if (!updatedUser) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      const userResponse = updatedUser.toObject();
      delete userResponse.password;

      res.json({
        success: true,
        message: 'Profile photograph deleted successfully',
        data: userResponse,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete profile photograph',
      });
    }
  }
}
