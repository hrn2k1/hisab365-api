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

@Controller('')
export class MiscController {
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
}