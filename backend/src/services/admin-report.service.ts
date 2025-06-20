// src/services/admin-report.service.ts
import pool from '../config/database';

interface ReportParams {
  startDate?: string;
  endDate?: string;
  tenantId?: string;
  stationId?: string;
}

interface ComplianceParams {
  tenantId?: string;
}

/**
 * Get sales report
 */
export async function getSalesReport(params: ReportParams) {
  try {
    const { startDate, endDate, tenantId, stationId } = params;
    
    // Build query conditions
    const conditions = [];
    const queryParams = [];
    let paramIndex = 1;
    
    if (startDate) {
      conditions.push(`s.created_at >= $${paramIndex}`);
      queryParams.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      conditions.push(`s.created_at <= $${paramIndex}`);
      queryParams.push(endDate);
      paramIndex++;
    }
    
    if (tenantId) {
      conditions.push(`t.id = $${paramIndex}`);
      queryParams.push(tenantId);
      paramIndex++;
    }
    
    if (stationId) {
      conditions.push(`st.id = $${paramIndex}`);
      queryParams.push(stationId);
      paramIndex++;
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Get sales data
    const query = `
      SELECT 
        t.id AS tenant_id,
        t.name AS tenant_name,
        st.id AS station_id,
        st.name AS station_name,
        SUM(s.amount) AS total_sales,
        COUNT(s.id) AS transaction_count,
        s.payment_method,
        n.fuel_type,
        DATE_TRUNC('day', s.created_at) AS date
      FROM 
        sales s
      JOIN
        nozzles n ON s.nozzle_id = n.id
      JOIN
        pumps p ON n.pump_id = p.id
      JOIN
        stations st ON p.station_id = st.id
      JOIN
        tenants t ON st.tenant_id = t.id
      ${whereClause}
      GROUP BY
        t.id, t.name, st.id, st.name, s.payment_method, n.fuel_type, DATE_TRUNC('day', s.created_at)
      ORDER BY
        date DESC, t.name, st.name
    `;
    
    const result = await pool.query(query, queryParams);
    
    // Calculate summary statistics
    const totalSales = result.rows.reduce((sum, row) => sum + parseFloat(row.total_sales), 0);
    const totalTransactions = result.rows.reduce((sum, row) => sum + parseInt(row.transaction_count), 0);
    
    // Group by payment method
    const paymentMethodSummary = result.rows.reduce((acc: any, row) => {
      const method = row.payment_method;
      if (!acc[method]) {
        acc[method] = 0;
      }
      acc[method] += parseFloat(row.total_sales);
      return acc;
    }, {});
    
    // Group by fuel type
    const fuelTypeSummary = result.rows.reduce((acc: any, row) => {
      const type = row.fuel_type;
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type] += parseFloat(row.total_sales);
      return acc;
    }, {});
    
    return {
      summary: {
        totalSales,
        totalTransactions,
        paymentMethodSummary,
        fuelTypeSummary
      },
      details: result.rows
    };
  } catch (error) {
    console.error('Get sales report error:', error);
    throw error;
  }
}

/**
 * Get credit report
 */
