import { Body, Controller, HttpCode, HttpStatus, Post, UseFilters } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { EntityManager, wrap } from '@mikro-orm/core';
import { User, UserStatus } from '@libs/orm';
import { ApiDescription, ClearMissingPropertiesPipe, Mapper, TimeoutExceptionFilter } from '@libs/core';
import { SignUpInput } from '../../dto/input/sign-up-input';
import { UserOutput } from '@app/admin/common/dto/user-output';
import { hash } from 'bcrypt';

@ApiTags('Auth')
@Controller('api-client/auths/signup')
export class SignUpAction {
    constructor(
        private readonly em: EntityManager,
        private readonly mapper: Mapper,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiDescription({ summary: 'Sign up user' })
    @ApiCreatedResponse({ type: UserOutput })
    @ApiBadRequestResponse()
    @UseFilters(new TimeoutExceptionFilter())
    async invoke(
        @Body(new ClearMissingPropertiesPipe())
        { password, ...data }: SignUpInput,
    ) {
        const user = this.em.create(User, data);

        const hashedPassword = await hash(password, 10);
        user.password = hashedPassword;
        user.status = UserStatus.STATUS_PENDING_EMAIL_VERIFICATION;

        wrap(user).assign(data);

        this.em.persist(user);
        await this.em.flush();

        return this.mapper.map(UserOutput, user);
    }
}
