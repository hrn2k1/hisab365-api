import { Request, Response } from 'express';
import { Controller, Get, Post, Put, Delete, Authenticated, Patch, Use } from '../decorators';
import { TransactionService } from '../services/TransactionService';
import { SearchTransactionParams } from '../types/SearchTransactionParams';
import { ITransactionDetail } from '../models/Transaction';
import { singleFileUpload } from '../middlewares/uploadMiddleware';
import CloudinaryService from '../services/storage/CloudinaryService';
import { randomUUID } from 'crypto';

/**
 * @swagger
 * tags:
 *   - name: Transactions
 *     description: Transaction management endpoints
 */

/**
 * @swagger
 * /transactions/search:
 *   post:
 *     summary: Search transactions with filters
 *     description: Retrieve a list of all transactions
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
 *             properties:
 *               dateFrom:
 *                 type: string
 *                 format: date
 *               dateTo:
 *                 type: string
 *                 format: date
 *               voucherNo:
 *                 type: string
 *               voucherTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *               voucherStatuses:
 *                 type: array
 *                 items:
 *                   type: string
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
 *                       enum: [Cr, Dr]
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
 * /transactions/credit:
 *   post:
 *     summary: Create a new credit transaction
 *     description: Create a new credit transaction in the system
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
 *               - description
 *               - cashOrBankAccountId
 *               - details
 *               - status
 *               - createdBy
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               voucherNo:
 *                 type: string
 *               description:
 *                 type: string
 *               cashOrBankAccountId:
 *                 type: string
 *               details:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     accountId:
 *                       type: string
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
 * /transactions/debit:
 *   post:
 *     summary: Create a new debit transaction
 *     description: Create a new debit transaction in the system
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
 *               - description
 *               - cashOrBankAccountId
 *               - details
 *               - status
 *               - createdBy
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               voucherNo:
 *                 type: string
 *               description:
 *                 type: string
 *               cashOrBankAccountId:
 *                 type: string
 *               details:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     accountId:
 *                       type: string
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
 * /transactions/journal:
 *   post:
 *     summary: Create a new journal transaction
 *     description: Create a new journal transaction in the system
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
 *               - description
 *               - details
 *               - status
 *               - billFor
 *               - dueDate
 *               - createdBy
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               voucherNo:
 *                 type: string
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
 *                       enum: [Cr, Dr]
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
 *               billFor:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
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
 *                 enum: [CREDIT, DEBIT, JOURNAL]
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
 *                       enum: [Cr, Dr]
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

/**
 * @swagger
 * /transactions/billfors:
 *   get:
 *     summary: Get all bill fors of transactions
 *     description: Retrieve a list of all bill fors of transactions
 *     tags:
 *       - Transactions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bill fors retrieved successfully
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
 *                     type: string
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

@Controller('/transactions')
export class TransactionController {
  @Authenticated()
  @Get('/new-voucher-no')
  async getNewVoucherNo(req: Request, res: Response): Promise<void> {
    try {
      const { prefix } = req.query;
      if (typeof prefix !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Prefix query parameter is required',
        });
        return;
      }
      const newVoucherNo = await new TransactionService(req.user?.loggedInCompanyId!).getNewVoucherNo(prefix);
      res.json({
        success: true,
        data: newVoucherNo,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }

  @Authenticated()
  @Post('/search')
  async searchTransactions(req: Request, res: Response): Promise<void> {
    try {
      const searchParams = req.body as SearchTransactionParams;
      const transactions = await new TransactionService(req.user?.loggedInCompanyId!).searchTransactions(searchParams);

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
  @Get()
  async getAllTransactions(req: Request, res: Response): Promise<void> {
    try {
      const { accountId, top } = req.query;
      const loggedInUser = req.user;
      let transactions: any[];
      if (accountId) {
        transactions = await new TransactionService(loggedInUser?.loggedInCompanyId!).searchTransactions({
          searchType: 'accountTransactions',
          accountId: accountId as string,
          top: top ? parseInt(top as string, 100) : undefined,
        });
      } else {
        transactions = await new TransactionService(loggedInUser?.loggedInCompanyId!).getAllTransactions();
      }
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
  @Get('/billFors')
  async getAllBillFors(req: Request, res: Response): Promise<void> {
    try {
      const billFors = await new TransactionService(req.user?.loggedInCompanyId!).getBillForsOfTransactions();

      res.json({
        success: true,
        data: billFors,
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
  @Post('/credit')
  async createCreditTransaction(req: Request, res: Response): Promise<void> {
    try {
      const creditTransactionData = req.body;
      const amount = creditTransactionData.details.reduce((sum: number, detail: ITransactionDetail) => sum + detail.amount, 0);
      if (amount === 0) {
        res.status(400).json({
          success: false,
          message: 'Voucher amount must be greater than zero.',
        });
        return;
      }
      const details: ITransactionDetail[] = creditTransactionData.details.map((detail: any) => ({
        accountId: detail.accountId,
        type: "Cr",
        amount: detail.amount,
      }));

      const transactionData = {
        date: creditTransactionData.date,
        voucherNo: creditTransactionData.voucherNo,
        voucherType: 'CREDIT',
        amount: amount,
        description: creditTransactionData.description,
        details: details,
        attachments: creditTransactionData.attachments || [],
        status: creditTransactionData.status || 'DRAFT',
        createdBy: creditTransactionData.createdBy || req.user?.userId,
        checkedBy: creditTransactionData.checkedBy || [],
        approvedBy: creditTransactionData.approvedBy || [],
        props: creditTransactionData.props || {},
        activityLog: [{
          timestamp: new Date(),
          userId: creditTransactionData.createdBy || req.user?.userId,
          action: 'CREATED',
          comment: 'Transaction created',
        }],
      }
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
  @Post('/debit')
  async createDebitTransaction(req: Request, res: Response): Promise<void> {
    try {
      const debitTransactionData = req.body;
      const amount = debitTransactionData.details.reduce((sum: number, detail: ITransactionDetail) => sum + detail.amount, 0);
      if (amount === 0) {
        res.status(400).json({
          success: false,
          message: 'Voucher amount must be greater than zero.',
        });
        return;
      }
      const details: ITransactionDetail[] = debitTransactionData.details.map((detail: any) => ({
        accountId: detail.accountId,
        type: "Dr",
        amount: detail.amount,
      }));

      const transactionData = {
        date: debitTransactionData.date,
        voucherNo: debitTransactionData.voucherNo,
        voucherType: 'DEBIT',
        amount: amount,
        description: debitTransactionData.description,
        details: details,
        attachments: debitTransactionData.attachments || [],
        status: debitTransactionData.status || 'DRAFT',
        createdBy: debitTransactionData.createdBy || req.user?.userId,
        checkedBy: debitTransactionData.checkedBy || [],
        approvedBy: debitTransactionData.approvedBy || [],
        props: debitTransactionData.props || {},
        activityLog: [{
          timestamp: new Date(),
          userId: debitTransactionData.createdBy || req.user?.userId,
          action: 'CREATED',
          comment: 'Transaction created',
        }],
      }
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
  @Post('/journal')
  async createJournalTransaction(req: Request, res: Response): Promise<void> {
    try {
      const journalTransactionData = req.body;
      const totalAmount = journalTransactionData.details.reduce((sum: number, detail: ITransactionDetail) => sum + detail.amount, 0);
      if (totalAmount === 0) {
        res.status(400).json({
          success: false,
          message: 'Voucher amount must be greater than zero.',
        });
        return;
      }
      const details: ITransactionDetail[] = journalTransactionData.details.map((detail: any) => ({
        accountId: detail.accountId,
        type: detail.type,
        amount: detail.amount,
      }));

      const props = journalTransactionData.props || {};
      if (journalTransactionData.billFor) {
        props['BILL_FOR'] = journalTransactionData.billFor;
      }
      if (journalTransactionData.dueDate) {
        props['DUE_DATE'] = journalTransactionData.dueDate;
      }

      const transactionData = {
        date: journalTransactionData.date,
        voucherNo: journalTransactionData.voucherNo,
        voucherType: 'JOURNAL',
        amount: totalAmount,
        description: journalTransactionData.description,
        details: details,
        attachments: journalTransactionData.attachments || [],
        status: journalTransactionData.status || 'DRAFT',
        createdBy: journalTransactionData.createdBy || req.user?.userId,
        checkedBy: journalTransactionData.checkedBy || [],
        approvedBy: journalTransactionData.approvedBy || [],
        props: props,
        activityLog: [{
          timestamp: new Date(),
          userId: journalTransactionData.createdBy || req.user?.userId,
          action: 'CREATED',
          comment: 'Transaction created',
        }],
      }
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
      const { hard } = req.query;
      const { comment } = req.body;
      const transaction = hard === 'true' || hard === '1'
        ? await new TransactionService(req.user?.loggedInCompanyId!).deleteTransaction(id)
        : await new TransactionService(req.user?.loggedInCompanyId!).markTransactionAsDeleted(id, req.user?.userId!, comment);

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

  @Authenticated()
  @Patch('/:id/sent-to-check')
  async sendToCheckTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { sentByUserId, comment, checkedBy } = req.body;
      const loggedInUser = req.user;
      const transaction = await new TransactionService(loggedInUser?.loggedInCompanyId!).sendToCheckTransaction(id, sentByUserId || loggedInUser?.userId, comment, checkedBy);

      if (!transaction) {
        res.status(404).json({
          success: false,
          message: 'Transaction not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Transaction sent for checking successfully',
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
  @Patch('/:id/checked')
  async checkTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { checkedByUserId, comment, approvedBy } = req.body;
      const loggedInUser = req.user;
      const transaction = await new TransactionService(loggedInUser?.loggedInCompanyId!).checkTransaction(id, checkedByUserId || loggedInUser?.userId, comment, approvedBy);

      if (!transaction) {
        res.status(404).json({
          success: false,
          message: 'Transaction not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Transaction checked successfully',
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
  @Patch('/:id/approved')
  async approveTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { approvedByUserId, comment } = req.body;
      const loggedInUser = req.user;
      const transaction = await new TransactionService(loggedInUser?.loggedInCompanyId!).approveTransaction(id, approvedByUserId || loggedInUser?.userId, comment);

      if (!transaction) {
        res.status(404).json({
          success: false,
          message: 'Transaction not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Transaction approved successfully',
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
  @Patch('/:id/sent-to-review')
  async sendToReviewTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { sentByUserId, comment } = req.body;
      const loggedInUser = req.user;
      const transaction = await new TransactionService(loggedInUser?.loggedInCompanyId!).sendToReviewTransaction(id, sentByUserId || loggedInUser?.userId, comment);

      if (!transaction) {
        res.status(404).json({
          success: false,
          message: 'Transaction not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Transaction sent for review successfully',
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
  @Patch('/:id/basic-info')
  async updateTransactionBasicInfo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { date, voucherNo, description, checkedBy, approvedBy, comment } = req.body;
      const basicData = { date, voucherNo, description, checkedBy, approvedBy };
      const loggedInUser = req.user;
      const transaction = await new TransactionService(loggedInUser?.loggedInCompanyId!).updateTransactionBasicInfo(id, loggedInUser?.userId!, basicData, comment);

      if (!transaction) {
        res.status(404).json({
          success: false,
          message: 'Transaction not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Transaction basic information updated successfully',
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
  @Patch('/:id/accounts')
  async updateTransactionAccounts(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { details, comment } = req.body;
      const loggedInUser = req.user;
      const transaction = await new TransactionService(loggedInUser?.loggedInCompanyId!).updateTransactionAccounts(id, loggedInUser?.userId!, details, comment);

      if (!transaction) {
        res.status(404).json({
          success: false,
          message: 'Transaction not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Transaction accounts updated successfully',
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
  @Patch('/:id/additional-info')
  async updateTransactionProps(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { props, comment } = req.body;
      const loggedInUser = req.user;
      const transaction = await new TransactionService(loggedInUser?.loggedInCompanyId!).updateTransactionProps(id, loggedInUser?.userId!, props, comment);

      if (!transaction) {
        res.status(404).json({
          success: false,
          message: 'Transaction not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Transaction additional information updated successfully',
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
  @Post('/:id/attachments')
  @Use(singleFileUpload)
  async AddAttachment(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file provided. Use multipart/form-data with field name "file".',
        });
        return;
      }
      const { id } = req.params;
      const isImage = req.file.mimetype.startsWith('image/');
      const attachmentId = randomUUID();
      const publicId = `${id}_${attachmentId}`;

      const uploadOptions = {
        folder: `hisab365/transactions/${id}`,
        public_id: publicId,
      };

      const cloudinaryService = new CloudinaryService();

      const result = isImage
        ? await cloudinaryService.uploadImage(req.file.buffer, uploadOptions)
        : await cloudinaryService.uploadFile(req.file.buffer, {
          ...uploadOptions,
          resource_type: 'raw',
        });

      await new TransactionService(req.user?.loggedInCompanyId!).addTransactionAttachment(id, req.user?.userId!, {
        id: attachmentId,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        url: result.url,
      });
      res.status(201).json({
        success: true,
        data: {
          ...result,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          transactionId: id,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to upload file',
      });
    }
  }

  @Authenticated()
  @Delete('/:id/attachments/:attachmentId')
  async RemoveAttachment(req: Request, res: Response): Promise<void> {
    try {
      const { id, attachmentId } = req.params;
      const publicId = `${id}_${attachmentId}`;
      const cloudinaryService = new CloudinaryService();
      await cloudinaryService.deleteFile(publicId);
      await new TransactionService(req.user?.loggedInCompanyId!).removeTransactionAttachment(id, req.user?.userId!, attachmentId);
      res.json({
        success: true,
        message: 'Attachment removed successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to remove file',
      });
    }
  }
}