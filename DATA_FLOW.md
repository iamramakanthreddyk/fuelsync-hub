# FuelSync Hub - Data Flow Diagrams

This document provides data flow diagrams for the FuelSync Hub platform, illustrating how data moves through the system.

## System Context Diagram

```mermaid
flowchart TD
    A[Superadmin] -->|Manages| B[FuelSync Hub Platform]
    C[Tenant Owner] -->|Manages Tenant| B
    D[Station Manager] -->|Manages Station| B
    E[Employee] -->|Records Sales| B
    F[Customer] -->|Purchases Fuel| E
    B -->|Generates| G[Reports]
    B -->|Enforces| H[Business Rules]
    B -->|Stores Data| I[Database]
    B -->|Processes Payments| J[Stripe]
```

## Architecture Overview

```mermaid
flowchart TD
    A[Frontend - Next.js] -->|API Requests| B[Backend - Express.js]
    B -->|Queries/Updates| C[PostgreSQL Database]
    B -->|Payment Processing| D[Stripe]
    E[Owner] -->|Uses| A
    F[Manager] -->|Uses| A
    G[Employee] -->|Uses| A
    H[Superadmin] -->|Uses| A
```

## User Management Flow

```mermaid
flowchart TD
    A[Superadmin] -->|Creates| B[Tenant]
    B -->|Has| C[Tenant Owner]
    C -->|Creates| D[Station]
    C -->|Creates| E[Users]
    E -->|Assigned to| D
    E -->|Has Role| F{Role}
    F -->|Manager| G[Manage Station]
    F -->|Employee| H[Record Sales]
```

## Sales Process Flow

```mermaid
flowchart TD
    A[Customer] -->|Purchases Fuel| B[Employee]
    B -->|Records| C[Sale]
    C -->|Selects| D[Pump/Nozzle]
    C -->|Enters| E[Volume/Amount]
    C -->|Chooses| F{Payment Method}
    F -->|Cash| G[Cash Sale]
    F -->|Card| H[Card Sale]
    F -->|UPI| I[UPI Sale]
    F -->|Credit| J[Credit Sale]
    J -->|Associated with| K[Creditor]
    K -->|Updates| L[Running Balance]
    C -->|Updates| M[Nozzle Reading]
    C -->|Generates| N[Receipt]
```

## Reconciliation Process

```mermaid
flowchart TD
    A[Manager] -->|Performs| B[Daily Reconciliation]
    B -->|Calculates| C[Sales Totals]
    C -->|Includes| D[Cash Sales]
    C -->|Includes| E[Card Sales]
    C -->|Includes| F[UPI Sales]
    C -->|Includes| G[Credit Sales]
    B -->|Verifies| H[Physical Cash]
    B -->|Compares with| I[System Cash Total]
    B -->|Records| J[Discrepancies]
    B -->|Finalizes| K[Reconciliation Record]
```

## Inventory Management Flow

```mermaid
flowchart TD
    A[Manager] -->|Records| B[Fuel Delivery]
    B -->|Updates| C[Fuel Inventory]
    D[Sales] -->|Reduces| C
    A -->|Monitors| C
    A -->|Sets| E[Fuel Prices]
    E -->|Applied to| D
    A -->|Reconciles| F[Physical Inventory]
    F -->|Compared with| C
    F -->|Records| G[Discrepancies]
```

## Credit Management Flow

```mermaid
flowchart TD
    A[Credit Sale] -->|Creates| B[Credit Record]
    B -->|Associated with| C[Creditor]
    C -->|Has| D[Credit Limit]
    C -->|Has| E[Running Balance]
    F[Payment] -->|Reduces| E
    F -->|Recorded by| G[User]
    F -->|Has| H[Payment Method]
    F -->|Has| I[Reference Number]
```

## Reporting Flow

```mermaid
flowchart TD
    A[User] -->|Requests| B{Report Type}
    B -->|Sales| C[Sales Report]
    B -->|Inventory| D[Inventory Report]
    B -->|Credit| E[Credit Report]
    B -->|Reconciliation| F[Reconciliation Report]
    C -->|Aggregates| G[Sales Data]
    D -->|Aggregates| H[Inventory Data]
    E -->|Aggregates| I[Credit Data]
    F -->|Aggregates| J[Reconciliation Data]
    C -->|Displayed to| A
    D -->|Displayed to| A
    E -->|Displayed to| A
    F -->|Displayed to| A
```

## Data Access Patterns

### Superadmin Access