export async function getCreditReport(params: ReportParams) {
  try {
    const { startDate, endDate, tenantId, stationId } = params;
    
    // Build query conditions
    const conditions = [];
    const queryParams = [];
    let paramIndex = 1;
    
    conditions.push(`s.payment_method = 'credit'`);
    
    if (startDate) {
      conditions.push(`s.created_at >= $${paramIndex}`);
      queryParams.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      conditions.push(`s.created_at <= $${paramIndex}`);
      queryParams.push(endDate);
      paramIndex++;
    }
    
    if (tenantId) {
      conditions.push(`t.id = $${paramIndex}`);
      queryParams.push(tenantId);
      paramIndex++;
    }
    
    if (stationId) {
      conditions.push(`st.id = $${paramIndex}`);
      queryParams.push(stationId);
      paramIndex++;
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Get credit sales data
    const query = `
      SELECT 
        t.id AS tenant_id,
        t.name AS tenant_name,
        st.id AS station_id,
        st.name AS station_name,
        c.id AS creditor_id,
        c.name AS creditor_name,
        SUM(s.amount) AS total_credit,
        SUM(CASE WHEN cp.id IS NULL THEN s.amount ELSE 0 END) AS outstanding_credit,
        SUM(CASE WHEN cp.id IS NOT NULL THEN s.amount ELSE 0 END) AS paid_credit,
        COUNT(s.id) AS transaction_count
      FROM 
        sales s
      JOIN
        nozzles n ON s.nozzle_id = n.id
      JOIN
        pumps p ON n.pump_id = p.id
      JOIN
        stations st ON p.station_id = st.id
      JOIN
        tenants t ON st.tenant_id = t.id
      LEFT JOIN
        creditors c ON s.creditor_id = c.id
      LEFT JOIN
        credit_payments cp ON s.id = cp.sale_id
      ${whereClause}
      GROUP BY
        t.id, t.name, st.id, st.name, c.id, c.name
      ORDER BY
        t.name, st.name, c.name
    `;
    
    const result = await pool.query(query, queryParams);
    
    // Calculate summary statistics
    const totalCredit = result.rows.reduce((sum, row) => sum + parseFloat(row.total_credit), 0);
    const outstandingCredit = result.rows.reduce((sum, row) => sum + parseFloat(row.outstanding_credit), 0);
    const paidCredit = result.rows.reduce((sum, row) => sum + parseFloat(row.paid_credit), 0);
    
    return {
      summary: {
        totalCredit,
        outstandingCredit,
        paidCredit,
        paymentRate: totalCredit > 0 ? (paidCredit / totalCredit) * 100 : 0
      },
      details: result.rows
    };
  } catch (error) {
    console.error('Get credit report error:', error);
    throw error;
  }
}

/**
 * Get compliance report
 */
export async function getComplianceReport(params: ComplianceParams) {
  try {
    const { tenantId } = params;
    
    // Build query conditions
    const conditions = [];
    const queryParams = [];
    let paramIndex = 1;
    
    if (tenantId) {
      conditions.push(`t.id = $${paramIndex}`);
      queryParams.push(tenantId);
      paramIndex++;
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Get tenant compliance data
    const query = `
      SELECT 
        t.id AS tenant_id,
        t.name AS tenant_name,
        t.subscription_plan,
        COUNT(DISTINCT st.id) AS station_count,
        COUNT(DISTINCT u.id) AS user_count,
        COUNT(DISTINCT p.id) AS pump_count,
        COUNT(DISTINCT n.id) AS nozzle_count,
        CASE 
          WHEN COUNT(DISTINCT u.id) = 0 THEN false
          ELSE EXISTS (SELECT 1 FROM users WHERE tenant_id = t.id AND role = 'owner' AND active = true)
        END AS has_owner,
        CASE 
          WHEN COUNT(DISTINCT st.id) = 0 THEN false
          ELSE true
        END AS has_station
      FROM 
        tenants t
      LEFT JOIN
        stations st ON t.id = st.tenant_id AND st.active = true
      LEFT JOIN
        users u ON t.id = u.tenant_id AND u.active = true
      LEFT JOIN
        pumps p ON st.id = p.station_id AND p.active = true
      LEFT JOIN
        nozzles n ON p.id = n.pump_id AND n.active = true
      ${whereClause}
      GROUP BY
        t.id, t.name, t.subscription_plan
      ORDER BY
        t.name
    `;
    
    const result = await pool.query(query, queryParams);
    
    // Check compliance for each tenant
    const complianceResults = result.rows.map(tenant => {
      // Check tenant requirements
      const hasOwner = tenant.has_owner;
      const hasStation = tenant.has_station;
      
      // Check station requirements
      const stationCount = parseInt(tenant.station_count);
      const pumpCount = parseInt(tenant.pump_count);
      const nozzleCount = parseInt(tenant.nozzle_count);
      
      // Check subscription plan limits
      let planLimits;
      switch (tenant.subscription_plan) {
        case 'basic':
          planLimits = { maxStations: 3, maxUsers: 10 };
          break;
        case 'premium':
          planLimits = { maxStations: 10, maxUsers: 50 };
          break;
        case 'enterprise':
          planLimits = { maxStations: -1, maxUsers: -1 }; // Unlimited
          break;
        default:
          planLimits = { maxStations: 1, maxUsers: 5 };
      }
      
      const withinStationLimit = planLimits.maxStations === -1 || stationCount <= planLimits.maxStations;
      const withinUserLimit = planLimits.maxUsers === -1 || parseInt(tenant.user_count) <= planLimits.maxUsers;
      
      // Calculate compliance score
      let complianceScore = 100;
      const complianceIssues = [];
      
      if (!hasOwner) {
        complianceScore -= 20;
        complianceIssues.push('No owner assigned');
      }
      
      if (!hasStation) {
        complianceScore -= 20;
        complianceIssues.push('No stations created');
      }
      
      if (stationCount > 0 && pumpCount === 0) {
        complianceScore -= 15;
        complianceIssues.push('Stations without pumps');
      }
      
      if (pumpCount > 0 && nozzleCount < pumpCount * 2) {
        complianceScore -= 15;
        complianceIssues.push('Pumps with insufficient nozzles');
      }
      
      if (!withinStationLimit) {
        complianceScore -= 10;
        complianceIssues.push('Exceeds station limit for subscription plan');
      }
      
      if (!withinUserLimit) {
        complianceScore -= 10;
        complianceIssues.push('Exceeds user limit for subscription plan');
      }
      
      // Ensure score is between 0 and 100
      complianceScore = Math.max(0, Math.min(100, complianceScore));
      
      return {
        ...tenant,
        compliance: {
          score: complianceScore,
          status: complianceScore === 100 ? 'Compliant' : complianceScore >= 80 ? 'Minor Issues' : complianceScore >= 60 ? 'Major Issues' : 'Critical Issues',
          issues: complianceIssues,
          details: {
            hasOwner,
            hasStation,
            withinStationLimit,
            withinUserLimit,
            sufficientPumps: stationCount === 0 || pumpCount > 0,
            sufficientNozzles: pumpCount === 0 || nozzleCount >= pumpCount * 2
          }
        }
      };
    });
    
    // Calculate overall compliance
    const overallScore = complianceResults.reduce((sum, tenant) => sum + tenant.compliance.score, 0) / complianceResults.length;
    
    return {
      summary: {
        overallScore,
        compliantTenants: complianceResults.filter(t => t.compliance.score === 100).length,
        totalTenants: complianceResults.length
      },
      details: complianceResults
    };
  } catch (error) {
    console.error('Get compliance report error:', error);
    throw error;
  }
}