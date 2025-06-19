## 👥 User Roles & Access Control in FuelSync Hub

FuelSync supports multi-level access to protect and separate functionality per user. Roles are defined both **globally (superadmin)** and **per tenant/station**.

---

### 🔐 SuperAdmin (Global Platform Owner)

| Capability                       | Permission |
| -------------------------------- | ---------- |
| Create/update tenants            | ✅          |
| Assign plan types                | ✅          |
| Manage admin\_users              | ✅          |
| View all data across all tenants | ✅          |
| Monitor logs and activity        | ✅          |
| Clean and seed databases         | ✅          |
| Access Swagger/API Docs          | ✅          |

> SuperAdmins operate under the `public` schema.

---

### 🏢 Owner (Tenant-Level Business Owner)

| Capability                                 | Permission |
| ------------------------------------------ | ---------- |
| Create stations                            | ✅          |
| Add/manage employees (managers/attendants) | ✅          |
| Assign users to stations                   | ✅          |
| View full station dashboards               | ✅          |
| Configure pumps, nozzles, pricing          | ✅          |
| Log fuel deliveries, credit limits         | ✅          |

> Owners are linked to one or more stations via `user_stations`.

---

### 🧑‍🔧 Manager

| Capability          | Permission |
| ------------------- | ---------- |
| Enter readings      | ✅          |
| View dashboards     | ✅          |
| Assign attendants   | ✅          |
| Log deliveries      | ✅          |
| Edit fuel prices    | ❌          |
| Add/remove stations | ❌          |

---

### ⛽ Attendant

| Capability                    | Permission |
| ----------------------------- | ---------- |
| Enter nozzle readings         | ✅          |
| Record sales + payment method | ✅          |
| View basic station info       | ✅          |
| Edit other users or stations  | ❌          |

---

### 📄 Technical Notes

#### `user_stations` Table

Links users to stations with a role:

```sql
CREATE TABLE user_stations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  role station_user_role NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, station_id)
);
```

#### Role Enum

```sql
CREATE TYPE station_user_role AS ENUM ('owner', 'manager', 'attendant');
```

#### Permissions Enforcement

* Owners can assign/revoke all roles
* Managers can only assign attendants
* Attendants have only read/write access to sales and readings they create

---

> This file is referenced by: `AUTH.md`, `API.md`, and `SEEDING.md` to map who can perform what.
