import { JWTPayload } from './jwt-payload';

declare global {
  namespace Express {
    export interface Request {
      /**
       * JWT payload for authenticated tenant users
       */
      user?: JWTPayload;
      
      /**
       * JWT payload for authenticated admin users
       */
      admin?: {
        id: string;
        email: string;
        role: string;
      };

      /**
       * Tenant schema name
       */
      schemaName?: string;

      /**
       * User's role at the station (for station-specific operations)
       */
      stationRole?: string;
    }
  }
}

// This export is needed to make this a module
export {};