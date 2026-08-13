import { Request, Response } from 'express';
import { Controller, Get, Post, Put, Delete, Authenticated, Patch } from '../decorators/index';
import { AccountService } from '../services/AccountService';
import { UserService } from '../services/UserService';
import { TransactionService } from '../services/TransactionService';
import { Setting } from '../models/Setting';

/**
 * @swagger
 * /accounts:
 *   get:
 *     summary: Get accounts (optionally by type)
 *     description: Retrieve all accounts, or filter by type when query parameter is provided
 *     tags:
 *       - Accounts
 *     parameters:
 *       - in: query
 *         name: types
 *         required: false
 *         schema:
 *           type: string
 *         description: Optional account types filter (comma-separated). If empty or not provided, returns all accounts.
 *     responses:
 *       200:
 *         description: Successfully retrieved all accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Account'
 */

/**
 * @swagger
 * /accounts/{id}:
 *   get:
 *     summary: Get account by ID
 *     description: Retrieve a specific account by its ID
 *     tags:
 *       - Accounts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account ID
 *     responses:
 *       200:
 *         description: Account found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       404:
 *         description: Account not found
 */

/**
 * @swagger
 * /accounts:
 *   post:
 *     summary: Create new account
 *     description: Create a new account with the provided details
 *     tags:
 *       - Accounts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['name', 'type']
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Bank Account"
 *               type:
 *                 type: string
 *                 example: "Bank"
 *               openingBalance:
 *                 type: number
 *                 example: 10000
 *               openingBalanceDate:
 *                 type: string
 *                 format: date
 *                 example: "2023-01-01"
 *               remarks:
 *                 type: string
 *                 example: "This is a remark"
 *               props:
 *                 type: object
 *                 example: { "bankName": "IBBL", "branchName": "Main Branch" }
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       400:
 *         description: Invalid input
 */

/**
 * @swagger
 * /accounts/{id}:
 *   put:
 *     summary: Update account
 *     description: Update an existing account
 *     tags:
 *       - Accounts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               openingBalance:
 *                 type: number
 *               openingBalanceDate:
 *                 type: string
 *                 format: date
 *               remarks:
 *                 type: string
 *               props:
 *                 type: object
 *     responses:
 *       200:
 *         description: Account updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       404:
 *         description: Account not found
 */

/**
 * @swagger
 * /accounts/{id}:
 *   delete:
 *     summary: Delete account
 *     description: Delete an account by ID
 *     tags:
 *       - Accounts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Account ID
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       404:
 *         description: Account not found
 */

@Controller('/accounts')
export class AccountController {
  //private accountService: AccountService;

  constructor() {
    //this.accountService = new AccountService("");
  }

  @Get()
  @Authenticated()
  async getAllAccounts(req: Request, res: Response): Promise<void> {
    const types = typeof req.query.types === 'string' ? req.query.types.trim() : '';
    const filteredTypes = types ? types.split(',').map(t => t.trim()) : [];
    const accountService = new AccountService(req.user?.loggedInCompanyId!);
    const accounts = filteredTypes.length > 0 ? await accountService.getAccountsByTypes(filteredTypes) : await accountService.getAllAccounts();
    res.json({ success: true, data: accounts });
  }

  @Get('/:id')
  @Authenticated()
  async getAccountById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const account = await new AccountService(req.user?.loggedInCompanyId!).getAccountById(id);

    if (!account) {
      res.status(404).json({ success: false, message: 'Account not found' });
      return;
    }

