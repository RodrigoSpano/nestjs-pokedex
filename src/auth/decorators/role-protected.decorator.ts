import { SetMetadata } from '@nestjs/common';
import { EValidRoles } from '../interfaces';

export const META_ROLES = 'roles';

export const RoleProtected = (...args: EValidRoles[]) =>
  SetMetadata('roles', args);
