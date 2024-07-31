import { Processor, WorkerHost } from '@nestjs/bullmq';
import { QueueInputType } from '@libs/core';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { EntityManager, MikroORM } from '@mikro-orm/core';
import { UseRequestContext } from '@libs/orm-core';
import { DELETE_USER_DATA_QUEUE } from '@libs/core';

@Processor(DELETE_USER_DATA_QUEUE, {
    concurrency: 2,
    limiter: {
        max: 2,
        duration: 1000,
    },
})
@Injectable()
export class DeleteUserDataProcessor extends WorkerHost {
    constructor(
        private readonly orm: MikroORM,
        private readonly em: EntityManager,
    ) {
        super();
    }

    @UseRequestContext()
    async process(job: Job<QueueInputType<typeof DELETE_USER_DATA_QUEUE>>) {
        // do something with users data here (e.g. clear some data from db)
        console.log('DeletePatientDataProcessor', job.data);
    }
}
