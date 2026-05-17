/**
 * @swagger
 * /custom-fields:
 *   get:
 *     summary: Get all custom fields
 *     tags:
 *       - CustomFields
 *     responses:
 *       200:
 *         description: List of custom fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CustomField'
 *
 *   post:
 *     summary: Create a custom field
 *     tags:
 *       - CustomFields
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CustomField'
 *     responses:
 *       201:
 *         description: Custom field created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CustomField'
 *
 * /custom-fields/{id}:
 *   get:
 *     summary: Get a custom field by ID
 *     tags:
 *       - CustomFields
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Custom field found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CustomField'
 *       404:
 *         description: Custom field not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *
 *   put:
 *     summary: Update a custom field
 *     tags:
 *       - CustomFields
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
 *             $ref: '#/components/schemas/CustomField'
 *     responses:
 *       200:
 *         description: Custom field updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CustomField'
 *       404:
 *         description: Custom field not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *
 *   delete:
 *     summary: Delete a custom field
 *     tags:
 *       - CustomFields
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Custom field deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CustomField'
 *       404:
 *         description: Custom field not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /custom-fields/by-entity/{entity}:
 *   get:
 *     summary: Get custom fields by entity
 *     tags:
 *       - CustomFields
 *     parameters:
 *       - in: path
 *         name: entity
 *         required: true
 *         schema:
 *           type: string
 *           enum: [User, Account, Transaction]
 *         description: The entity type to filter custom fields by
 *     responses:
 *       200:
 *         description: List of custom fields for the entity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CustomField'
 */

import { Request, Response } from 'express';
import { Controller, Get, Post, Put, Delete } from '../decorators';
import { CustomFieldService } from '../services/CustomFieldService';

@Controller('/custom-fields')
export class CustomFieldController {
    private customFieldService: CustomFieldService;

    constructor() {
        this.customFieldService = new CustomFieldService();
    }

    @Get()
    async getAll(req: Request, res: Response): Promise<void> {
        const fields = await this.customFieldService.getAllCustomFields();
        res.json({ success: true, data: fields });
    }

    @Get('/:id')
    async getById(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const field = await this.customFieldService.getCustomFieldById(id);
        if (!field) {
            res.status(404).json({ success: false, message: 'Custom field not found' });
            return;
        }
        res.json({ success: true, data: field });
    }

    @Post()
    async create(req: Request, res: Response): Promise<void> {
        const field = await this.customFieldService.createCustomField(req.body);
        res.status(201).json({ success: true, data: field });
    }

    @Put('/:id')
    async update(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const field = await this.customFieldService.updateCustomField(id, req.body);
        if (!field) {
            res.status(404).json({ success: false, message: 'Custom field not found' });
            return;
        }
        res.json({ success: true, data: field });
    }

    @Delete('/:id')
    async delete(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const field = await this.customFieldService.deleteCustomField(id);
        if (!field) {
            res.status(404).json({ success: false, message: 'Custom field not found' });
            return;
        }
        res.json({ success: true, data: field });
    }

    @Get('/by-entity/:entity')
    async getByEntity(req: Request, res: Response): Promise<void> {
        const { entity } = req.params;
        const fields = await this.customFieldService.getAllCustomFieldsByEntity(entity);
        res.json({ success: true, data: fields });
    }
}
