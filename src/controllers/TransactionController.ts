import { Request, Response } from 'express';
import { Controller, Get, Post, Put, Delete, Authenticated } from '../decorators';
import { TransactionService } from '../services/TransactionService';

/**
 * @swagger
 * tags:
 *   - name: Transactions
 *     description: Transaction management endpoints
 */

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Get all transactions
 *     description: Retrieve a list of all transactions
 *     tags:
 *       - Transactions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of transactions retrieved successfully
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
 *                     $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     summary: Create a new transaction
 *     description: Create a new transaction in the system
 *     tags:
 *       - Transactions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - voucherNo
 *               - voucherType
 *               - amount
 *               - description
 *               - details
 *               - status
 *               - createdBy
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               voucherNo:
 *                 type: string
 *               voucherType:
 *                 type: string
 *                 enum: [Credit, Debit, Journal]
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               details:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     accountId:
 *                       type: string
 *                     type:
 *                       type: string
 *                       enum: [Credit, Debit]
 *                     amount:
 *                       type: number
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     fileName:
 *                       type: string
 *                     fileType:
 *                       type: string
 *                     fileSize:
 *                       type: number
 *                     url:
 *                       type: string
 *               status:
 *                 type: string
 *               createdBy:
 *                 type: string
 *               checkedBy:
 *                 type: array
 *                 items:
 *                   type: string
 *               approvedBy:
 *                 type: array
 *                 items:
 *                   type: string
 *               props:
 *                 type: object
 *               activityLog:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     userId:
 *                       type: string
 *                     action:
 *                       type: string
 *                     comment:
 *                       type: string
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 */

/**
 * @swagger
 * /transactions/{id}:
 *   get:
 *     summary: Get transaction by ID
 *     description: Retrieve a specific transaction by its unique ID
 *     tags:
 *       - Transactions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "d1c9e5b8-7a0c-4f1b-9c3e-2a5f8e6b9c7d"
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   put:
 *     summary: Update transaction
 *     description: Update transaction information
 *     tags:
 *       - Transactions
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
 *               date:
 *                 type: string
 *                 format: date
 *               voucherNo:
 *                 type: string
 *               voucherType:
 *                 type: string
 *                 enum: [Credit, Debit, Journal]
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               details:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     accountId:
 *                       type: string
 *                     type:
 *                       type: string
 *                       enum: [Credit, Debit]
 *                     amount:
 *                       type: number
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     fileName:
 *                       type: string
 *                     fileType:
 *                       type: string
 *                     fileSize:
 *                       type: number
 *                     url:
 *                       type: string
 *               status:
 *                 type: string
 *               checkedBy:
 *                 type: array
 *                 items:
 *                   type: string
 *               approvedBy:
 *                 type: array
 *                 items:
 *                   type: string
 *               props:
 *                 type: object
 *               activityLog:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     userId:
 *                       type: string
 *                     action:
 *                       type: string
 *                     comment:
 *                       type: string
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     summary: Delete transaction
 *     description: Remove a transaction from the system
 *     tags:
 *       - Transactions
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
 *         description: Transaction deleted successfully
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 */

@Controller('/transactions')
export class TransactionController {
  //private transactionService: TransactionService;

  constructor() {
    //this.transactionService = new TransactionService();
  }

  @Authenticated()
  @Get()
  async getAllTransactions(req: Request, res: Response): Promise<void> {
    try {
      const transactions = await new TransactionService(req.user?.loggedInCompanyId!).getAllTransactions();

      res.json({
        success: true,
        data: transactions,
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
  async getTransactionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const transaction = await new TransactionService(req.user?.loggedInCompanyId!).getTransactionById(id);

      if (!transaction) {
        res.status(404).json({
          success: false,
          message: 'Transaction not found',
        });
        return;
      }

      res.json({
        success: true,
        data: transaction,
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
  async createTransaction(req: Request, res: Response): Promise<void> {
    try {
      const transactionData = req.body;
      const transaction = await new TransactionService(req.user?.loggedInCompanyId!).createTransaction(transactionData);

      res.status(201).json({
        success: true,
        data: transaction,
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
  async updateTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const transactionData = req.body;
      const transaction = await new TransactionService(req.user?.loggedInCompanyId!).updateTransaction(id, transactionData);

      if (!transaction) {
        res.status(404).json({
          success: false,
          message: 'Transaction not found',
        });
        return;
      }

      res.json({
        success: true,
        data: transaction,
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
  async deleteTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const transaction = await new TransactionService(req.user?.loggedInCompanyId!).deleteTransaction(id);

      if (!transaction) {
        res.status(404).json({
          success: false,
          message: 'Transaction not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Transaction deleted successfully',
        data: transaction,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }
}