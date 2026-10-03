import Transaction, { IBillReference, ITransaction, ITransactionActivityLog, ITransactionAttachment, ITransactionDetail } from '../models/Transaction';
import Account, { IAccount } from '../models/Account';
import mongoose, { ClientSession, Model } from 'mongoose';
import { isTransactionSupported } from '../config/database';
import { TransactionDto } from '../types/TransactionDto';
import { SearchTransactionParams } from '../types/SearchTransactionParams';
import { randomUUID } from 'crypto';
import Bill, { IBill } from '../models/Bill';

export class TransactionService {
    private companyId: string;
    private accountModel: Model<IAccount>;
    private transactionModel: Model<ITransaction>;
    private billModel: Model<IBill>;

    constructor(companyId: string) {
        this.companyId = companyId;
        this.accountModel = Account(companyId);
        this.transactionModel = Transaction(companyId);
        this.billModel = Bill(companyId);
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

            const amount = operation === 'apply' ? (detail.drAmount - detail.crAmount) : -(detail.drAmount - detail.crAmount);
            account.currentBalance += amount;

            if (session) {
                await account.save({ session });
            } else {
                await account.save();
            }
        }
    }

    private validateTransactionDetails(details: ITransaction['details']): number {

        let totalCredit = 0;
        let totalDebit = 0;

        for (const detail of details) {
            totalCredit += detail.crAmount;
            totalDebit += detail.drAmount;
        }

        if (totalCredit !== totalDebit) {
            throw new Error(`Transaction validation failed: Total credit amount (${totalCredit}) must equal total debit amount (${totalDebit})`);
        }

        if (totalCredit <= 0 || totalDebit <= 0) {
            throw new Error(`Transaction validation failed: Both credit and debit amounts must be greater than zero (Credit: ${totalCredit}, Debit: ${totalDebit})`);
        }

        for (const detail of details) {
            if ((!detail.drAmount || detail.drAmount === 0) && (!detail.crAmount || detail.crAmount === 0)) {
                throw new Error(`Transaction detail validation failed: Either debit or credit amount must be greater than zero`);
            }
        }

        return totalCredit;
    }

    async searchTransactions(searchParams: SearchTransactionParams): Promise<TransactionDto[]> {
        const exactCaseInsensitive = (value: string) => new RegExp(`^${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

        const matchConditions: Record<string, any> = {
            status: { $ne: 'DELETED' }  // Exclude deleted transactions
        };
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
            matchConditions.voucherType = { $in: searchParams.voucherTypes.map(type => exactCaseInsensitive(type)) };
        }
        if (searchParams.categories && searchParams.categories.length > 0) {
            matchConditions.category = { $in: searchParams.categories.map(category => exactCaseInsensitive(category)) };
        }

        if (searchParams.voucherStatuses && searchParams.voucherStatuses.length > 0) {
            matchConditions.status = { $in: searchParams.voucherStatuses.map(type => exactCaseInsensitive(type)) };
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
        if (searchParams.props) {
            for (const [key, value] of Object.entries(searchParams.props)) {
                matchConditions[`props.${key}`] = { $regex: new RegExp(value as string, 'i') };
            }
        }
        if (searchParams.accountId) {
            matchConditions['details.accountId'] = searchParams.accountId;
        }
        let projectionFields: any = {
            date: 1,
            voucherType: 1,
            category: 1,
            voucherNo: 1,
            amount: 1,
            props: 1,
            status: 1,
            detailsCount: { $size: '$details' },
            description: 1,
        };

        if (searchParams.searchType === 'memberTransactions') {
            projectionFields = {
                date: 1,
                voucherNo: 1,
                category: 1,
                amount: 1,
                props: 1,
                status: 1,
                membersCount: { $size: '$details' },
                detailsCount: { $size: '$details' },
                description: 1,
                billFor: '$props.BILL_FOR'
            };
        } else if (searchParams.searchType === 'accountTransactions') {
            projectionFields = {
                date: 1,
                voucherNo: 1,
                voucherType: 1,
                category: 1,
                status: 1,
                description: 1,
                account: {
                    $first: {
                        $filter: {
                            input: '$details',
                            as: 'detail',
                            cond: { $eq: ['$$detail.accountId', searchParams.accountId] }
                        }
                    }
                },
                props: 1
            };
            return this.transactionModel.aggregate<TransactionDto>([
                { $match: matchConditions },
                { $project: projectionFields },
                { $sort: { date: 1 } }
            ]);
        }
        return this.transactionModel.aggregate<TransactionDto>([
            { $match: matchConditions },
            { $project: projectionFields },
            { $sort: { date: -1 } }
        ]);
    }

    /**
     * Get all transactions
     */
    async getAllTransactions(): Promise<ITransaction[]> {
        return this.transactionModel.find({ status: { $ne: 'DELETED' } }).sort({ date: -1 });
    }

    async getBills(accountId: string): Promise<any[]> {
        return this.billModel.aggregate<TransactionDto>([
            {
                $lookup: {
                    from: "transactions",
                    localField: "transactionId",
                    foreignField: "_id",
                    as: "transaction"
                }
            },
            {
                $unwind: {
                    path: "$transaction"
                }
            },
            {
                $match: {
                    // "transaction.status": "APPROVED",
                    billAccountId: accountId
                }
            },
            {
                $lookup: {
                    from: "accounts",
                    localField: "billForAccountId",
                    foreignField: "_id",
                    as: "billForAccount"
                }
            },
            {
                $unwind: {
                    path: "$billForAccount"
                }
            },
            {
                $project: {
                    _id: 0,
                    billId: "$_id",
                    billNo: "$transaction.voucherNo",
                    billForAccountId: 1,
                    billFor: "$billForAccount.name",
                    amount: 1
                }
            },
            { $sort: { "transaction.date": 1 } }
        ]);
    }

    /**
     * Get transaction by ID
     */
    async getTransactionById(id: string): Promise<ITransaction | null> {
        const userFields = 'name email contactNumber photo';
        const accountFields = 'name type currentBalance status';
        let transaction = await this.transactionModel.findById(id)
            .populate('transAccountId', accountFields)
            .populate('details.accountId', accountFields)
            .populate('createdBy', userFields)
            // .populate('checkedBy', userFields)
            .populate('approvedBy', userFields)
            .populate('activityLog.userId', userFields)
            .populate('referencedBills.transactionId', 'voucherNo amount')
            .populate('referencedBills.accountId', 'name')
            .lean();

        if (transaction) {
            if (transaction.transAccountId) {
                (transaction as any).transAccount = transaction.transAccountId;
                transaction.transAccountId = (transaction.transAccountId as any)?._id;
            }

            transaction.details = transaction.details.map(detail => {
                return {
                    ...detail,
                    accountId: detail.accountId?._id,
                    account: detail.accountId
                } as unknown as ITransactionDetail;
            });
            transaction.activityLog = transaction.activityLog.map(log => {
                return {
                    ...log,
                    userId: log.userId?._id,
                    user: log.userId
                } as unknown as ITransactionActivityLog;
            });
            if (transaction.referencedBills?.length) {
                transaction.referencedBills = transaction.referencedBills.map(bill => {
                    return {
                        ...bill,
                        transactionId: (bill.transactionId as any)?._id,
                        voucherNo: (bill.transactionId as any)?.voucherNo,
                        billAmount: (bill.transactionId as any)?.amount,
                        accountId: (bill.accountId as any)?._id,
                        accountName: (bill.accountId as any)?.name
                    } as unknown as IBillReference;
                });
            }
        }
        return transaction;
    }

    async handleAccountsBalanceAndBills(transactionId: string, transaction: ITransaction | Partial<ITransaction>, operation: 'create' | 'update' | 'delete', session: ClientSession | null = null): Promise<void> {
        if (transaction.category === "MEMBER_BILL" || transaction.category === "CUSTOMER_BILL" || transaction.category === "SUPPLIER_BILL") {
            if (['update', 'delete'].includes(operation)) {
                await this.billModel.deleteMany({ transactionId: transactionId }).session(session);
            }
            if (['create', 'update'].includes(operation)) {
                (transaction.details || [])
                    .filter(x => x.accountId != transaction.transAccountId)
                    .forEach(async x => {
                        const billData = {
                            transactionId: transactionId,
                            billAccountId: transaction.transAccountId,
                            billForAccountId: x.accountId,
                            amount: x.drAmount + x.crAmount,
                            balance: x.drAmount + x.crAmount,
                            billAdjustments: []
                        };
                        const bill = new this.billModel(billData);
                        await bill.save({ session });
                    });
            }
        }
        else if (transaction.category === "MEMBER_BATCH_BILL") {
            if (['update', 'delete'].includes(operation)) {
                await this.billModel.deleteMany({ transactionId: transactionId }).session(session);
            }
            if (['create', 'update'].includes(operation)) {
                (transaction.details || [])
                    .filter(x => x.accountId != transaction.transAccountId)
                    .forEach(async x => {
                        const billData = {
                            transactionId: transactionId,
                            billAccountId: x.accountId,
                            billForAccountId: transaction.transAccountId,
                            amount: x.drAmount + x.crAmount,
                            balance: x.drAmount + x.crAmount,
                            billAdjustments: []
                        };
                        const bill = new this.billModel(billData);
                        await bill.save({ session });
                    });
            }
        }
        else if (transaction.category === "MEMBER_BILL_RECEIPT" || transaction.category === "CUSTOMER_BILL_RECEIPT" || transaction.category === "SUPPLIER_BILL_PAY") {
            if (['update', 'delete'].includes(operation)) {
                const billsAdjusted = await this.billModel.find({ "billAdjustments.transactionId": transactionId }).session(session);
                for (const bill of (billsAdjusted || [])) {
                    const billAdjustments = (bill.billAdjustments || []).filter(x => x.transactionId !== transactionId);
                    bill.billAdjustments = billAdjustments;
                    const totalAdjustments = billAdjustments.reduce((sum, x) => sum + x.amount || 0, 0)
                    bill.balance = (bill.amount || 0) - totalAdjustments;
                    await this.billModel.findByIdAndUpdate(bill._id, bill, { new: true, session });
                }
            }
            if (['create', 'update'].includes(operation)) {
                const referencedBills = (transaction.referencedBills || []).filter(x => x.amount > 0);
                for (const refBill of referencedBills) {
                    const bill = await this.billModel.findOne({ transactionId: refBill.transactionId, billForAccountId: refBill.accountId });
                    if (bill) {
                        const billAdjustments = bill.billAdjustments || [];
                        billAdjustments.push({
                            transactionId: transactionId,
                            billAccountId: bill.billAccountId,
                            billForAccountId: refBill.accountId,
                            amount: refBill.amount
                        });
                        bill.billAdjustments = billAdjustments;
                        const totalAdjustments = billAdjustments.reduce((sum, x) => sum + x.amount || 0, 0)
                        bill.balance = (bill.amount || 0) - totalAdjustments;
                        await this.billModel.findByIdAndUpdate(bill._id, bill, { new: true, session });
                    }
                }
            }
        }

        // Update account balances within the same transaction
        if (transaction.status == 'APPROVED') {
            await this.updateAccountBalances(session, transaction.details || [], 'apply');
        }

        // await this.updateReferencedBills(session, savedTransaction?.referencedBills || []);
    }

    /**
     * Create a new transaction
     */
    async createTransaction(transactionData: Partial<ITransaction>): Promise<ITransaction> {
        if (!transactionData.details) {
            throw new Error('Transaction details are required');
        }

        transactionData.amount = this.validateTransactionDetails(transactionData.details);

        const transactionSupported = isTransactionSupported();
        let session: ClientSession | null = null;
        let savedTransaction: ITransaction | null = null;
        if (transactionSupported) {
            // Use database transactions for atomicity
            session = await mongoose.startSession();
            session.startTransaction();
        } else {
            console.warn('⚠️ Using non-transactional operations. Data consistency not guaranteed.');
        }
        try {
            const transaction = new this.transactionModel(transactionData);
            savedTransaction = await transaction.save({ session });
            await this.handleAccountsBalanceAndBills(savedTransaction?._id || savedTransaction?.id, transactionData, 'create', session);
            // Commit the transaction
            await session?.commitTransaction();

            return savedTransaction;
        } catch (error) {
            if (transactionSupported && session) {
                // Abort the transaction on error
                await session.abortTransaction();
            } else if (savedTransaction) {
                // Attempt to clean up by deleting the transaction if balance update fails
                console.error('❌ Balance update failed, attempting cleanup...');
                try {
                    await this.transactionModel.findByIdAndDelete(savedTransaction._id);
                } catch (cleanupError) {
                    console.error('❌ Cleanup failed:', cleanupError);
                }
                throw new Error(`Transaction creation failed: ${error instanceof Error ? error.message : String(error)}`);
            }
            throw error;
        } finally {
            session?.endSession();
        }
    }

    /**
     * Update transaction
     */
    async updateTransaction(id: string, transactionData: Partial<ITransaction>): Promise<ITransaction | null> {
        const transactionSupported = isTransactionSupported();
        let session: ClientSession | null = null;
        let updatedTransaction: ITransaction | null = null;
        if (transactionSupported) {
            // Use database transactions for atomicity
            session = await mongoose.startSession();
            session.startTransaction();
        }
        else {
            console.warn('⚠️ Using non-transactional operations. Data consistency not guaranteed.');
        }
        try {
            // Get the existing transaction to reverse its effects
            const existingTransaction = await this.transactionModel.findById(id).session(session);
            if (!existingTransaction) {
                await session?.abortTransaction();
                session?.endSession();
                return null;
            }

            // If details are being updated, validate them
            if (transactionData.details) {
                transactionData.amount = this.validateTransactionDetails(transactionData.details);
            }

            // // Reverse the old transaction details
            // if (transactionData.status == 'APPROVED') {
            //     await this.updateAccountBalances(session, existingTransaction.details, 'reverse');
            // }

            // Update the transaction
            updatedTransaction = await this.transactionModel.findByIdAndUpdate(id, transactionData, { new: true, session });

            await this.handleAccountsBalanceAndBills(id, updatedTransaction || transactionData, 'update', session);

            // Commit the transaction
            await session?.commitTransaction();

            return updatedTransaction;
        } catch (error) {
            // Abort the transaction on error
            await session?.abortTransaction();
            throw error;
        } finally {
            session?.endSession();
        }
    }

    /**
     * Delete transaction
     */
    async deleteTransaction(id: string): Promise<ITransaction | null> {
        const transactionSupported = isTransactionSupported();
        let session: ClientSession | null = null;
        let deletedTransaction: ITransaction | null = null;
        if (transactionSupported) {
            // Use database transactions for atomicity
            session = await mongoose.startSession();
            session.startTransaction();
        }
        try {
            const transaction = await this.transactionModel.findById(id).session(session);
            if (!transaction) {
                await session?.abortTransaction();
                session?.endSession();
                return null;
            }

            await this.handleAccountsBalanceAndBills(id, transaction, 'delete', session);

            deletedTransaction = await this.transactionModel.findByIdAndDelete(id).session(session);

            await session?.commitTransaction();
            return deletedTransaction as unknown as ITransaction | null;
        } catch (error) {
            // Abort the transaction on error
            await session?.abortTransaction();
            throw error;
        } finally {
            session?.endSession();
        }
    }

    async getBillForsOfTransactions(): Promise<string[]> {
        const billFors = await this.transactionModel.aggregate<{ name: string }>([
            { $match: { 'props.BILL_FOR': { $exists: true, $ne: null } } },
            { $group: { _id: '$props.BILL_FOR' } },
            { $project: { _id: 0, name: '$_id' } }
        ]);
        return billFors.map(billFor => billFor.name);
    }

    async sendToCheckTransaction(id: string, sentByUserId: string, comment: string, checkedBy: string[] = []): Promise<ITransaction | null> {
        const transaction = await this.transactionModel.findById(id);
        if (!transaction) {
            throw new Error(`Transaction with ID ${id} not found`);
        }

        const activityLog = transaction.activityLog || [];
        activityLog.push({
            timestamp: new Date(),
            userId: sentByUserId,
            action: 'SENT_FOR_CHECK',
            comment: comment || 'Transaction sent for checking'
        });
        const fieldsToSet: Partial<ITransaction> = {
            status: 'PENDING_FOR_CHECKING',
            checkedBy: checkedBy.length > 0 ? checkedBy : transaction.checkedBy || [],
            activityLog: activityLog,
            updatedAt: new Date()
        };
        return this.transactionModel.findByIdAndUpdate(
            id,
            { $set: fieldsToSet },
            { new: true, runValidators: true }
        );
    }

    async checkTransaction(id: string, checkedByUserId: string, comment: string, approvedBy: string[] = []): Promise<ITransaction | null> {
        const transaction = await this.transactionModel.findById(id);
        if (!transaction) {
            throw new Error(`Transaction with ID ${id} not found`);
        }
        const checkedBy = transaction.checkedBy || [];
        if (!checkedBy.includes(checkedByUserId)) {
            checkedBy.push(checkedByUserId);
        }
        const activityLog = transaction.activityLog || [];
        activityLog.push({
            timestamp: new Date(),
            userId: checkedByUserId,
            action: 'CHECKED',
            comment: comment || 'Transaction checked'
        });
        const fieldsToSet: Partial<ITransaction> = {
            checked: true,
            checkedAt: new Date(),
            status: 'PENDING_FOR_APPROVAL',
            checkedBy: checkedBy,
            approvedBy: approvedBy.length > 0 ? approvedBy : transaction.approvedBy || [],
            activityLog: activityLog,
            updatedAt: new Date()
        };
        return this.transactionModel.findByIdAndUpdate(
            id,
            { $set: fieldsToSet },
            { new: true, runValidators: true }
        );
    }

    async approveTransaction(id: string, approvedByUserId: string, comment: string): Promise<ITransaction | null> {
        const transaction = await this.transactionModel.findById(id);
        if (!transaction) {
            throw new Error(`Transaction with ID ${id} not found`);
        }
        const approvedBy = transaction.approvedBy || [];
        if (!approvedBy.includes(approvedByUserId)) {
            approvedBy.push(approvedByUserId);
        }
        const activityLog = transaction.activityLog || [];
        activityLog.push({
            timestamp: new Date(),
            userId: approvedByUserId,
            action: 'APPROVED',
            comment: comment || 'Transaction approved'
        });
        const fieldsToSet: Partial<ITransaction> = {
            approved: true,
            approvedAt: new Date(),
            status: 'APPROVED',
            approvedBy: approvedBy,
            activityLog: activityLog,
            updatedAt: new Date()
        };
        const updatedTransaction = await this.transactionModel.findByIdAndUpdate(
            id,
            { $set: fieldsToSet },
            { new: true, runValidators: true }
        );
        // if (updatedTransaction)
        //     await this.updateReferencedBills(null, updatedTransaction.referencedBills);
        return updatedTransaction;
    }

    async sendToReviewTransaction(id: string, sentByUserId: string, comment: string): Promise<ITransaction | null> {
        const transaction = await this.transactionModel.findById(id);
        if (!transaction) {
            throw new Error(`Transaction with ID ${id} not found`);
        }

        const activityLog = transaction.activityLog || [];
        activityLog.push({
            timestamp: new Date(),
            userId: sentByUserId,
            action: 'SENT_FOR_REVIEW',
            comment: comment || 'Transaction sent for review'
        });
        const fieldsToSet: Partial<ITransaction> = {
            checked: false,
            checkedAt: undefined,
            approved: false,
            approvedAt: undefined,
            status: 'PENDING_FOR_REVIEW',
            activityLog: activityLog,
            updatedAt: new Date()
        };
        return this.transactionModel.findByIdAndUpdate(
            id,
            { $set: fieldsToSet },
            { new: true, runValidators: true }
        );
    }

    async markTransactionAsDeleted(id: string, deletedByUserId: string, comment: string): Promise<ITransaction | null> {
        const transaction = await this.transactionModel.findById(id);
        if (!transaction) {
            throw new Error(`Transaction with ID ${id} not found`);
        }
        if (transaction.status === 'APPROVED') {
            throw new Error(`Transaction is already approved and cannot be deleted.`);
        }

        const activityLog = transaction.activityLog || [];
        activityLog.push({
            timestamp: new Date(),
            userId: deletedByUserId,
            action: 'DELETED',
            comment: comment || 'Transaction marked as deleted'
        });
        const fieldsToSet: Partial<ITransaction> = {
            status: 'DELETED',
            activityLog: activityLog,
            updatedAt: new Date()
        };
        await this.handleAccountsBalanceAndBills(id, transaction, 'delete');
        return this.transactionModel.findByIdAndUpdate(
            id,
            { $set: fieldsToSet },
            { new: true, runValidators: true }
        );
    }

    async updateTransactionBasicInfo(id: string, updatedBy: string, basicData: Partial<ITransaction>, comment: string): Promise<ITransaction | null> {
        const transaction = await this.transactionModel.findById(id);
        if (!transaction) {
            throw new Error(`Transaction with ID ${id} not found`);
        }
        if (transaction.status === 'APPROVED') {
            throw new Error(`Transaction is already approved and cannot be updated.`);
        }

        const activityLog = transaction.activityLog || [];
        activityLog.push({
            timestamp: new Date(),
            userId: updatedBy,
            action: 'UPDATED',
            comment: comment || 'Basic information updated'
        });
        const fieldsToSet: Partial<ITransaction> = {
            date: new Date(basicData.date!),
            voucherNo: basicData.voucherNo || transaction.voucherNo,
            description: basicData.description,
            checkedBy: basicData.checkedBy,
            approvedBy: basicData.approvedBy,
            activityLog: activityLog,
            updatedAt: new Date()
        };
        return this.transactionModel.findByIdAndUpdate(
            id,
            { $set: fieldsToSet },
            { new: true, runValidators: true }
        );
    }

    async updateTransactionAccountsV2(id: string, updatedBy: string, transAccountId: string, details: ITransactionDetail[], referencedBills: IBillReference[] | null, comment: string): Promise<ITransaction | null> {
        const transaction = await this.transactionModel.findById(id);
        if (!transaction) {
            throw new Error(`Transaction with ID ${id} not found`);
        }
        if (transaction.status === 'APPROVED') {
            throw new Error(`Transaction is already approved and cannot be updated.`);
        }
        const transAmount = this.validateTransactionDetails(details);

        const activityLog = transaction.activityLog || [];
        activityLog.push({
            timestamp: new Date(),
            userId: updatedBy,
            action: 'UPDATED',
            comment: comment || 'Transaction accounts updated'
        });
        const fieldsToSet: Partial<ITransaction> = {
            amount: transAmount,
            transAccountId: transAccountId,
            details: details,
            activityLog: activityLog,
            updatedAt: new Date()
        };
        if (referencedBills) {
            fieldsToSet.referencedBills = referencedBills;
        }
        const updatedTransaction = await this.transactionModel.findByIdAndUpdate(
            id,
            { $set: fieldsToSet },
            { new: true, runValidators: true }
        );
        await this.handleAccountsBalanceAndBills(id, updatedTransaction || transaction, 'update');
        return updatedTransaction;
    }

    async updateTransactionAccounts(id: string, updatedBy: string, details: ITransactionDetail[], comment: string): Promise<ITransaction | null> {
        const transaction = await this.transactionModel.findById(id);
        if (!transaction) {
            throw new Error(`Transaction with ID ${id} not found`);
        }
        if (transaction.status === 'APPROVED') {
            throw new Error(`Transaction is already approved and cannot be updated.`);
        }
        const transAmount = this.validateTransactionDetails(details);

        const activityLog = transaction.activityLog || [];
        activityLog.push({
            timestamp: new Date(),
            userId: updatedBy,
            action: 'UPDATED',
            comment: comment || 'Transaction accounts updated'
        });
        const fieldsToSet: Partial<ITransaction> = {
            amount: transAmount,
            details: details,
            activityLog: activityLog,
            updatedAt: new Date()
        };
        const updatedTransaction = await this.transactionModel.findByIdAndUpdate(
            id,
            { $set: fieldsToSet },
            { new: true, runValidators: true }
        );
        await this.handleAccountsBalanceAndBills(id, updatedTransaction || transaction, 'update');
        return updatedTransaction;
    }

    async updateTransactionProps(id: string, updatedBy: string, props: Record<string, any>, comment: string): Promise<ITransaction | null> {
        const transaction = await this.transactionModel.findById(id);
        if (!transaction) {
            throw new Error(`Transaction with ID ${id} not found`);
        }
        if (transaction.status === 'APPROVED') {
            throw new Error(`Transaction is already approved and cannot be updated.`);
        }

        const activityLog = transaction.activityLog || [];
        activityLog.push({
            timestamp: new Date(),
            userId: updatedBy,
            action: 'UPDATED',
            comment: comment || 'Transaction additional information updated'
        });
        const fieldsToSet: Partial<ITransaction> = {
            props: props,
            activityLog: activityLog,
            updatedAt: new Date()
        };
        return this.transactionModel.findByIdAndUpdate(
            id,
            { $set: fieldsToSet },
            { new: true, runValidators: true }
        );
    }

    async addTransactionAttachment(id: string, addedBy: string, attachment: ITransactionAttachment): Promise<ITransaction | null> {
        const transaction = await this.transactionModel.findById(id);
        if (!transaction) {
            throw new Error(`Transaction with ID ${id} not found`);
        }
        if (transaction.status === 'APPROVED') {
            throw new Error(`Transaction is already approved and cannot be updated.`);
        }

        const activityLog = transaction.activityLog || [];
        activityLog.push({
            timestamp: new Date(),
            userId: addedBy,
            action: 'ATTACHMENT_ADDED',
            comment: 'Transaction attachment added'
        });
        const attachments = transaction.attachments || [];
        attachments.push({
            id: attachment.id || randomUUID(),
            fileName: attachment.fileName,
            fileType: attachment.fileType,
            fileSize: attachment.fileSize,
            url: attachment.url
        });
        const fieldsToSet: Partial<ITransaction> = {
            attachments: attachments,
            activityLog: activityLog,
            updatedAt: new Date()
        };
        return this.transactionModel.findByIdAndUpdate(
            id,
            { $set: fieldsToSet },
            { new: true, runValidators: true }
        );
    }

    async removeTransactionAttachment(id: string, removedBy: string, attachmentId: string): Promise<ITransaction | null> {
        const transaction = await this.transactionModel.findById(id);
        if (!transaction) {
            throw new Error(`Transaction with ID ${id} not found`);
        }
        if (transaction.status === 'APPROVED') {
            throw new Error(`Transaction is already approved and cannot be updated.`);
        }

        const activityLog = transaction.activityLog || [];
        activityLog.push({
            timestamp: new Date(),
            userId: removedBy,
            action: 'ATTACHMENT_REMOVED',
            comment: 'Transaction attachment removed'
        });
        const attachments = transaction.attachments || [];
        const attachmentIndex = attachments.findIndex(att => att.id === attachmentId);
        if (attachmentIndex !== -1) {
            attachments.splice(attachmentIndex, 1);
        }
        const fieldsToSet: Partial<ITransaction> = {
            attachments: attachments,
            activityLog: activityLog,
            updatedAt: new Date()
        };
        return this.transactionModel.findByIdAndUpdate(
            id,
            { $set: fieldsToSet },
            { new: true, runValidators: true }
        );
    }

    async getNewVoucherNo(prefix: string): Promise<string> {
        const result = await this.transactionModel.aggregate<TransactionDto>([
            { $project: { _id: 0, voucherNo: 1 } },
            { $match: { voucherNo: { $regex: `^${prefix}` } } },
            { $sort: { voucherNo: -1 } },
            { $limit: 1 }
        ]);
        const maxVoucherNo = result.length > 0 ? result[0].voucherNo : `${prefix}0000`;
        const numericPart = maxVoucherNo.replace(prefix, '');
        const newNumericPart = (parseInt(numericPart, 10) + 1).toString().padStart(numericPart.length, '0');
        return `${prefix}${newNumericPart}`;
    }

    async getAccountTransactionsSummary(accountId: string, nature: number, date: Date, includeDraft?: boolean): Promise<number> {
        const matchConditions: Record<string, any> = {
            status: { $ne: 'DELETED' },  // Exclude deleted transactions
            'details.accountId': accountId,
            date: { $lte: date }
        };
        if (!includeDraft) {
            matchConditions.status.$nin = ['DELETED', 'DRAFT'];
        }

        const result = await this.transactionModel.aggregate<{ _id: null; totalAmount: number }>([
            { $unwind: '$details' },
            { $match: matchConditions },
            {
                $lookup: {
                    from: 'accounts',
                    localField: 'details.accountId',
                    foreignField: '_id',
                    as: 'account'
                }
            },
            { $unwind: '$account' },
            {
                $group: {
                    _id: null,
                    totalAmount: {
                        $sum: {
                            $multiply: [
                                { $subtract: ["$details.drAmount", "$details.crAmount"] },
                                nature
                            ]
                        }
                    }
                }
            }
        ]);
        return result.length > 0 ? result[0].totalAmount : 0;
    }

    async getDueBillsOfAccount(accountId: string): Promise<any[]> {

        const result = await this.billModel.aggregate([
            {
                $lookup: {
                    from: "transactions",
                    localField: "transactionId",
                    foreignField: "_id",
                    as: "transaction"
                }
            },
            {
                $unwind: {
                    path: "$transaction"
                }
            },
            {
                $match: {
                    // "transaction.status": "APPROVED",
                    billAccountId: accountId,
                    balance: { $gt: 0 }
                }
            },
            {
                $lookup: {
                    from: "accounts",
                    localField: "billForAccountId",
                    foreignField: "_id",
                    as: "billForAccount"
                }
            },
            {
                $unwind: {
                    path: "$billForAccount"
                }
            },
            {
                $project: {
                    _id: 0,
                    transactionId: 1,
                    voucherNo: "$transaction.voucherNo",
                    date: "$transaction.date",
                    accountId: "$billForAccountId",
                    accountName: "$billForAccount.name",
                    billAmount: "$amount",
                    dueAmount: "$balance",
                    description: "$transaction.description"
                }
            }
        ]);
        return result;
    }
}