    res.json({ success: true, data: account });
  }

  @Post()
  @Authenticated()
  async createAccount(req: Request, res: Response): Promise<void> {
    const { name, type, status, openingBalance, openingBalanceDate, remarks, props } = req.body;

    if (!name || !type) {
      res.status(400).json({ success: false, message: 'Name and type are required' });
      return;
    }

    const account = await new AccountService(req.user?.loggedInCompanyId!).createAccount({
      name,
      type,
      status: status || 'ACTIVE',
      openingBalance: openingBalance || 0,
      openingBalanceDate: openingBalanceDate || new Date(),
      currentBalance: openingBalance || 0,
      remarks: remarks || '',
      props: props || {},
    });

    res.status(201).json({ success: true, message: 'Account created successfully', data: account });
  }

  @Put('/:id')
  @Authenticated()
  async updateAccount(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { name, type, status, openingBalance, openingBalanceDate, remarks, props } = req.body;
    let account = await new AccountService(req.user?.loggedInCompanyId!).getAccountById(id);

    if (!account) {
      res.status(404).json({ success: false, message: 'Account not found' });
      return;
    }
    const currentBalance = (account.currentBalance || 0) + ((openingBalance || 0) - (account.openingBalance || 0));
    account = await new AccountService(req.user?.loggedInCompanyId!).updateAccount(id, {
      name,
      type,
      openingBalance,
      openingBalanceDate,
      currentBalance,
      remarks,
      props,
      status: status || 'ACTIVE',
    });

    if (!account) {
      res.status(404).json({ success: false, message: 'Account not found' });
      return;
    }

    res.json({ success: true, message: 'Account updated successfully', data: account });
  }

  @Authenticated()
  @Patch('/:id')
  async patchAccount(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, type, status, openingBalance, openingBalanceDate, remarks, props, userId } = req.body;
      let account = await new AccountService(req.user?.loggedInCompanyId!).getAccountById(id);

      if (!account) {
        res.status(404).json({ success: false, message: 'Account not found' });
        return;
      }
      const currentBalance = (account.currentBalance || 0) + ((openingBalance || 0) - (account.openingBalance || 0));

      const updateData: Record<string, unknown> = {
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
        ...(openingBalance !== undefined && { openingBalance }),
        ...(openingBalanceDate !== undefined && { openingBalanceDate }),
        ...(remarks !== undefined && { remarks }),
        ...(props !== undefined && { props }),
        ...(currentBalance !== undefined && { currentBalance }),
        ...(status !== undefined && { status }),
        ...(userId !== undefined && { userId }),
      };

      const company = await new AccountService(req.user?.loggedInCompanyId!).setAccount(id, updateData);

      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Account not found',
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

  @Delete('/:id')
  @Authenticated()
  async deleteAccount(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const deleted = await new AccountService(req.user?.loggedInCompanyId!).deleteAccount(id);

    if (!deleted) {
      res.status(404).json({ success: false, message: 'Account not found' });
      return;
    }

    res.json({ success: true, message: 'Account deleted successfully' });
  }

  /**
   * @swagger
   * /accounts/{accountId}/enable-login:
   *   post:
   *     summary: Enable login for an account
   *     description: Create a user account for a CUSTOMER or SUPPLIER account to enable login functionality. Extracts user details from account properties (CONACT_PERSON, CONACT_EMAIL, CONACT_NUMBER).
   *     tags:
   *       - Accounts
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: accountId
   *         required: true
   *         schema:
   *           type: string
   *         description: Account ID (must be CUSTOMER or SUPPLIER type)
   *         example: "550e8400-e29b-41d4-a716-446655440000"
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
   *                 description: Password for the new user account
   *                 example: "SecurePassword@123"
   *               role:
   *                 type: string
   *                 description: Role for the membership (optional, defaults to 'user')
   *                 example: "user"
   *     responses:
   *       201:
   *         description: Login enabled successfully - User account created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Login enabled successfully"
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       example: "6a61aded-906a-4801-8543-d1d5ca9e0193"
   *                     name:
   *                       type: string
   *                       example: "John Doe"
   *                     email:
   *                       type: string
   *                       example: "john.doe@example.com"
   *                     contactNumber:
   *                       type: string
   *                       example: "+880123456789"
   *                     type:
   *                       type: string
   *                       example: "user"
   *                     memberships:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           companyId:
   *                             type: string
   *                           membershipType:
   *                             type: string
   *                             enum: ['customer', 'supplier']
   *                           role:
   *                             type: string
   *                           status:
   *                             type: string
   *                             enum: ['active', 'pending', 'rejected']
   *       400:
   *         description: Invalid input or missing required account properties
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *             examples:
   *               invalidType:
   *                 summary: Invalid account type
   *                 value:
   *                   success: false
   *                   message: "Login can be enabled only for CUSTOMER/SUPPLIER accounts"
   *               missingProps:
   *                 summary: Missing required account properties
   *                 value:
   *                   success: false
   *                   message: "Contact person, contact email or contact number are required to enable login"
   *               missingCompany:
   *                 summary: Missing company context
   *                 value:
   *                   success: false
   *                   message: "Logged in company is required"
   *       401:
   *         description: Unauthorized - Missing or invalid Bearer token
   *       404:
   *         description: Account not found
   *         content:
   *           application/json:
   *             example:
   *               success: false
   *               message: "Account not found"
   *       409:
   *         description: Conflict - User already exists with this email or contact number
   *         content:
   *           application/json:
   *             example:
   *               success: false
   *               message: "A user already exists with this email or contact number"
   */

  @Post('/:accountId/enable-login')
  @Authenticated()
  async enableAccountLogin(req: Request, res: Response): Promise<void> {
    const { accountId } = req.params;
    const companyId = req.user?.loggedInCompanyId;
    const { password, role } = req.body;

    if (!companyId) {
      res.status(400).json({ success: false, message: 'Logged in company is required' });
      return;
    }

    const accountService = new AccountService(companyId);
    const userService = new UserService();
    const account = await accountService.getAccountById(accountId);

    if (!account) {
      res.status(404).json({ success: false, message: 'Account not found' });
      return;
    }

    const normalizedType = String(account.type || '').trim().toLowerCase();
    if (!['customer', 'supplier'].includes(normalizedType)) {
      res.status(400).json({
        success: false,
        message: 'Login can be enabled only for CUSTOMER/SUPPLIER accounts',
      });
      return;
    }

    const props = (account.props || {}) as Record<string, any>;
    const name = String(props['CONACT_PERSON'] || '').trim();
    const email = String(props['CONACT_EMAIL'] || '').trim();
    const contactNumber = String(props['CONACT_NUMBER'] || '').trim();

    if (!name || (!email && !contactNumber)) {
      res.status(400).json({
        success: false,
        message: 'Contact person, contact email or contact number are required to enable login',
      });
      return;
    }

    let user = await userService.getUserByEmailOrContact(email, contactNumber);
    if (user) {
      if (!user.memberships.find(m => m.companyId === companyId)) {
        await userService.addMembership(user._id, {
          companyId,
          membershipType: normalizedType,
          role: role || 'user',
          joinedAt: new Date(),
          status: 'active',
          statusDate: new Date(),
        });
      } else {
        await userService.editMembership(user._id, companyId, {
          membershipType: normalizedType,
          role: role || 'user',
          status: 'active',
          statusDate: new Date(),
        });
      }
    } else {
      user = await userService.createUser({
        name,
        email,
        contactNumber,
        password,
        type: 'user',
        memberships: [
          {
            companyId,
            membershipType: normalizedType,
            role: role || 'user',
            joinedAt: new Date(),
            status: 'active',
            statusDate: new Date(),
          },
        ],
      } as any);
    }
    await accountService.setAccount(accountId, {
      userId: user._id,
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'Login enabled successfully',
      data: userResponse,
    });
  }

  /**
   * @swagger
   * /accounts/{accountId}/disable-login:
   *   post:
   *     summary: Disable login for an account
   *     description: Disable login functionality by setting the user membership status to 'inactive'. The user is found by account.userId, email, or contact number.
   *     tags:
   *       - Accounts
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: accountId
   *         required: true
   *         schema:
   *           type: string
   *         description: Account ID
   *         example: "550e8400-e29b-41d4-a716-446655440000"
   *     responses:
   *       200:
   *         description: Login disabled successfully - User membership status set to inactive
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Login disabled successfully"
   *                 data:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       example: "6a61aded-906a-4801-8543-d1d5ca9e0193"
   *                     name:
   *                       type: string
   *                       example: "John Doe"
   *                     email:
   *                       type: string
   *                       example: "john.doe@example.com"
   *                     contactNumber:
   *                       type: string
   *                       example: "+880123456789"
   *                     memberships:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           companyId:
   *                             type: string
   *                           status:
   *                             type: string
   *                             enum: ['active', 'pending', 'rejected', 'inactive']
   *                           statusDate:
   *                             type: string
   *                             format: date-time
   *       400:
   *         description: Invalid input or missing company context
   *         content:
   *           application/json:
   *             example:
   *               success: false
   *               message: "Logged in company is required"
   *       401:
   *         description: Unauthorized - Missing or invalid Bearer token
   *       404:
   *         description: Account or user not found
   *         content:
   *           application/json:
   *             examples:
   *               accountNotFound:
   *                 summary: Account not found
   *                 value:
   *                   success: false
   *                   message: "Account not found"
   *               userNotFound:
   *                 summary: User not found
   *                 value:
   *                   success: false
   *                   message: "User not found for this account"
   */

  @Post('/:accountId/disable-login')
  @Authenticated()
  async disableAccountLogin(req: Request, res: Response): Promise<void> {
    const { accountId } = req.params;
    const companyId = req.user?.loggedInCompanyId;

    if (!companyId) {
      res.status(400).json({ success: false, message: 'Logged in company is required' });
      return;
    }

    const accountService = new AccountService(companyId);
    const userService = new UserService();
    const account = await accountService.getAccountById(accountId);

    if (!account) {
      res.status(404).json({ success: false, message: 'Account not found' });
      return;
    }

    let user = null;

    // Try to find user by account.userId first
    if (account.userId) {
      user = await userService.getUserById(account.userId);
    }

    // If not found by userId, try by email/contact from props
    if (!user) {
      const props = (account.props || {}) as Record<string, any>;
      const email = String(props['CONACT_EMAIL'] || '').trim();
      const contactNumber = String(props['CONACT_NUMBER'] || '').trim();

      if (email || contactNumber) {
        user = await userService.getUserByEmailOrContact(email, contactNumber);
      }
    }

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found for this account' });
      return;
    }

    // Update membership status to inactive
    const updatedUser = await userService.editMembership(user._id, companyId, {
      status: 'inactive',
      statusDate: new Date(),
    });

    if (!updatedUser) {
      res.status(404).json({ success: false, message: 'Membership not found for this user in the company' });
      return;
    }

    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'Login disabled successfully',
      data: userResponse,
    });
  }

  @Authenticated()
  @Patch('/:id/props')
  async updateAccountProps(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { props, comment } = req.body;
      const loggedInUser = req.user;
      const account = await new AccountService(loggedInUser?.loggedInCompanyId!).updateAccountProps(id, loggedInUser?.userId!, props, comment);

      if (!account) {
        res.status(404).json({
          success: false,
          message: 'account not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Account additional information updated successfully',
        data: account,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }

  @Get('/:id/balance')
  @Authenticated()
  async getAccountBalance(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { date } = req.query;
    const dateUpTo = new Date(date as string);
    dateUpTo.setDate(dateUpTo.getDate() - 1); // Add one day to include the entire day in the query
    dateUpTo.setHours(23, 59, 59, 999);
    const accountService = new AccountService(req.user?.loggedInCompanyId!);
    const transactionService = new TransactionService(req.user?.loggedInCompanyId!);
    const account = await accountService.getAccountById(id);
    if (!account) {
      res.status(404).json({ success: false, message: 'Account not found' });
      return;
    }
    const setting = await Setting.findOne({}, { accountTypes: 1, _id: 0 }).lean();
    const nature = ((setting as any)?.accountTypes || {})[account?.type || '']?.nature || 1;
    const summary = await transactionService.getAccountTransactionsSummary(id, nature, dateUpTo, false);
    account.currentBalance = (account.openingBalance || 0) + (summary || 0);
    res.json({ success: true, data: account });
  }
}
