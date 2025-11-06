# ⚠️ IMPORTANT: PostgreSQL Password Required

## The Issue
Your PostgreSQL installation requires a password, but we don't know what it is.

## Solution: Find Your PostgreSQL Password

### Option 1: Try Common Default Passwords

Try these common defaults:
- `postgres`
- `admin`
- `password`
- `root`
- (blank - no password)

Test with:
```powershell
psql -U postgres
# Enter password when prompted
```

If it works, update `.env` file line 1 to:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/indidate
```

### Option 2: Reset PostgreSQL Password

1. **Find pg_hba.conf:**
   ```
   C:\Program Files\PostgreSQL\14\data\pg_hba.conf
   ```

2. **Edit as Administrator** - Change this line:
   ```
   # IPv4 local connections:
   host    all             all             127.0.0.1/32            scram-sha-256
   ```
   
   To:
   ```
   # IPv4 local connections:
   host    all             all             127.0.0.1/32            trust
   ```

3. **Restart PostgreSQL:**
   ```powershell
   Restart-Service postgresql-x64-14
   ```

4. **Connect without password:**
   ```powershell
   psql -U postgres
   ```

5. **Set new password:**
   ```sql
   ALTER USER postgres PASSWORD 'newpassword123';
   \q
   ```

6. **Change pg_hba.conf back to `scram-sha-256`**

7. **Restart PostgreSQL again**

8. **Update .env:**
   ```
   DATABASE_URL=postgresql://postgres:newpassword123@localhost:5432/indidate
   ```

### Option 3: Use Windows Authentication (Easiest)

1. **Edit pg_hba.conf** and add this line at the top:
   ```
   host    all             all             127.0.0.1/32            trust
   ```

2. **Restart PostgreSQL**

3. **Update .env to:**
   ```
   DATABASE_URL=postgresql://postgres@localhost:5432/indidate
   ```

## After Fixing Password

Run these commands:

```powershell
# 1. Create database
psql -U postgres -c "CREATE DATABASE indidate;"

# 2. Initialize tables
node server/database/init.js

# 3. Start server
npm run server
```

## Quick Test

Test your PostgreSQL connection:
```powershell
psql -U postgres -l
```

This should list all databases without error.

---

**Current Status:** Waiting for PostgreSQL password configuration
