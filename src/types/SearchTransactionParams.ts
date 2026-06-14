export type SearchTransactionParams = {
    dateFrom?: Date;
    dateTo?: Date;
    voucherNo?: string;
    voucherTypes?: string[];
    voucherStatuses?: string[];
    createdBy?: string;
    checkedBy?: string[];
    approvedBy?: string[];
};