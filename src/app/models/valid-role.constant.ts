import { Role } from "./role.enum";

export const RoleHierarchy: { [key: string]: string[] } = {
    // Root can have only Admins reporting to it
    [Role.Root]: [Role.Admin],

    // Admin can have only Managers reporting to it
    [Role.Admin]: [Role.Manager],

    // Manager can have other Managers or Callers
    [Role.Manager]: [Role.Manager, Role.Caller],

    // Callers cannot have anyone reporting to them
    [Role.Caller]: []
}
