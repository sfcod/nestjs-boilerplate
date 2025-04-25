import configs from './mikro-orms.config';

const CONNECTION = process.env.CONNECTION || 'default';

if (!CONNECTION) {
    throw new Error('You must specify CONNECTION env var');
}

const contextName = `${CONNECTION}`;
const config = configs.find((config) => config.contextName === contextName);

if (!config) {
    throw new Error(`MikroOrm config with connection ${CONNECTION} not found`);
}
export default config;
