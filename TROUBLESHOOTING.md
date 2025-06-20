# FuelSync Hub - Troubleshooting Guide

This guide helps resolve common issues with FuelSync Hub.

## 🔧 Database Issues

### Connection Problems

**Error**: `ECONNREFUSED` or connection timeout

**Solution**:
1. Check PostgreSQL is running
2. Verify environment variables:
   ```bash
   # Unix/Linux/macOS
   echo $DB_HOST $DB_PORT $DB_NAME $DB_USER

   # Windows PowerShell
   echo $env:DB_HOST $env:DB_PORT $env:DB_NAME $env:DB_USER

   # Windows CMD
   echo %DB_HOST% %DB_PORT% %DB_NAME% %DB_USER%
   ```

   Example Azure configuration:
   ```bash
   DB_HOST=fuelsync-server.postgres.database.azure.com
   DB_PORT=5432
   DB_NAME=fuelsync_db1
   DB_USER=fueladmin
   DB_PASSWORD=your_password
   DB_SSL=true
   ```

   **Note:** This Azure example is for production or backup scenarios only. For development and testing, use a local PostgreSQL instance as described in [docs/TESTING.md](docs/TESTING.md).
3. Test connection:
   ```bash
   npm run db check
   ```

### Schema Issues

**Error**: "column does not exist" or "table does not exist"

**Solution**:
```bash
npm run db reset
```

### Relationship Issues

**Error**: "Station ID is required" or "No stations found"

**Solution**:
```bash
npm run db fix
```

## 🔐 Authentication Issues

### Token Validation Errors

**Error**: "Invalid token" or "Token expired"

**Solution**:
1. Clear browser localStorage
2. Re-login to get fresh token
3. Check JWT environment variables:
```bash
export JWT_SECRET=your-jwt-secret-key
export JWT_EXPIRES_IN=24h
```

### Login Failures

**Error**: "Invalid credentials"

**Solution**:
1. Use default credentials:
   - Owner: owner@demofuel.com / password123
   - Manager: manager@demofuel.com / password123
   - Employee: employee@demofuel.com / password123

2. Reset database if needed:
```bash
npm run db reset
```

## 🌐 Frontend Issues

### "stations.map is not a function"

**Cause**: User not assigned to stations

**Solution**:
```bash
npm run db fix
```

### API Connection Errors

**Error**: Network errors or CORS issues

**Solution**:
1. Ensure backend is running on port 3001
2. Check environment variables:
```bash
export PORT=3001
export NODE_ENV=development
```

## 🚀 Development Issues

### npm install failures

**Error**: Package installation errors

**Solution**:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### TypeScript compilation errors

**Error**: Type errors or compilation failures

**Solution**:
1. Check TypeScript version compatibility
2. Clear build cache:
```bash
rm -rf dist .next
npm run build
```

## 🐳 Docker Issues

### PostgreSQL Container Issues

**Error**: Container won't start or connect

**Solution**:
```bash
# Stop and remove existing container
docker stop fuelsync-postgres
docker rm fuelsync-postgres

# Start fresh container
docker run --name fuelsync-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:13

# Create database
docker exec -it fuelsync-postgres psql -U postgres -c "CREATE DATABASE fuelsync_dev;"
```

## 📊 Performance Issues

### Slow Database Queries

**Solution**:
1. Check database indexes
2. Monitor connection pool usage
3. Consider query optimization

### High Memory Usage

**Solution**:
1. Check for memory leaks in Node.js
2. Monitor database connection pools
3. Restart services if needed

## 🔍 Debug Tools

### Database Debug

```bash
# Check connection
npm run db check

# Verify data
npm run db verify

# Fix relationships
npm run db fix
```

### Frontend Debug

Visit: http://localhost:3000/debug

Features:
- Token inspector
- API tester
- Authentication debugger

### Backend Logs

Check console output for:
- Database connection status
- Authentication attempts
- API request/response logs

## 🆘 Emergency Procedures

### Complete Reset

```bash
# Set environment variables
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=fuelsync_dev
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_SSL=false

# Reset everything
npm run db reset

# Verify setup
npm run db verify
```

### Backup and Restore

```bash
# Backup (if using PostgreSQL directly)
pg_dump fuelsync_dev > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
psql fuelsync_dev < backup_file.sql
npm run db fix
```

## 📞 Getting Help

1. **Check logs** - Look at console output for error details
2. **Use debug tools** - Visit /debug page for frontend issues
3. **Verify environment** - Ensure all environment variables are set
4. **Reset if needed** - Use `npm run db reset` for clean slate

## 🎯 Prevention Tips

1. **Always set environment variables** before running commands
2. **Use debug tools** to verify setup
3. **Monitor logs** for early warning signs
4. **Keep backups** of working configurations
5. **Test after changes** to catch issues early

---

For more information, see:
- [Database Operations](DATABASE_OPERATIONS.md)
- [Project Structure](PROJECT_STRUCTURE.md)
- [User Guide](USER_GUIDE.md)