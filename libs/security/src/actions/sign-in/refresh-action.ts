import { Body, Controller, Post, Request, Type, UseGuards } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthTokenOutput } from '../../dto/auth-token-output';
import { RefreshTokenInput } from '../../dto/refresh-token-input';
import { SignerBuilder } from '../../service/signer-builder';
import { ApiDescription } from '@libs/core';

export const createRefreshTokenAction = ({
    route,
    roles,
    guards,
}: {
    route: string;
    roles: string[];
    guards: any[];
}): Type<any> => {
    @ApiTags('Auth')
    @Controller(route || 'auths/refresh')
    class RefreshTokenAction {
        constructor(private readonly signerBuilder: SignerBuilder) {}

        @UseGuards(...guards)
        @Post()
        @ApiDescription({
            summary: 'Refresh token',
            roles: roles,
            description: endpointDescription,
        })
        @ApiOkResponse({ type: AuthTokenOutput })
        @ApiUnauthorizedResponse()
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async invoke(@Request() req, @Body() refreshTokenData: RefreshTokenInput): Promise<any> {
            return plainToInstance<AuthTokenOutput, any>(
                AuthTokenOutput,
                await (await this.signerBuilder.getSigner()).sign(req.user),
            );
        }
    }

    return RefreshTokenAction;
};

const endpointDescription = `
<p>
When <i>token</i> expires the new one should be generated and used instead. 
</p>
<p>
Use <i>refreshToken</i> to get a new pair of <i>token</i> and <i>refreshToken</i>.<br/>
</p>
<p>
<i>refreshToken</i> could be used just once.
</p>
`;
