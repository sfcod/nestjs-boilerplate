import { Injectable } from '@nestjs/common';
import { User, UserSocial } from '@libs/orm';
import { UserFormattedData } from './user-formatted-data';
import { SocialDeleteData } from './social-delete-data';
import { EmptySocialDataException } from '../exception/empty-social-data-exception';
import { EntityManagerResolver } from '@libs/orm-core';

export interface SocialResolverInterface {
    findUserByProvider: (data: UserFormattedData) => Promise<User | null>;
    authUser: (data: UserFormattedData) => Promise<User>;
    deleteSocialData: (data: SocialDeleteData) => Promise<string>;
    checkDeleteSocialData: (socialId: string) => Promise<boolean>;
}

@Injectable()
export class SocialResolver implements SocialResolverInterface {
    constructor(private readonly em: EntityManagerResolver) {}

    async findUserByProvider(data: UserFormattedData): Promise<User | null> {
        const userSocial = await this.em.getRepository(UserSocial).findOne(
            {
                provider: data.provider,
                socialUserId: data.id,
            },
            { populate: ['user'] },
        );

        if (userSocial) {
            return await userSocial.user.load();
        }

        return null;
    }

    async authUser(data: UserFormattedData): Promise<User | null> {
        const em = this.em.getEntityManager(User).fork();

        const patient = await em.getRepository(User).findOne({ email: data.email });
        if (!patient) {
            return null;
        }

        try {
            const userSocial = new UserSocial(patient);

            userSocial.socialUserId = data.id;
            userSocial.provider = data.provider;

            await em.persistAndFlush(userSocial);

            return patient;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Deletes patient social data.
     *
     * Needed for some social providers.
     * Facebook: https://developers.facebook.com/docs/apps/delete-data/,
     *           https://developers.facebook.com/docs/reference/login/signed-request
     *
     * @param data
     */
    async deleteSocialData(data: SocialDeleteData): Promise<string> {
        const userSocial = await this.em.findOne(UserSocial, {
            socialUserId: data.userId,
        });

        if (!userSocial) {
            throw new EmptySocialDataException();
        }

        await this.em.removeAndFlush(userSocial);
        return userSocial.id;
    }

    /**
     * Finds patient social data. Using it for deletion tracking.
     *
     * Needed for some social providers.
     * Facebook: https://developers.facebook.com/docs/apps/delete-data/,
     *           https://developers.facebook.com/docs/reference/login/signed-request
     *
     * @param socialId
     */
    async checkDeleteSocialData(socialId: string): Promise<boolean> {
        let userSocial;

        try {
            userSocial = await this.em.findOne(UserSocial, { id: socialId });
        } catch (e) {}

        return !userSocial;
    }
}
