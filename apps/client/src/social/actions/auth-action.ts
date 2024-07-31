import { Body, Controller, NotFoundException, Post, UnauthorizedException } from '@nestjs/common';
import { ApiOkResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { SocialAuth } from '../service/social-auth';
import { UserSocialDataInput } from '../dto/user-social-data-input';
import { plainToClass } from 'class-transformer';
import { AuthTokenOutput } from '@libs/security';
import { SignerBuilder } from '@libs/security';
import { UserStatus } from '@libs/orm';

@ApiTags('Social')
@Controller('api-client/socials/auth')
export class SocialAuthAction {
    constructor(
        private readonly socialAuth: SocialAuth,
        private readonly signerBuilder: SignerBuilder,
    ) {}

    @Post()
    @ApiOkResponse({
        schema: { $ref: getSchemaPath(AuthTokenOutput) },
    })
    async invoke(@Body() data: UserSocialDataInput): Promise<any> {
        const user = await this.socialAuth.auth(data);

        if (!user) {
            throw new NotFoundException('User not found.');
        }

        if (user.status === UserStatus.STATUS_INACTIVE) {
            throw new UnauthorizedException('User inactive, please contact with your provider.');
        }

        return plainToClass<AuthTokenOutput, any>(AuthTokenOutput, {
            ...(await (await this.signerBuilder.getSigner()).sign(user)),
        });
    }
}
