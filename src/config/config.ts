import 'dotenv/config';

export class Config {
  static readonly PORT = process.env.PORT || 3000;
  static readonly NODE_ENV = process.env.NODE_ENV || 'development';
  static readonly MONGODB_URI = process.env.MONGODB_URI || '';
  static readonly API_PREFIX = process.env.API_PREFIX || '/api';

  static isDevelopment(): boolean {
    return this.NODE_ENV === 'development';
  }

  static isProduction(): boolean {
    return this.NODE_ENV === 'production';
  }
}

export default Config;
