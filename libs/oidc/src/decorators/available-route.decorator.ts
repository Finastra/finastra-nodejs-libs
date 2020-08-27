import { SetMetadata } from '@nestjs/common';

export const isAvailableRouteForMultitenant = (isMultitenant: boolean) =>
  SetMetadata('isMultitenant', isMultitenant);
