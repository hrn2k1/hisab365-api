import { Request, Response } from 'express';
import { Controller, Get, Post, Put, Delete, Authenticated } from '../decorators/index';
import { AccountService } from '../services/AccountService';

/**
 * @swagger
 * /accounts:
 *   get:
 *     summary: Get all accounts
 *     description: Retrieve all accounts from the system
 *     tags:
 *       - Accounts
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
 * /accounts/type/{type}:
 *   get:
 *     summary: Get accounts by type
 *     description: Retrieve all accounts of a specific type
 *     tags:
 *       - Accounts
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: ['Asset', 'Cash', 'Bank', 'Supplier', 'Customer', 'Income', 'Expense']
 *         description: Account type
 *     responses:
 *       200:
 *         description: Accounts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Account'
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
 *                 enum: ['Asset', 'Cash', 'Bank', 'Supplier', 'Customer', 'Income', 'Expense']
 *                 example: "Bank"
 *               openingBalance:
 *                 type: number
 *                 example: 10000
 *               currentBalance:
 *                 type: number
 *                 example: 10000
 *               props:
 *                 type: object
 *                 example: { "bankName": "IBBL", "accountNumber": "123456" }
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
 *                 enum: ['Asset', 'Cash', 'Bank', 'Supplier', 'Customer', 'Income', 'Expense']
 *               openingBalance:
 *                 type: number
 *               currentBalance:
 *                 type: number
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
    const accounts = await new AccountService(req.user?.companyId!).getAllAccounts();
    res.json({ success: true, data: accounts });
  }

  @Get('/type/:type')
  @Authenticated()
  async getAccountsByType(req: Request, res: Response): Promise<void> {
    const { type } = req.params;
    const validTypes = ['Asset', 'Cash', 'Bank', 'Supplier', 'Customer', 'Income', 'Expense'];
    
    if (!validTypes.includes(type)) {
      res.status(400).json({ success: false, message: `Invalid type. Must be one of: ${validTypes.join(', ')}` });
      return;
    }

    const accounts = await new AccountService(req.user?.companyId!).getAccountsByType(type);
    res.json({ success: true, data: accounts });
  }

  @Get('/:id')
  @Authenticated()
  async getAccountById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const account = await new AccountService(req.user?.companyId!).getAccountById(id);

    if (!account) {
      res.status(404).json({ success: false, message: 'Account not found' });
      return;
    }

    res.json({ success: true, data: account });
  }

  @Post()
  @Authenticated()
  async createAccount(req: Request, res: Response): Promise<void> {
    const { name, type, openingBalance, currentBalance, props } = req.body;

    if (!name || !type) {
      res.status(400).json({ success: false, message: 'Name and type are required' });
      return;
    }

    const validTypes = ['Asset', 'Cash', 'Bank', 'Supplier', 'Customer', 'Income', 'Expense'];
    if (!validTypes.includes(type)) {
      res.status(400).json({ success: false, message: `Invalid type. Must be one of: ${validTypes.join(', ')}` });
      return;
    }

    const account = await new AccountService(req.user?.companyId!).createAccount({
      name,
      type,
      openingBalance: openingBalance || 0,
      currentBalance: currentBalance || 0,
      props: props || {},
    });

    res.status(201).json({ success: true, message: 'Account created successfully', data: account });
  }

  @Put('/:id')
  @Authenticated()
  async updateAccount(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { name, type, openingBalance, currentBalance, props } = req.body;

    if (type) {
      const validTypes = ['Asset', 'Cash', 'Bank', 'Supplier', 'Customer', 'Income', 'Expense'];
      if (!validTypes.includes(type)) {
        res.status(400).json({ success: false, message: `Invalid type. Must be one of: ${validTypes.join(', ')}` });
        return;
      }
    }

    const account = await new AccountService(req.user?.companyId!).updateAccount(id, {
      name,
      type,
      openingBalance,
      currentBalance,
      props,
    });

    if (!account) {
      res.status(404).json({ success: false, message: 'Account not found' });
      return;
    }

    res.json({ success: true, message: 'Account updated successfully', data: account });
  }

  @Delete('/:id')
  @Authenticated()
  async deleteAccount(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const deleted = await new AccountService(req.user?.companyId!).deleteAccount(id);

    if (!deleted) {
      res.status(404).json({ success: false, message: 'Account not found' });
      return;
    }

    res.json({ success: true, message: 'Account deleted successfully' });
  }
}