```mermaid
flowchart TD
    A[Superadmin] -->|Access to| B[All Tenants]
    A -->|Access to| C[All Users]
    A -->|Access to| D[All Stations]
    A -->|Access to| E[System Settings]
    A -->|Generates| F[System-wide Reports]
```

### Tenant Owner Access

```mermaid
flowchart TD
    A[Tenant Owner] -->|Access to| B[Own Tenant]
    A -->|Access to| C[Tenant Users]
    A -->|Access to| D[Tenant Stations]
    A -->|Access to| E[Tenant Settings]
    A -->|Generates| F[Tenant-wide Reports]
```

### Station Manager Access

```mermaid
flowchart TD
    A[Station Manager] -->|Access to| B[Assigned Station]
    A -->|Access to| C[Station Users]
    A -->|Access to| D[Station Pumps]
    A -->|Access to| E[Station Sales]
    A -->|Generates| F[Station Reports]
```

### Employee Access

```mermaid
flowchart TD
    A[Employee] -->|Access to| B[Assigned Station]
    A -->|Records| C[Sales]
    A -->|Manages| D[Shifts]
    A -->|Views| E[Recent Transactions]
```

## Authentication and Authorization Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as Database
    
    U->>F: Enter Credentials
    F->>B: Login Request
    B->>DB: Verify Credentials
    DB->>B: User Data + Role
    B->>B: Generate JWT Token
    B->>F: Return Token + User Info
    F->>F: Store Token in LocalStorage
    F->>U: Redirect to Dashboard
    
    U->>F: Request Protected Resource
    F->>B: API Request with JWT
    B->>B: Verify Token
    B->>B: Check Permissions
    B->>DB: Query Data (with tenant isolation)
    DB->>B: Return Data
    B->>F: Return Response
    F->>U: Display Data
```

## Multi-tenancy Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant B as Backend
    participant DB as Database
    
    U->>B: API Request with JWT
    B->>B: Extract tenant_id from JWT
    B->>DB: SET search_path to tenant_schema
    B->>DB: Execute Query (isolated to tenant)
    DB->>B: Return Data
    B->>U: Return Response
```

## Data Creation Sequence

### Setting Up a New Tenant

```mermaid
sequenceDiagram
    participant A as Superadmin
    participant B as System
    participant DB as Database
    
    A->>B: Create Tenant
    B->>DB: Insert Tenant Record (public schema)
    B->>DB: Create Tenant Schema
    B->>DB: Create Schema Tables
    B->>DB: Create Default Owner
    A->>B: Configure Subscription
    B->>DB: Create Subscription Record
    A->>B: Create Initial Station
    B->>DB: Insert Station Record
    A->>B: Create Initial Pump
    B->>DB: Insert Pump Record
    A->>B: Create Initial Nozzles
    B->>DB: Insert Nozzle Records
```

### Recording a Sale

```mermaid
sequenceDiagram
    participant E as Employee
    participant B as System
    participant DB as Database
    
    E->>B: Select Pump/Nozzle
    B->>DB: Get Current Reading
    DB->>B: Return Reading
    E->>B: Enter Sale Details
    E->>B: Select Payment Method
    alt Cash Payment
        E->>B: Enter Cash Amount
        B->>DB: Record Cash Sale
    else Card Payment
        E->>B: Process Card
        B->>DB: Record Card Sale
    else UPI Payment
        E->>B: Process UPI
        B->>DB: Record UPI Sale
    else Credit Payment
        E->>B: Select Creditor
        B->>DB: Check Credit Limit
        DB->>B: Return Credit Status
        B->>DB: Record Credit Sale
        B->>DB: Update Creditor Balance
    end
    B->>DB: Update Nozzle Reading
    B->>E: Confirm Sale
```

## Using This Documentation

This documentation provides a comprehensive view of the FuelSync Hub data flow. Use it to:

1. **Understand Processes**: See how data flows through different processes
2. **Identify Dependencies**: Understand how components interact
3. **Plan Extensions**: Add new features while maintaining data integrity
4. **Debug Issues**: Trace data through the system to identify problems
5. **Train New Developers**: Help new team members understand the system architecture

When implementing new features, consider:

1. **Multi-tenancy**: Ensure data is properly isolated between tenants
2. **Authentication**: Verify user permissions for each operation
3. **Data Integrity**: Maintain referential integrity between related entities
4. **Audit Trail**: Log important actions for troubleshooting and compliance
5. **Error Handling**: Implement proper error handling and recovery