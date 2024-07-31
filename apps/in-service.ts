import { INestMicroservice } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';

export class HardServerReload extends Error {}

const client = axios.create({
    baseURL: 'http://169.254.169.254',
    timeout: 2000,
});

export async function inService() {
    let resToken: AxiosResponse;
    let resStatus: AxiosResponse;
    try {
        resToken = await client.put(
            '/latest/api/token',
            {},
            {
                headers: {
                    'X-aws-ec2-metadata-token-ttl-seconds': 21600,
                },
            },
        );
        resStatus = await client.get('/latest/meta-data/autoscaling/target-lifecycle-state', {
            headers: {
                'X-aws-ec2-metadata-token': resToken.data,
            },
        });
        return resStatus;
    } catch (e) {
        // Skip
    }
    return undefined;
}

export async function microserviceInService(app: INestMicroservice) {
    if (process.env.NODE_ENV === 'test') {
        return;
    }
    let isTerminated = false;
    setInterval(async () => {
        const resStatus: AxiosResponse = await inService();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const server = app.server;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const logger = app.logger;
        if (resStatus?.data && resStatus?.data !== 'InService' && isTerminated === false && server.channel) {
            await server?.close();
            // Mark as terminated
            isTerminated = true;

            logger.log('Stopped microservice rmq subscription channel');
        }
        // Force stop microservice. EBS will restart it immediately
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (resStatus?.data && resStatus?.data === 'InService' && isTerminated === true && app.server?.channel) {
            throw new HardServerReload('Server hard stopped. Will be reload automatically');
        }
        // check each 2 seconds
    }, 2000);
}
