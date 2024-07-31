import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const config: CorsOptions = {
    origin: new RegExp(process.env.CORS_ORIGIN),
    exposedHeaders: 'X-Total-Count, X-Page-Count, X-Current-Page, X-Per-Page',
    credentials: true,
};

export default config;
