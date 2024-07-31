import {
    // AmazonWebServicesS3Storage,
    DateTimeDirectoryNaming,
    LocalFileSystemStorage,
    UniqueFileNamer,
} from '@libs/file-storage';
import { join } from 'path';
import { path as appRoot } from 'app-root-path';
import { User } from '@libs/orm';

export default {
    isGlobal: true,
    mapping: {
        private_media: {
            driver: process.env.PRIVATE_DRIVER || 'local',
            prefix: process.env.PRIVATE_DRIVER_PREFIX || '',
            directoryNamer: DateTimeDirectoryNaming,
            fileNamer: UniqueFileNamer,
            options: {
                signed: process.env.PRIVATE_DRIVER === 's3',
                expiry: 86400,
            },
        },
    },
    entities: [User],
    disks: [
        {
            driver: LocalFileSystemStorage,
            driverName: 'local',
            config: {
                root: join(appRoot, '/storage/'),
                host: `${process.env.API_URL}`,
            },
        },
        /*{
            driver: AmazonWebServicesS3Storage,
            driverName: 's3',
            config: {
                key: process.env.AWS_S3_KEY,
                secret: process.env.AWS_S3_SECRET,
                bucket: process.env.AWS_S3_BUCKET,
                region: process.env.AWS_S3_REGION,
                signatureVersion: 'v4',
                useAccelerateEndpoint: process.env.AWS_S3_USE_ACCELERATE_ENDPOINT === 'true',
            },
        },*/
    ],
};
