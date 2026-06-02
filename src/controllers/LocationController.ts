import { Request, Response } from 'express';
import { Controller, Get, Post, Put, Delete, Authenticated } from '../decorators';
import { LocationService } from '../services/LocationService';

/**
 * @swagger
 * tags:
 *   - name: Locations
 *     description: Location hierarchy management (division, district, thana, area)
 */

/**
 * @swagger
 * /locations:
 *   get:
 *     summary: Get all locations
 *     description: Retrieve all locations with optional filtering by type
 *     tags:
 *       - Locations
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [division, district, thana, area]
 *         description: Filter by location type
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: number
 *         description: Filter by parent location ID
 *     responses:
 *       200:
 *         description: Locations retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: 1
 *                   parentId: null
 *                   parentName: null
 *                   type: "division"
 *                   name: "Rajshahi"
 *                 - id: 2
 *                   parentId: null
 *                   parentName: null
 *                   type: "division"
 *                   name: "Dhaka"
 *   post:
 *     summary: Create location
 *     description: Add a new location to the hierarchy
 *     tags:
 *       - Locations
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             id: 100
 *             parentId: 1
 *             type: "district"
 *             name: "New District"
 *     responses:
 *       201:
 *         description: Location created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: 100
 *                 parentId: 1
 *                 type: "district"
 *                 name: "New District"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 */

/**
 * @swagger
 * /locations/divisions:
 *   get:
 *     summary: Get all divisions
 *     description: Retrieve all administrative divisions
 *     tags:
 *       - Locations
 *     responses:
 *       200:
 *         description: Divisions retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: 1
 *                   type: "division"
 *                   name: "Rajshahi"
 *                 - id: 2
 *                   type: "division"
 *                   name: "Dhaka"
 */

/**
 * @swagger
 * /locations/districts/{divisionId}:
 *   get:
 *     summary: Get districts in a division
 *     description: Retrieve all districts under a specific division
 *     tags:
 *       - Locations
 *     parameters:
 *       - in: path
 *         name: divisionId
 *         required: true
 *         schema:
 *           type: number
 *         example: 1
 *     responses:
 *       200:
 *         description: Districts retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: 9
 *                   parentId: 1
 *                   parentName: "Rajshahi"
 *                   type: "district"
 *                   name: "Rajshahi"
 *                 - id: 13
 *                   parentId: 1
 *                   parentName: "Rajshahi"
 *                   type: "district"
 *                   name: "Joypurhat"
 */

/**
 * @swagger
 * /locations/thanas/{districtId}:
 *   get:
 *     summary: Get thanas in a district
 *     description: Retrieve all thanas (sub-districts) under a specific district
 *     tags:
 *       - Locations
 *     parameters:
 *       - in: path
 *         name: districtId
 *         required: true
 *         schema:
 *           type: number
 *         example: 9
 *     responses:
 *       200:
 *         description: Thanas retrieved successfully
 */

/**
 * @swagger
 * /locations/areas/{thanaId}:
 *   get:
 *     summary: Get areas in a thana
 *     description: Retrieve all areas under a specific thana
 *     tags:
 *       - Locations
 *     parameters:
 *       - in: path
 *         name: thanaId
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Areas retrieved successfully
 */

/**
 * @swagger
 * /locations/{id}:
 *   get:
 *     summary: Get location by ID
 *     description: Retrieve a specific location by its ID
 *     tags:
 *       - Locations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         example: 1
 *     responses:
 *       200:
 *         description: Location retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 parentId: null
 *                 type: "division"
 *                 name: "Rajshahi"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   put:
 *     summary: Update location
 *     description: Update location information
 *     tags:
 *       - Locations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Updated Location Name"
 *     responses:
 *       200:
 *         description: Location updated successfully
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     summary: Delete location
 *     description: Remove a location from the hierarchy
 *     tags:
 *       - Locations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Location deleted successfully
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /locations/search:
 *   get:
 *     summary: Search locations by name
 *     description: Find locations matching a search query
 *     tags:
 *       - Locations
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Location name search query
 *         example: "Rajshahi"
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: 1
 *                   parentName: null
 *                   type: "division"
 *                   name: "Rajshahi"
 *                 - id: 9
 *                   parentName: "Rajshahi"
 *                   type: "district"
 *                   name: "Rajshahi"
 */

