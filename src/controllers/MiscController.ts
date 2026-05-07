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
 *                 Cash: "Cash Account"
 *                 Bank: "Bank Account"
 *                 MobileBanking: "Mobile Banking"
 *       500:
 *         description: Server error while fetching account types
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "An error occurred while fetching account types"
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

			const sortedAccountTypes = Object.fromEntries(
				Object.entries(
					rawAccountTypes instanceof Map
						? Object.fromEntries(rawAccountTypes)
						: rawAccountTypes
				).sort(([a], [b]) => a.localeCompare(b))
			);

			res.json({
				success: true,
				data: sortedAccountTypes,
			});
		} catch (error: any) {
			res.status(500).json({
				success: false,
				message: error?.message || 'An error occurred while fetching account types',
			});
		}
	}
}