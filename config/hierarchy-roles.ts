import { AdminRole } from '@libs/orm';
import * as rbac from '@rbac/rbac';
import { UserRole } from '@libs/orm';

const configuredRBAC = rbac({
    enabledLogger: process.env.NODE_ENV === 'development',
});

const hierarchyRolesConfig = {
    // Admin roles
    [AdminRole.ROLE_SYSTEM_ADMIN]: {
        can: [AdminRole.ROLE_SYSTEM_ADMIN],
    },

    // User roles
    [UserRole.ROLE_USER]: {
        can: [UserRole.ROLE_USER],
    },
};

export const hierarchyRoles = configuredRBAC(hierarchyRolesConfig);
