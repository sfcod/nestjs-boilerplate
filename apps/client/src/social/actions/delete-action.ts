import { Body, Controller, HttpException, HttpStatus, Param, Post, Req } from '@nestjs/common';
import { SocialAuth } from '../service/social-auth';
import { EmptySocialDataException } from '../exception/empty-social-data-exception';
import { UserSocialProvider } from '@libs/orm';
import { Request } from 'express';

@Controller('api-client/socials/delete/:provider')
export class DeleteAction {
    constructor(private readonly socialAuth: SocialAuth) {}

    @Post()
    async invoke(@Body() data, @Param('provider') provider: string, @Req() request: Request): Promise<any> {
        const { hostname, protocol } = request;

        try {
            const code = await this.socialAuth.delete(provider, data);
            const url = `${protocol}://${hostname}/api-client/socials/check-delete/${UserSocialProvider.PROVIDER_FACEBOOK}/${code}`;

            return {
                url,
                confirmation_code: code,
            };
        } catch (e) {
            if (e instanceof EmptySocialDataException) {
                throw new HttpException('Not found', HttpStatus.NOT_FOUND);
            }

            throw e;
        }
    }
}
