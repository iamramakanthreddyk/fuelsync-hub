import { withTransaction, executeQuery } from './db.service';
import { v4 as uuidv4 } from 'uuid';

interface UserStationAssignment {
  id: string;
  user_id: string;
  station_id: string;
  role: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface StationUser {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  assignment_id: string;
  assignment_role: string;
  active: boolean;
}

export const assignUserToStation = async (
  schemaName: string,
  userId: string,
  stationId: string,
  role: string
): Promise<UserStationAssignment> => {
  return withTransaction(schemaName, async (client) => {
    // Check if user exists
    const userResult = await client.query(
      `SELECT id FROM users WHERE id = $1`,
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }
    
    // Check if station exists
    const stationResult = await client.query(
      `SELECT id FROM stations WHERE id = $1`,
      [stationId]
    );
    
    if (stationResult.rows.length === 0) {
      throw new Error('Station not found');
    }
    
    // Check if assignment already exists
    const existingResult = await client.query(
      `SELECT id FROM user_stations WHERE user_id = $1 AND station_id = $2`,
      [userId, stationId]
    );
    
    if (existingResult.rows.length > 0) {
      // Update existing assignment
      const result = await client.query(
        `UPDATE user_stations
         SET role = $1, active = true, updated_at = NOW()
         WHERE user_id = $2 AND station_id = $3
         RETURNING *`,
        [role, userId, stationId]
      );
      
      return result.rows[0];
    } else {
      // Create new assignment
      const id = uuidv4();
      
      const result = await client.query(
        `INSERT INTO user_stations (id, user_id, station_id, role)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [id, userId, stationId, role]
      );
      
      return result.rows[0];
    }
  });
};

export const removeUserFromStation = async (
  schemaName: string,
  userId: string,
  stationId: string
): Promise<boolean> => {
  return withTransaction(schemaName, async (client) => {
    const result = await client.query(
      `UPDATE user_stations
       SET active = false, updated_at = NOW()
       WHERE user_id = $1 AND station_id = $2 AND active = true
       RETURNING id`,
      [userId, stationId]
    );
    
    return result.rows.length > 0;
  });
};

export const updateUserStationRole = async (
  schemaName: string,
  userId: string,
  stationId: string,
  role: string
): Promise<UserStationAssignment | null> => {
  return withTransaction(schemaName, async (client) => {
    const result = await client.query(
      `UPDATE user_stations
       SET role = $1, updated_at = NOW()
       WHERE user_id = $2 AND station_id = $3 AND active = true
       RETURNING *`,
      [role, userId, stationId]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  });
};

export const getUserStationAssignment = async (
  schemaName: string,
  userId: string,
  stationId: string
): Promise<UserStationAssignment | null> => {
  const query = `
    SELECT us.*
    FROM user_stations us
    WHERE us.user_id = $1 AND us.station_id = $2 AND us.active = true
  `;
  
  const result = await executeQuery(schemaName, query, [userId, stationId]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

export const getUserStationAssignments = async (
  schemaName: string,
  userId: string
): Promise<Array<UserStationAssignment & { station_name: string }>> => {
  const query = `
    SELECT us.*, s.name as station_name
    FROM user_stations us
    JOIN stations s ON us.station_id = s.id
    WHERE us.user_id = $1 AND us.active = true
    ORDER BY s.name
  `;
  
  const result = await executeQuery(schemaName, query, [userId]);
  return result.rows;
};

export const getStationUsers = async (
  schemaName: string,
  stationId: string
): Promise<StationUser[]> => {
  const query = `
    SELECT 
      u.id as user_id,
      u.email,
      u.first_name,
      u.last_name,
      u.role,
      us.id as assignment_id,
      us.role as assignment_role,
      us.active
    FROM user_stations us
    JOIN users u ON us.user_id = u.id
    WHERE us.station_id = $1 AND us.active = true
    ORDER BY 
      CASE us.role
        WHEN 'owner' THEN 1
        WHEN 'manager' THEN 2
        WHEN 'attendant' THEN 3
        ELSE 4
      END,
      u.first_name,
      u.last_name
  `;
  
  const result = await executeQuery(schemaName, query, [stationId]);
  return result.rows;
};

export const getUserAccessibleStations = async (
  schemaName: string,
  userId: string
): Promise<Array<{ id: string; name: string; role: string }>> => {
  const query = `
    SELECT s.id, s.name, us.role
    FROM stations s
    JOIN user_stations us ON s.id = us.station_id
    WHERE us.user_id = $1 AND us.active = true AND s.active = true
    ORDER BY s.name
  `;
  
  const result = await executeQuery(schemaName, query, [userId]);
  return result.rows;
};

export const checkUserStationAccess = async (
  schemaName: string,
  userId: string,
  stationId: string
): Promise<{ hasAccess: boolean; role?: string }> => {
  const query = `
    SELECT role
    FROM user_stations
    WHERE user_id = $1 AND station_id = $2 AND active = true
  `;
  
  const result = await executeQuery(schemaName, query, [userId, stationId]);
  
  if (result.rows.length === 0) {
    return { hasAccess: false };
  }
  
  return { hasAccess: true, role: result.rows[0].role };
};