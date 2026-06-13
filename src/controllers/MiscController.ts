import { Request, Response } from 'express';
import { Controller, Get } from '../decorators';
import { Setting } from '../models/Setting';

/**
 * @swagger
 * tags:
 *   - name: Misc
 *     description: Miscellaneous utility endpoints
 */
/**
 * @swagger
 * /settings-data:
 *   get:
 *     summary: Get settings data
 *     description: Returns the settings document.
 *     tags:
 *       - Misc
 *     responses:
 *       200:
 *         description: Settings data fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 organizationTypes:
 *                   MASJID: "Mosque"
 *                   MESS: "Mess"
 *                 accountTypes:
 *                   CASH: "Cash Account"
 *                   BANK: "Bank Account"
 *       500:
 *         description: Server error while fetching settings data
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred while fetching settings data"
 */

/**
 * @swagger
 * /organization-types:
 *   get:
 *     summary: Get organization types
 *     description: Returns the organizationTypes mapping from the settings document.
 *     tags:
 *       - Misc
 *     responses:
 *       200:
 *         description: Organization types fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 Masjid: "Mosque"
 *                 Mess: "Mess"
 *                 Building: "Building"
 *       500:
 *         description: Server error while fetching organization types
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred while fetching organization types"
 */

/**
 * @swagger
 * /account-types:
 *   get:
 *     summary: Get account types
 *     description: Returns the accountTypes mapping from the settings document.
 *     tags:
 *       - Misc
 *     responses:
 *       200:
 *         description: Account types fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 CASH: "Cash Account"
 *                 BANK: "Bank Account"
 *       500:
 *         description: Server error while fetching account types
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred while fetching account types"
 */

/**
 * @swagger
 * /voucher-types:
 *   get:
 *     summary: Get voucher types
 *     description: Returns the voucher types mapping from the settings document.
 *     tags:
 *       - Misc
 *     responses:
 *       200:
 *         description: Voucher types fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 CREDIT: "Credit Voucher"
 *                 DEBIT: "Debit Voucher"
 *                 JOURNAL: "Journal Voucher"
 *       500:
 *         description: Server error while fetching voucher types
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred while fetching voucher types"
 */

/**
 * @swagger
 * /voucher-statuses:
 *   get:
 *     summary: Get voucher statuses
 *     description: Returns the voucher statuses mapping from the settings document.
 *     tags:
 *       - Misc
 *     responses:
 *       200:
 *         description: Voucher statuses fetched successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 "DRAFT": "Draft"
 *                 "PENDING_FOR_CHECKING": "Pending for checking"
 *                 "APPROVED": "Approved"
 *       500:
 *         description: Server error while fetching voucher statuses
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred while fetching voucher statuses"
 */

@Controller('')
export class MiscController {
	@Get('/settings-data')
	async getSettingsData(req: Request, res: Response): Promise<void> {
		try {
			const settings = await Setting.findOne({}, { _id: 0 }).lean();

			res.json({
				success: true,
				data: settings,
			});
		} catch (error: any) {
			res.status(500).json({
				success: false,
				message: error?.message || 'An error occurred while fetching settings data',
			});
		}
	}

	@Get('/organization-types')
	async getOrganizationTypes(req: Request, res: Response): Promise<void> {
		try {
			const setting = await Setting.findOne({}, { organizationTypes: 1, _id: 0 }).lean();
			const rawOrganizationTypes = setting?.organizationTypes || {};

			const sortedOrganizationTypes = Object.fromEntries(
				Object.entries(
					rawOrganizationTypes instanceof Map
						? Object.fromEntries(rawOrganizationTypes)
						: rawOrganizationTypes
				).sort(([a], [b]) => a.localeCompare(b))
			);

			res.json({
				success: true,
				data: sortedOrganizationTypes,
			});
		} catch (error: any) {
			res.status(500).json({
				success: false,
				message: error?.message || 'An error occurred while fetching organization types',
			});
		}
	}

	@Get('/account-types')
	async getAccountTypes(req: Request, res: Response): Promise<void> {
		try {
			const setting = await Setting.findOne({}, { accountTypes: 1, _id: 0 }).lean();
			const rawAccountTypes = (setting as any)?.accountTypes || {};

			res.json({
				success: true,
				data: rawAccountTypes,
			});
		} catch (error: any) {
			res.status(500).json({
				success: false,
				message: error?.message || 'An error occurred while fetching account types',
			});
		}
	}

	@Get('/voucher-types')
	async getVoucherTypes(req: Request, res: Response): Promise<void> {
		try {
			const setting = await Setting.findOne({}, { voucherTypes: 1, _id: 0 }).lean();
			const rawVoucherTypes = (setting as any)?.voucherTypes || {};

			res.json({
				success: true,
				data: rawVoucherTypes,
			});
		} catch (error: any) {
			res.status(500).json({
				success: false,
				message: error?.message || 'An error occurred while fetching voucher types',
			});
		}
	}

	@Get('/voucher-statuses')
	async getVoucherStatuses(req: Request, res: Response): Promise<void> {
		try {
			const setting = await Setting.findOne({}, { voucherStatuses: 1, _id: 0 }).lean();
			const rawVoucherStatuses = (setting as any)?.voucherStatuses || {};

			res.json({
				success: true,
				data: rawVoucherStatuses,
			});
		} catch (error: any) {
			res.status(500).json({
				success: false,
				message: error?.message || 'An error occurred while fetching voucher statuses',
			});
		}
	}
}