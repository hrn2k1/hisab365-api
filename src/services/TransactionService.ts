import Transaction, { ITransaction, ITransactionActivityLog, ITransactionDetail } from '../models/Transaction';
import Account, { IAccount } from '../models/Account';
import mongoose, { Model } from 'mongoose';
import { isTransactionSupported } from '../config/database';
import { TransactionDto } from '../types/TransactionDto';
import { SearchTransactionParams } from '../types/SearchTransactionParams';

export class TransactionService {
    private companyId: string;
    private accountModel: Model<IAccount>;
    private transactionModel: Model<ITransaction>;

    constructor(companyId: string) {
        this.companyId = companyId;
        this.accountModel = Account(companyId);
        this.transactionModel = Transaction(companyId);
    }
    /**
     * Update account balances based on transaction details
     * Debit: add to balance, Credit: subtract from balance
     */
    private async updateAccountBalances(session: mongoose.ClientSession | null, details: ITransaction['details'], operation: 'apply' | 'reverse' = 'apply'): Promise<void> {
        for (const detail of details) {
            const query = this.accountModel.findById(detail.accountId);
            if (session) {
                query.session(session);
            }

            const account = await query;
            if (!account) {
                throw new Error(`Account with ID ${detail.accountId} not found`);
            }

            const amount = operation === 'apply' ? detail.amount : -detail.amount;

            if (detail.type === 'Debit') {
                account.currentBalance += amount;
            } else if (detail.type === 'Credit') {
                account.currentBalance -= amount;
            }

            if (session) {
                await account.save({ session });
            } else {
                await account.save();
            }
        }
    }
    private validateTransactionDetails(details: ITransaction['details']): void {
        let totalCredit = 0;
        let totalDebit = 0;

        for (const detail of details) {
            if (detail.type === 'Credit') {
                totalCredit += detail.amount;
            } else if (detail.type === 'Debit') {
                totalDebit += detail.amount;
            }
        }

        if (totalCredit !== totalDebit) {
            throw new Error(`Transaction validation failed: Total credit amount (${totalCredit}) must equal total debit amount (${totalDebit})`);
        }

        if (totalCredit <= 0 || totalDebit <= 0) {
            throw new Error(`Transaction validation failed: Both credit and debit amounts must be greater than zero (Credit: ${totalCredit}, Debit: ${totalDebit})`);
        }
    }

    async searchTransactions(searchParams: SearchTransactionParams): Promise<TransactionDto[]> {
        const matchConditions: Record<string, any> = {};
        if (searchParams.dateFrom || searchParams.dateTo) {
            matchConditions.date = {};
            if (searchParams.dateFrom) {
                matchConditions.date.$gte = searchParams.dateFrom;
            }
            if (searchParams.dateTo) {
                matchConditions.date.$lte = searchParams.dateTo;
            }
        }
        if (searchParams.voucherNo) {
            matchConditions.voucherNo = { $regex: searchParams.voucherNo, $options: 'i' };
        }
        if (searchParams.voucherTypes && searchParams.voucherTypes.length > 0) {
            matchConditions.voucherType = { $in: searchParams.voucherTypes.map(type => new RegExp(type, 'i')) };
        }
        if (searchParams.voucherStatuses && searchParams.voucherStatuses.length > 0) {
            matchConditions.status = { $in: searchParams.voucherStatuses.map(type => new RegExp(type, 'i')) };
        }
        if (searchParams.createdBy) {
            matchConditions.createdBy = { $regex: new RegExp(searchParams.createdBy, 'i') };
        }
        if (searchParams.checkedBy && searchParams.checkedBy.length > 0) {
            matchConditions.checkedBy = { $in: searchParams.checkedBy.map(user => new RegExp(user, 'i')) };
        }
        if (searchParams.approvedBy && searchParams.approvedBy.length > 0) {
            matchConditions.approvedBy = { $in: searchParams.approvedBy.map(user => new RegExp(user, 'i')) };
        }
        return this.transactionModel.aggregate<TransactionDto>([
            { $match: matchConditions },
            { $project: { details: 0, attachments: 0, activityLog: 0, checkedBy: 0, approvedBy: 0 } },
            { $sort: { date: -1 } }
        ]);
    }
    /**
     * Get all transactions
     */
    async getAllTransactions(): Promise<ITransaction[]> {
        return this.transactionModel.find();
    }

    /**
     * Get transaction by ID
     */
    async getTransactionById(id: string): Promise<ITransaction | null> {
        const userFields = 'name email contactNumber photo';
        const accountFields = 'name currentBalance';
        let transaction = await this.transactionModel.findById(id).populate('details.accountId', accountFields)
            .populate('createdBy', userFields).populate('checkedBy', userFields).populate('approvedBy', userFields)
            .populate('activityLog.userId', userFields)
            .lean();

        if (transaction) {
            transaction.details = transaction.details.map(detail => {
                return {
                    ...detail,
                    accountId: detail.accountId._id,
                    account: detail.accountId
                } as unknown as ITransactionDetail;
            });
            transaction.activityLog = transaction.activityLog.map(log => {
                return {
                    ...log,
                    userId: log.userId._id,
                    user: log.userId                   
                } as unknown as ITransactionActivityLog;
            });
        }
        return transaction;
    }

