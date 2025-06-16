import { executeQuery } from './db.service';

export const getSalesSummary = async (
  schemaName: string,
  stationId: string,
  startDate: string,
  endDate: string
) => {
  const totalsResult = await executeQuery(schemaName, `
    SELECT 
      COALESCE(SUM(amount), 0) as total_sales,
      COALESCE(SUM(sale_volume), 0) as total_volume
    FROM sales
    WHERE station_id = $1 
      AND recorded_at BETWEEN $2 AND $3
      AND status != 'voided'`, [stationId, startDate, endDate]);

  const fuelTypeResult = await executeQuery(schemaName, `
    SELECT 
      n.fuel_type,
      COALESCE(SUM(s.sale_volume), 0) as volume,
      COALESCE(SUM(s.amount), 0) as amount
    FROM sales s
    JOIN nozzles n ON s.nozzle_id = n.id
    WHERE s.station_id = $1 
      AND s.recorded_at BETWEEN $2 AND $3
      AND s.status != 'voided'
    GROUP BY n.fuel_type`, [stationId, startDate, endDate]);

  const paymentMethodResult = await executeQuery(schemaName, `
    SELECT 
      payment_method,
      COALESCE(SUM(amount), 0) as amount
    FROM sales
    WHERE station_id = $1 
      AND recorded_at BETWEEN $2 AND $3
      AND status != 'voided'
    GROUP BY payment_method`, [stationId, startDate, endDate]);

  const dailySalesResult = await executeQuery(schemaName, `
    SELECT 
      DATE(recorded_at) as date,
      COALESCE(SUM(amount), 0) as amount,
      COALESCE(SUM(sale_volume), 0) as volume
    FROM sales
    WHERE station_id = $1 
      AND recorded_at BETWEEN $2 AND $3
      AND status != 'voided'
    GROUP BY DATE(recorded_at)
    ORDER BY DATE(recorded_at)`, [stationId, startDate, endDate]);

  const salesByFuelType: { [key: string]: { volume: number; amount: number } } = {};
  fuelTypeResult.rows.forEach(row => {
    salesByFuelType[row.fuel_type] = {
      volume: parseFloat(row.volume),
      amount: parseFloat(row.amount)
    };
  });

  const salesByPaymentMethod: { [key: string]: number } = {};
  paymentMethodResult.rows.forEach(row => {
    salesByPaymentMethod[row.payment_method] = parseFloat(row.amount);
  });

  return {
    totalSales: parseFloat(totalsResult.rows[0].total_sales),
    totalVolume: parseFloat(totalsResult.rows[0].total_volume),
    salesByFuelType,
    salesByPaymentMethod,
    dailySales: dailySalesResult.rows.map(row => ({
      date: row.date,
      amount: parseFloat(row.amount),
      volume: parseFloat(row.volume)
    }))
  };
};

export const getSalesDetail = async (
  schemaName: string,
  stationId: string,
  startDate: string,
  endDate: string
) => {
  const result = await executeQuery(schemaName, `
    SELECT 
      s.id, s.recorded_at, s.sale_volume, s.fuel_price, s.amount, 
      s.cash_received, s.credit_given, s.payment_method, s.status, s.notes,
      n.fuel_type,
      p.name as pump_name,
      st.name as station_name,
      c.party_name as creditor_name,
      u.first_name || ' ' || u.last_name as employee_name
    FROM sales s
    JOIN nozzles n ON s.nozzle_id = n.id
    JOIN pumps p ON n.pump_id = p.id
    JOIN stations st ON s.station_id = st.id
    JOIN users u ON s.user_id = u.id
    LEFT JOIN creditors c ON s.credit_party_id = c.id
    WHERE s.station_id = $1 
      AND s.recorded_at BETWEEN $2 AND $3
    ORDER BY s.recorded_at DESC`, [stationId, startDate, endDate]);

  return result.rows;
};

export const getCreditorsReport = async (
  schemaName: string,
  stationId?: string
) => {
  let query = `
    SELECT 
      c.id, c.party_name, c.party_contact, c.running_balance, c.credit_limit,
      c.last_updated_at, s.name as station_name,
      (
        SELECT COALESCE(SUM(amount), 0)
        FROM credit_payments
        WHERE creditor_id = c.id
      ) as total_payments
    FROM creditors c
    JOIN stations s ON c.station_id = s.id
    WHERE c.active = true`;

  const params: any[] = [];
  if (stationId) {
    query += ` AND c.station_id = $1`;
    params.push(stationId);
  }
  query += ` ORDER BY c.running_balance DESC`;

  const result = await executeQuery(schemaName, query, params);
  return result.rows;
};

export const getStationPerformance = async (
  schemaName: string,
  startDate: string,
  endDate: string
) => {
  const result = await executeQuery(schemaName, `
    SELECT 
      st.id, st.name,
      COALESCE(SUM(s.amount), 0) as total_sales,
      COALESCE(SUM(s.sale_volume), 0) as total_volume,
      COUNT(DISTINCT DATE(s.recorded_at)) as days_with_sales,
      COALESCE(SUM(s.amount) / NULLIF(COUNT(DISTINCT DATE(s.recorded_at)), 0), 0) as average_daily_sales
    FROM stations st
    LEFT JOIN sales s ON st.id = s.station_id 
      AND s.recorded_at BETWEEN $1 AND $2
      AND s.status != 'voided'
    WHERE st.active = true
    GROUP BY st.id, st.name
    ORDER BY total_sales DESC`, [startDate, endDate]);

  return result.rows;
};