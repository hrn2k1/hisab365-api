export type TransactionDto = {
    date: Date;
    voucherNo: string;
    voucherType: string;
    amount: number;
    description: string;
    status: string;
    props: Record<string, any>;
    createdAt: Date;
    updatedAt?: Date;
}