import { AdminRole, UserRole } from '@libs/orm';
import { StrategyType } from '../contract/strategy.type';

export const resolveStrategyType = (roles: string[]): StrategyType => {
    if (roles.some((r) => UserRole.getValues().includes(r))) {
        return 'user';
    }
    if (roles.some((r) => AdminRole.getValues().includes(r))) {
        return 'admin';
    }
    throw new Error('Can not resolve strategy type');
};

export const matchRoles = (acceptableRoles: string[], userRoles: string[]): boolean => {
    const intersect = userRoles.filter((role: string) => acceptableRoles.includes(role));

    return intersect.length > 0;
};
