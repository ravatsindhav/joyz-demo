import { OrgUser } from "./org-user.model";

export interface UserRoleError {
    user: OrgUser,
    error: string
}