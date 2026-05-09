import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from 'cloudinary';
import Config from '../../config/config';

export interface CloudinaryUploadResult {
	publicId: string;
	secureUrl: string;
	url: string;
	format?: string;
	bytes: number;
	width?: number;
	height?: number;
	resourceType: string;
}

export type CloudinaryResourceType = 'image' | 'video' | 'raw';
export type CloudinaryDeliveryType = 'upload' | 'private' | 'authenticated';

export interface CloudinaryResolvedAsset {
	secureUrl: string;
	resourceType: CloudinaryResourceType;
	deliveryType: CloudinaryDeliveryType;
}

export class CloudinaryService {
	private static isConfigured = false;

	constructor() {
		this.configure();
	}

	private configure(): void {
		if (CloudinaryService.isConfigured) {
			return;
		}

		if (
			!Config.CLOUDINARY_CLOUD_NAME ||
			!Config.CLOUDINARY_API_KEY ||
			!Config.CLOUDINARY_API_SECRET
		) {
			throw new Error(
				'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
			);
		}

		cloudinary.config({
			cloud_name: Config.CLOUDINARY_CLOUD_NAME,
			api_key: Config.CLOUDINARY_API_KEY,
			api_secret: Config.CLOUDINARY_API_SECRET,
			secure: true,
		});

		CloudinaryService.isConfigured = true;
	}

	async uploadImage(file: Buffer | string, options: UploadApiOptions = {}): Promise<CloudinaryUploadResult> {
		const uploadOptions: UploadApiOptions = {
			resource_type: 'image',
			...options,
		};

		return this.upload(file, uploadOptions);
	}

	async uploadFile(file: Buffer | string, options: UploadApiOptions = {}): Promise<CloudinaryUploadResult> {
		const uploadOptions: UploadApiOptions = {
			resource_type: options.resource_type ?? 'auto',
			...options,
		};

		return this.upload(file, uploadOptions);
	}

	async deleteFile(publicId: string, resourceType: UploadApiOptions['resource_type'] = 'image'): Promise<void> {
		await cloudinary.uploader.destroy(publicId, {
			resource_type: resourceType,
		});
	}

	private normalizeAssetPath(folder: string, publicId: string): string {
		const normalizedFolder = folder.trim().replace(/^\/+|\/+$/g, '');
		const normalizedPublicId = publicId.trim().replace(/^\/+|\/+$/g, '');

		if (!normalizedFolder || !normalizedPublicId) {
			throw new Error('folder and publicId are required');
		}

		return `${normalizedFolder}/${normalizedPublicId}`;
	}

	async getFileViewUrl(
		folder: string,
		publicId: string,
		resourceType: CloudinaryResourceType = 'image'
	): Promise<string> {
		const fullPublicId = this.normalizeAssetPath(folder, publicId);
		const resource = await cloudinary.api.resource(fullPublicId, {
			resource_type: resourceType,
		});

		return resource.secure_url;
	}

	getDeliveryUrl(
		folder: string,
		publicId: string,
		resourceType: CloudinaryResourceType = 'image',
		deliveryType: CloudinaryDeliveryType = 'upload',
		signUrl = false
	): string {
		const fullPublicId = this.normalizeAssetPath(folder, publicId);

		return cloudinary.url(fullPublicId, {
			resource_type: resourceType,
			type: deliveryType,
			secure: true,
			sign_url: signUrl,
		});
	}

	async resolveAsset(
		folder: string,
		publicId: string,
		resourceTypes: CloudinaryResourceType[],
		deliveryType: CloudinaryDeliveryType = 'upload'
	): Promise<CloudinaryResolvedAsset> {
		const fullPublicId = this.normalizeAssetPath(folder, publicId);

		for (const resourceType of resourceTypes) {
			try {
				const resource = await cloudinary.api.resource(fullPublicId, {
					resource_type: resourceType,
					type: deliveryType,
				});

				if (resource?.secure_url) {
					return {
						secureUrl: resource.secure_url,
						resourceType,
						deliveryType,
					};
				}
			} catch (error: any) {
				const isNotFound =
					error?.http_code === 404 ||
					(error?.message && String(error.message).toLowerCase().includes('not found'));

				if (!isNotFound) {
					throw error;
				}
			}
		}

		throw new Error('File not found');
	}

	private async upload(file: Buffer | string, options: UploadApiOptions): Promise<CloudinaryUploadResult> {
		const result = Buffer.isBuffer(file)
			? await this.uploadBuffer(file, options)
			: await cloudinary.uploader.upload(file, options);

		return this.mapUploadResponse(result);
	}

	private uploadBuffer(buffer: Buffer, options: UploadApiOptions): Promise<UploadApiResponse> {
		return new Promise((resolve, reject) => {
			const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
				if (error) {
					reject(error);
					return;
				}

				if (!result) {
					reject(new Error('Cloudinary upload failed without a result.'));
					return;
				}

				resolve(result);
			});

			stream.end(buffer);
		});
	}

	private mapUploadResponse(result: UploadApiResponse): CloudinaryUploadResult {
		return {
			publicId: result.public_id,
			secureUrl: result.secure_url,
			url: result.url,
			format: result.format,
			bytes: result.bytes,
			width: result.width,
			height: result.height,
			resourceType: result.resource_type,
		};
	}
}

export default CloudinaryService;