    /**
     * Create a new transaction
     */
    async createTransaction(transactionData: Partial<ITransaction>): Promise<ITransaction> {
        if (!transactionData.details) {
            throw new Error('Transaction details are required');
        }

        this.validateTransactionDetails(transactionData.details);

        const transactionSupported = isTransactionSupported();

        if (transactionSupported) {
            // Use database transactions for atomicity
            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                const transaction = new this.transactionModel(transactionData);
                const savedTransaction = await transaction.save({ session });

                // Update account balances within the same transaction
                await this.updateAccountBalances(session, savedTransaction.details, 'apply');

                // Commit the transaction
                await session.commitTransaction();
                return savedTransaction;
            } catch (error) {
                // Abort the transaction on error
                await session.abortTransaction();
                throw error;
            } finally {
                session.endSession();
            }
        } else {
            // Fallback: Perform operations without transactions
            console.warn('⚠️ Using non-transactional operations. Data consistency not guaranteed.');

            const transaction = new this.transactionModel(transactionData);
            const savedTransaction = await transaction.save();

            try {
                // Update account balances (best effort)
                await this.updateAccountBalances(null, savedTransaction.details, 'apply');
                return savedTransaction;
            } catch (error) {
                // Attempt to clean up by deleting the transaction if balance update fails
                console.error('❌ Balance update failed, attempting cleanup...');
                try {
                    await this.transactionModel.findByIdAndDelete(savedTransaction._id);
                } catch (cleanupError) {
                    console.error('❌ Cleanup failed:', cleanupError);
                }
                throw new Error(`Transaction creation failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    }

    /**
     * Update transaction
     */
    async updateTransaction(id: string, transactionData: Partial<ITransaction>): Promise<ITransaction | null> {
        const transactionSupported = isTransactionSupported();

        if (transactionSupported) {
            // Use database transactions for atomicity
            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                // Get the existing transaction to reverse its effects
                const existingTransaction = await this.transactionModel.findById(id).session(session);
                if (!existingTransaction) {
                    await session.abortTransaction();
                    session.endSession();
                    return null;
                }

                // If details are being updated, validate them
                if (transactionData.details) {
                    this.validateTransactionDetails(transactionData.details);
                }

                // Reverse the old transaction details
                await this.updateAccountBalances(session, existingTransaction.details, 'reverse');

                // Update the transaction
                const updatedTransaction = await this.transactionModel.findByIdAndUpdate(id, transactionData, { new: true, session });

                if (updatedTransaction) {
                    // Apply the new transaction details
                    await this.updateAccountBalances(session, updatedTransaction.details, 'apply');
                }

                // Commit the transaction
                await session.commitTransaction();
                return updatedTransaction;
            } catch (error) {
                // Abort the transaction on error
                await session.abortTransaction();
                throw error;
            } finally {
                session.endSession();
            }
        } else {
            // Fallback: Perform operations without transactions
            console.warn('⚠️ Using non-transactional operations. Data consistency not guaranteed.');

            // Get the existing transaction to reverse its effects
            const existingTransaction = await this.transactionModel.findById(id);
            if (!existingTransaction) {
                return null;
            }

            // If details are being updated, validate them
            if (transactionData.details) {
                this.validateTransactionDetails(transactionData.details);
            }

            try {
                // Reverse the old transaction details
                await this.updateAccountBalances(null, existingTransaction.details, 'reverse');

                // Update the transaction
                const updatedTransaction = await this.transactionModel.findByIdAndUpdate(id, transactionData, { new: true });

                if (updatedTransaction) {
                    // Apply the new transaction details
                    await this.updateAccountBalances(null, updatedTransaction.details, 'apply');
                }

                return updatedTransaction;
            } catch (error) {
                console.error('❌ Transaction update failed, data may be in inconsistent state');
                throw new Error(`Transaction update failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    }

    /**
     * Delete transaction
     */
    async deleteTransaction(id: string): Promise<ITransaction | null> {
        const transactionSupported = isTransactionSupported();

        if (transactionSupported) {
            // Use database transactions for atomicity
            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                const transaction = await this.transactionModel.findById(id).session(session);
                if (!transaction) {
                    await session.abortTransaction();
                    session.endSession();
                    return null;
                }

                // Reverse the transaction details before deleting
                await this.updateAccountBalances(session, transaction.details, 'reverse');

                // Delete the transaction
                const deletedTransaction = await this.transactionModel.findByIdAndDelete(id).session(session);

                // Commit the transaction
                await session.commitTransaction();
                return deletedTransaction as unknown as ITransaction | null;
            } catch (error) {
                // Abort the transaction on error
                await session.abortTransaction();
                throw error;
            } finally {
                session.endSession();
            }
        } else {
            // Fallback: Perform operations without transactions
            console.warn('⚠️ Using non-transactional operations. Data consistency not guaranteed.');

            const transaction = await this.transactionModel.findById(id);
            if (!transaction) {
                return null;
            }

            try {
                // Reverse the transaction details before deleting
                await this.updateAccountBalances(null, transaction.details, 'reverse');

                // Delete the transaction
                return (await this.transactionModel.findByIdAndDelete(id)) as unknown as ITransaction | null;
            } catch (error) {
                console.error('❌ Transaction deletion failed, data may be in inconsistent state');
                throw new Error(`Transaction deletion failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    }
}