import { Request, Response } from 'express';
import { Controller, Get, Post, Put, Delete, Authenticated } from '../decorators/index';
import { AccountService } from '../services/AccountService';

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
 *         name: type
 *         required: false
 *         schema:
 *           type: string
 *           enum: ['Asset', 'Cash', 'Bank', 'Supplier', 'Customer', 'Income', 'Expense']
 *         description: Optional account type filter. If empty or not provided, returns all accounts.
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
    const type = typeof req.query.type === 'string' ? req.query.type.trim() : '';
    const accountService = new AccountService(req.user?.loggedInCompanyId!);
    const accounts = type ? await accountService.getAccountsByType(type) : await accountService.getAllAccounts();
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
    const { name, type, openingBalance, currentBalance, props } = req.body;

    if (!name || !type) {
      res.status(400).json({ success: false, message: 'Name and type are required' });
      return;
    }

    const account = await new AccountService(req.user?.loggedInCompanyId!).createAccount({
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

    const account = await new AccountService(req.user?.loggedInCompanyId!).updateAccount(id, {
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
    const deleted = await new AccountService(req.user?.loggedInCompanyId!).deleteAccount(id);

    if (!deleted) {
      res.status(404).json({ success: false, message: 'Account not found' });
      return;
    }

    res.json({ success: true, message: 'Account deleted successfully' });
  }
}
