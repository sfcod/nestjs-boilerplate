import { existsSync, readFileSync } from 'fs';
import { config, DotenvParseOutput, parse } from 'dotenv';
import configConfig from '../config/config.config';

(() => {
    const nodeEnv = process.env.NODE_ENV;
    let envConfig: DotenvParseOutput = {};
    // Read default .env
    config();
    const files = configConfig.envFilePath;
    files.forEach((file) => {
        // No need read double times
        if (file === '.env') {
            return;
        }
        if (existsSync(file)) {
            envConfig = { ...envConfig, ...parse(readFileSync(file)) };
        }
    });

    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
    process.env.NODE_ENV = nodeEnv ? nodeEnv : process.env.NODE_ENV;
})();
