import { PLAN_CONFIG, PLAN_TYPES } from '../backend/src/config/planConfig';

/**
 * This script auto-generates the ERP/Feature Matrix markdown table for documentation.
 * Run this script after updating PLAN_CONFIG to keep erp.md in sync.
 */

function boolToEmoji(val: boolean) {
  return val ? '✅' : '❌';
}

const features = [
  { key: 'maxStations', label: 'Max Stations' },
  { key: 'maxPumpsPerStation', label: 'Max Pumps/Station' },
  { key: 'maxNozzlesPerPump', label: 'Max Nozzles/Pump' },
  { key: 'maxUsers', label: 'Max Users' },
  { key: 'exportData', label: 'Export Data', isBool: true },
  { key: 'advancedReports', label: 'Advanced Reports', isBool: true },
  { key: 'apiAccess', label: 'API Access', isBool: true },
  { key: 'manageStations', label: 'Manage Stations', isBool: true },
  { key: 'managePumps', label: 'Manage Pumps', isBool: true },
  { key: 'manageNozzles', label: 'Manage Nozzles', isBool: true },
  { key: 'manageUsers', label: 'Manage Users', isBool: true },
  { key: 'recordSales', label: 'Record Sales', isBool: true },
  { key: 'reconcile', label: 'Reconcile', isBool: true },
  { key: 'viewReports', label: 'View Reports', isBool: true },
];

let md = '# FuelSync Hub - ERP/Feature Matrix\n\n';
md += '| Feature                | Basic | Premium | Enterprise |\n';
md += '|------------------------|:-----:|:-------:|:----------:|\n';

for (const feat of features) {
  md += `| ${feat.label.padEnd(22)} |`;
  for (const plan of PLAN_TYPES) {
    const val = PLAN_CONFIG[plan][feat.key];
    md += ' ' + (feat.isBool ? boolToEmoji(val) : val.toString().padEnd(6)) + ' |';
  }
  md += '\n';
}

md += '\n- All plans include core sales, reconciliation, and user management features.\n';
md += '- Upgrades unlock more stations, advanced analytics, and integrations.\n';

require('fs').writeFileSync('planning/erp.md', md);
console.log('erp.md updated!');
