import { Injectable } from '@angular/core';
import { default as numWords } from 'num-words';
import { Role } from '../models/role.enum';
import { RoleHierarchy } from '../models/valid-role.constant';
import { OrgUser } from '../models/org-user.model';
import { UserRoleError } from '../models/roles-error.model';

@Injectable({
  providedIn: 'root'
})
export class OrgHierarchyValidatorService {

  constructor() { }

  validateHierarchy(data: OrgUser[]): UserRoleError[] {
    const errors: UserRoleError[] = [];
    const hierarchyMap = new Map<string, OrgUser>();

    const getErrorTitle = (user?: OrgUser) => `Row ${user?.RowId} (${user?.Email}): ${user?.FullName} is a ${user?.Role}`;

    // Populate the hierarchy map
    for (let user of data) {
      hierarchyMap.set(user.Email, user);
    }

    // Validation rules
    for (let user of data) {
      if (user.ReportsTo) {
        const reportsToMails = user.ReportsTo.split(';').map((email: string) => email.trim());
        if (reportsToMails.length > 1) {
          const numberToWords = numWords(reportsToMails.length);
          const error = `${getErrorTitle(user)} who reports to ${numberToWords} emails: ${user.ReportsTo}.`;
          errors.push({ user, error });
        } else {
          const manager = hierarchyMap.get(user.ReportsTo);
          const managerRole = manager?.Role;
          const userRole = user.Role;
          if (managerRole && !this.isValidRole(userRole, managerRole)) {
            const error = `${getErrorTitle(user)} but reports to ${managerRole} (${manager?.FullName}).`;
            errors.push({ user, error });
          }
        }
      }
    }

    // Detect cycles
    const cycleUserEmail = this.hasCycle(hierarchyMap);
    if (cycleUserEmail) {
      const user = hierarchyMap.get(cycleUserEmail);
      if (user) {
        const error = `${getErrorTitle(user)} who is in invalidates reporting cycle tree`;
        errors.push({ user, error });
      }
    }

    return errors.sort((a, b) => a.user.RowId - b.user.RowId);
  }

  isValidRole(role: string, managerRole: string): boolean {
    return managerRole && RoleHierarchy[managerRole]?.includes(role) || false;
  }


  hasCycle(hierarchyMap: Map<string, OrgUser>): string | false {
    const visited = new Set<string>();
    const stack = new Set<string>();

    for (const userEmail of hierarchyMap.keys()) {
      if (this.detectCycle(userEmail, hierarchyMap, visited, stack)) {
        return userEmail;
      }
    }
    return false;
  }

  private detectCycle(userEmail: string, hierarchyMap: Map<string, OrgUser>, visited: Set<string>, stack: Set<string>): boolean {
    if (stack.has(userEmail)) return true; // Cycle detected
    if (visited.has(userEmail)) return false; // Already checked

    visited.add(userEmail);
    stack.add(userEmail);

    const manager = hierarchyMap.get(userEmail)?.ReportsTo;
    if (manager && this.detectCycle(manager, hierarchyMap, visited, stack)) {
      return true;
    }

    stack.delete(userEmail); // Backtrack
    return false;
  }

}