/**
 * @swagger
 * /locations/children/{parentId}:
 *   get:
 *     summary: Get child locations
 *     description: Retrieve all child locations of a parent location
 *     tags:
 *       - Locations
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: number
 *         example: 1
 *     responses:
 *       200:
 *         description: Child locations retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - id: 9
 *                   parentId: 1
 *                   parentName: "Rajshahi"
 *                   type: "district"
 *                   name: "Rajshahi"
 *                 - id: 10
 *                   parentId: 1
 *                   parentName: "Rajshahi"
 *                   type: "district"
 *                   name: "Natore"
 */

@Controller('/locations')
export class LocationController {
  private locationService: LocationService;

  constructor() {
    this.locationService = new LocationService();
  }

  @Get()
  async getAllLocations(req: Request, res: Response): Promise<void> {
    try {
      const { type, parentId } = req.query;

      let locations;
      if (type) {
        locations = await this.locationService.getLocationsByType(type as any);
      } else if (parentId) {
        locations = await this.locationService.getChildLocations(Number(parentId));
      } else {
        locations = await this.locationService.getAllLocations();
      }

      res.json({
        success: true,
        data: locations,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }
  
  @Get('/search')
  async searchLocations(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Search query is required',
        });
        return;
      }

      const locations = await this.locationService.searchLocations(q);

      res.json({
        success: true,
        data: locations,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }
  
  @Get('/divisions')
  async getDivisions(req: Request, res: Response): Promise<void> {
    try {
      const divisions = await this.locationService.getDivisions();

      res.json({
        success: true,
        data: divisions,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }

  @Get('/districts/:divisionId')
  async getDistrictsByDivision(req: Request, res: Response): Promise<void> {
    try {
      const { divisionId } = req.params;
      const districts = await this.locationService.getDistrictsByDivision(Number(divisionId));

      res.json({
        success: true,
        data: districts,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }

  @Get('/thanas/:districtId')
  async getThanasByDistrict(req: Request, res: Response): Promise<void> {
    try {
      const { districtId } = req.params;
      const thanas = await this.locationService.getThanasByDistrict(Number(districtId));

      res.json({
        success: true,
        data: thanas,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }

  @Get('/areas/:thanaId')
  async getAreasByThana(req: Request, res: Response): Promise<void> {
    try {
      const { thanaId } = req.params;
      const areas = await this.locationService.getAreasByThana(Number(thanaId));

      res.json({
        success: true,
        data: areas,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }

  @Get('/:id')
  async getLocationById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const location = await this.locationService.getLocationById(id);

      if (!location) {
        res.status(404).json({
          success: false,
          message: 'Location not found',
        });
        return;
      }

      res.json({
        success: true,
        data: location,
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
  async createLocation(req: Request, res: Response): Promise<void> {
    try {
      const locationData = req.body;
      const location = await this.locationService.createLocation(locationData);

      res.status(201).json({
        success: true,
        data: location,
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
  async updateLocation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const locationData = req.body;
      const location = await this.locationService.updateLocation(id, locationData);

      if (!location) {
        res.status(404).json({
          success: false,
          message: 'Location not found',
        });
        return;
      }

      res.json({
        success: true,
        data: location,
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
  async deleteLocation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const location = await this.locationService.deleteLocation(id);

      if (!location) {
        res.status(404).json({
          success: false,
          message: 'Location not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Location deleted successfully',
        data: location,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }

  @Get('/children/:parentId')
  async getChildLocations(req: Request, res: Response): Promise<void> {
    try {
      const { parentId } = req.params;
      const locations = await this.locationService.getChildLocations(Number(parentId));

      res.json({
        success: true,
        data: locations,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  }
}
