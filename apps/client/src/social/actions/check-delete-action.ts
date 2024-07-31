import { Body, Controller, Get, Param } from '@nestjs/common';
import { SocialAuth } from '../service/social-auth';

@Controller('api-client/socials/check-delete/:socialId')
export class CheckDeleteAction {
    constructor(private readonly socialAuth: SocialAuth) {}

    @Get()
    async invoke(@Body() data, @Param('socialId') socialId: string): Promise<any> {
        const isEmpty = await this.socialAuth.checkDelete(socialId);

        return {
            data_is_empty: isEmpty,
        };
    }
}
