import { Request, Response } from 'express';
import { Authenticated, Controller, Get, Post, Use } from '../decorators';
import { singleFileUpload } from '../middlewares/uploadMiddleware';
import CloudinaryService, {
  CloudinaryDeliveryType,
  CloudinaryResourceType,
} from '../services/storage/CloudinaryService';

/**
 * @swagger
 * tags:
 *   - name: Storage
 *     description: File and media storage endpoints
 */

/**
 * @swagger
 * /storage/upload:
 *   post:
 *     summary: Upload file to cloud storage
 *     description: Upload a single file/image to Cloudinary.
 *     tags:
 *       - Storage
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               folder:
 *                 type: string
 *                 example: hisab365/uploads
 *               publicId:
 *                 type: string
 *                 example: profile-user-123
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *       400:
 *         description: Invalid file or upload failed
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /storage/view/{folder}/{publicId}:
 *   get:
 *     summary: View file from cloud storage
 *     description: Redirects to Cloudinary URL for the requested resource.
 *     tags:
 *       - Storage
 *     parameters:
 *       - in: path
 *         name: folder
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: resourceType
 *         required: false
 *         schema:
 *           type: string
 *           enum: [image, video, raw]
 *           default: auto
 *       - in: query
 *         name: deliveryType
 *         required: false
 *         schema:
 *           type: string
 *           enum: [upload, private, authenticated]
 *           default: upload
 *     responses:
 *       200:
 *         description: File streamed through the API
 *       400:
 *         description: Invalid request parameters
 *       404:
 *         description: File not found
 */
@Controller('/storage')
export class StorageController {
  @Get('/view/:folder/:publicId')
  async viewFile(req: Request, res: Response): Promise<void> {
    try {
      const folder = (req.params.folder || req.query.folder) as string;
      const publicId = (req.params.publicId || req.query.publicId) as string;
      const resourceType = req.query.resourceType as CloudinaryResourceType | undefined;
      const deliveryType = (req.query.deliveryType as CloudinaryDeliveryType | undefined) || 'upload';

      if (!folder || !publicId) {
        res.status(400).json({
          success: false,
          message: 'folder and publicId are required',
        });
        return;
      }

      if (resourceType && !['image', 'video', 'raw'].includes(resourceType)) {
        res.status(400).json({
          success: false,
          message: 'resourceType must be one of: image, video, raw',
        });
        return;
      }

      if (!['upload', 'private', 'authenticated'].includes(deliveryType)) {
        res.status(400).json({
          success: false,
          message: 'deliveryType must be one of: upload, private, authenticated',
        });
        return;
      }

      const cloudinaryService = new CloudinaryService();
      const resourceTypesToTry: CloudinaryResourceType[] = resourceType
        ? [resourceType]
        : ['image', 'raw', 'video'];

      const resolvedAsset = await cloudinaryService.resolveAsset(
        folder,
        publicId,
        resourceTypesToTry,
        deliveryType
      );

      let cloudinaryResponse: globalThis.Response | null = null;
      cloudinaryResponse = await fetch(resolvedAsset.secureUrl);

      // Fallback for restricted assets that require signed delivery.
      if (cloudinaryResponse.status === 401 || cloudinaryResponse.status === 403) {
        const signedUrl = cloudinaryService.getDeliveryUrl(
          folder,
          publicId,
          resolvedAsset.resourceType,
          deliveryType,
          true
        );
        cloudinaryResponse = await fetch(signedUrl);
      }

      if (!cloudinaryResponse) {
        res.status(400).json({
          success: false,
          message: 'Failed to fetch file from cloud storage',
        });
        return;
      }

      if (!cloudinaryResponse.ok) {
        const status =
          cloudinaryResponse.status === 404
            ? 404
            : cloudinaryResponse.status === 401 || cloudinaryResponse.status === 403
              ? cloudinaryResponse.status
              : 502;
        res.status(status).json({
          success: false,
          message:
            status === 404
              ? 'File not found'
              : status === 401 || status === 403
                ? 'Cloudinary denied access to this file'
                : 'Failed to fetch file from cloud storage',
        });
        return;
      }

      const contentType = cloudinaryResponse.headers.get('content-type');
      const contentLength = cloudinaryResponse.headers.get('content-length');
      const cacheControl = cloudinaryResponse.headers.get('cache-control');

      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }

      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }

      if (cacheControl) {
        res.setHeader('Cache-Control', cacheControl);
      }

      const arrayBuffer = await cloudinaryResponse.arrayBuffer();
      res.status(200).send(Buffer.from(arrayBuffer));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resolve file URL';
      const notFound = message.toLowerCase().includes('not found');

      res.status(notFound ? 404 : 400).json({
        success: false,
        message,
      });
    }
  }

  @Authenticated()
  @Post('/upload')
  @Use(singleFileUpload)
  async uploadFile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file provided. Use multipart/form-data with field name "file".',
        });
        return;
      }

      const folder = req.body?.folder || 'hisab365/uploads';
      const publicId = req.body?.publicId;

      const uploadOptions = {
        folder,
        public_id: publicId,
      };

      const cloudinaryService = new CloudinaryService();

      const isImage = req.file.mimetype.startsWith('image/');
      const result = isImage
        ? await cloudinaryService.uploadImage(req.file.buffer, uploadOptions)
        : await cloudinaryService.uploadFile(req.file.buffer, {
            ...uploadOptions,
            resource_type: 'raw',
          });

      res.status(201).json({
        success: true,
        data: {
          ...result,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to upload file',
      });
    }
  }
}
