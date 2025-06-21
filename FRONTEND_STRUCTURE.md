# Frontend Structure

| Path | Role(s) | Component(s) | CRUD Ops |
|------|---------|--------------|---------|
| /login | All | LoginPage | - |
| /dashboard | Owner, SuperAdmin | DashboardLayout | R |
| /stations | Owner | StationList | C/R/U/D |
| /stations/new | Owner | StationForm | C |
| /stations/[id]/edit | Owner | StationForm | U/D |
| /stations/[id]/pumps | Owner | PumpList | C/R/U/D |
| /stations/[id]/pumps/new | Owner | PumpForm | C |
| /stations/[id]/pumps/[pumpId]/edit | Owner | PumpForm | U/D |
| /stations/[id]/pumps/[pumpId]/nozzles | Owner | NozzleList | C/R/U/D |
| /stations/[id]/pumps/[pumpId]/nozzles/new | Owner | NozzleForm | C |
| /stations/[id]/pumps/[pumpId]/nozzles/[nozzleId]/edit | Owner | NozzleForm | U/D |
| /sales | Owner | SalesList | C/R/U/D |
| /sales/new | Owner | SalesForm | C |
| /admin/tenants | SuperAdmin | TenantList | C/R/U/D |
