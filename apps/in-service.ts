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
