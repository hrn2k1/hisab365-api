import 'dotenv/config';

export class Config {
  static readonly PORT = process.env.PORT || 3000;
  static readonly NODE_ENV = process.env.NODE_ENV || 'development';
  static readonly MONGODB_URI = process.env.MONGODB_URI || '';
  static readonly API_PREFIX = process.env.API_PREFIX || '/api';
  static readonly CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
  static readonly CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '';
  static readonly CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';

  static isDevelopment(): boolean {
    return this.NODE_ENV === 'development';
  }

  static isProduction(): boolean {
    return this.NODE_ENV === 'production';
  }
}

export default Config;
