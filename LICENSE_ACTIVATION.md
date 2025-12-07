# License Activation System

## Overview

The license activation system allows desktop applications to activate their license using a unique license key. Once activated, the license is tied to a specific machine and cannot be activated on another machine.

## Database Schema

### Added Fields to `companies` Table

- `is_activated` (boolean, default: false) - Whether the license has been activated
- `activated_at` (timestamp, nullable) - When the license was activated
- `activated_by_machine_id` (string, nullable) - Unique identifier of the machine that activated the license

### Index on `license_key`

The `license_key` field has a **unique index** for:
- Fast lookups during activation
- Ensures uniqueness across all companies
- Prevents duplicate license keys

## Activation Workflow

### Step 1: Company Creation (Admin)

Admin creates a company through the API, which automatically generates a unique license key:

```bash
curl -X POST http://localhost:8000/api/companies \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corp",
    "contact_email": "contact@acme.com"
  }'
```

Response includes the license key:
```json
{
  "company": {
    "license_key": "ABCD-EFGH-IJKL-MNOP-QRST-UVWX-YZ12-3456",
    "is_activated": false,
    ...
  }
}
```

### Step 2: Desktop App Validates License

Before activation, the desktop app can validate if a license key exists and is valid:

**Endpoint:** `POST /api/license/validate`

**Request:**
```json
{
  "license_key": "ABCD-EFGH-IJKL-MNOP-QRST-UVWX-YZ12-3456"
}
```

**Success Response (200):**
```json
{
  "valid": true,
  "message": "License is valid",
  "company": {
    "id": 1,
    "name": "Acme Corp",
    "is_activated": false,
    "license_status": "active",
    "license_expires_at": "2026-12-05T00:00:00.000000Z"
  }
}
```

**Error Responses:**

**404 - Invalid License Key:**
```json
{
  "valid": false,
  "message": "Invalid license key"
}
```

**403 - License Expired:**
```json
{
  "valid": false,
  "message": "License has expired",
  "company": {
    "name": "Acme Corp",
    "license_expires_at": "2024-12-05T00:00:00.000000Z"
  }
}
```

**403 - License Suspended:**
```json
{
  "valid": false,
  "message": "License has been suspended",
  "company": {
    "name": "Acme Corp"
  }
}
```

### Step 3: Desktop App Activates License

Desktop app submits the license key with a unique machine identifier:

**Endpoint:** `POST /api/license/activate`

**Request:**
```json
{
  "license_key": "ABCD-EFGH-IJKL-MNOP-QRST-UVWX-YZ12-3456",
  "machine_id": "WIN-ABC123-DEF456-GHI789"
}
```

**Machine ID Generation:**
Your desktop app should generate a unique machine ID using:
- MAC Address
- Motherboard Serial Number
- CPU ID
- Hard Drive Serial Number
- Or a combination (hashed for privacy)

Example (pseudocode):
```
machine_id = SHA256(mac_address + cpu_id + motherboard_serial)
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "License activated successfully",
  "company": {
    "id": 1,
    "name": "Acme Corp",
    "license_key": "ABCD-EFGH-IJKL-MNOP-QRST-UVWX-YZ12-3456",
    "contact_email": "contact@acme.com",
    "activated_at": "2025-12-05T20:30:15.000000Z",
    "license_expires_at": "2026-12-05T00:00:00.000000Z"
  }
}
```

**Error Responses:**

**404 - Invalid License Key:**
```json
{
  "success": false,
  "message": "Invalid license key"
}
```

**409 - Already Activated on Different Machine:**
```json
{
  "success": false,
  "message": "License has already been activated on another machine",
  "activated_at": "2025-12-05T20:30:15.000000Z"
}
```

**200 - Already Activated on Same Machine:**
```json
{
  "success": true,
  "message": "License already activated on this machine",
  "company": {
    "id": 1,
    "name": "Acme Corp",
    "license_key": "ABCD-EFGH-IJKL-MNOP-QRST-UVWX-YZ12-3456",
    "activated_at": "2025-12-05T20:30:15.000000Z"
  }
}
```

**403 - License Cannot Be Activated:**
```json
{
  "success": false,
  "message": "License has expired",
  "company": {
    "name": "Acme Corp",
    "license_status": "expired",
    "license_expires_at": "2024-12-05T00:00:00.000000Z"
  }
}
```

### Step 4: Desktop App Checks Activation Status

Desktop app should periodically verify that the license is still activated and valid:

**Endpoint:** `POST /api/license/check-activation`

**Request:**
```json
{
  "license_key": "ABCD-EFGH-IJKL-MNOP-QRST-UVWX-YZ12-3456",
  "machine_id": "WIN-ABC123-DEF456-GHI789"
}
```

**Success Response (200):**
```json
{
  "activated": true,
  "valid": true,
  "message": "License is activated and valid",
  "company": {
    "id": 1,
    "name": "Acme Corp",
    "license_expires_at": "2026-12-05T00:00:00.000000Z"
  }
}
```

**Error Responses:**

**404 - Invalid License Key:**
```json
{
  "activated": false,
  "message": "Invalid license key"
}
```

**200 - Not Activated:**
```json
{
  "activated": false,
  "message": "License is not activated"
}
```

**403 - Activated on Different Machine:**
```json
{
  "activated": false,
  "message": "License is activated on a different machine"
}
```

**200 - Activated but No Longer Valid:**
```json
{
  "activated": true,
  "valid": false,
  "message": "License is activated but no longer valid (expired or suspended)",
  "license_status": "expired",
  "license_expires_at": "2024-12-05T00:00:00.000000Z"
}
```

## Desktop App Implementation Guide

### On First Launch (Not Activated)

1. **Show activation dialog**
2. **User enters license key**
3. **Call** `POST /api/license/validate` to check if valid
4. **If valid**, call `POST /api/license/activate` with machine ID
5. **Store** license key and machine ID locally (encrypted)
6. **Show success message** and launch app

### On Subsequent Launches

1. **Load** stored license key and machine ID
2. **Call** `POST /api/license/check-activation` to verify
3. **If activated and valid**, launch app
4. **If not valid**, show error and require re-activation or contact support

### Periodic Validation (Recommended)

Check activation status every:
- App launch
- Every 24 hours while app is running
- Before critical operations

### Offline Support (Optional)

For apps that need to work offline:
- Cache the last successful activation check
- Allow X days of offline operation
- Require online check after X days

## Security Considerations

### License Key Format

- 32 characters formatted as `XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX`
- Unique across all companies
- Indexed for fast lookups

### Machine ID

- Should be deterministic (same machine = same ID)
- Should be difficult to spoof
- Consider hashing hardware identifiers for privacy
- Should survive minor hardware changes (RAM upgrades, etc.)

### One-Time Activation

- Once activated, license is **locked to that machine**
- Admin must manually reset activation if user needs to change machines
- Prevents license sharing

### API Rate Limiting

Consider implementing rate limiting on activation endpoints to prevent:
- Brute force attacks on license keys
- Excessive validation requests

## Admin Management

### Viewing Activation Status

Admins can see activation status in company details:

```bash
curl -X GET http://localhost:8000/api/companies/1 \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

Response includes:
```json
{
  "id": 1,
  "name": "Acme Corp",
  "license_key": "ABCD-EFGH-IJKL-MNOP-QRST-UVWX-YZ12-3456",
  "is_activated": true,
  "activated_at": "2025-12-05T20:30:15.000000Z",
  "activated_by_machine_id": "WIN-ABC123-DEF456-GHI789",
  ...
}
```

### Resetting Activation (Future Feature)

To allow a company to move to a new machine, admin can reset activation:

**Endpoint:** `POST /api/companies/{id}/reset-activation` (To be implemented)

This would:
- Set `is_activated = false`
- Clear `activated_at`
- Clear `activated_by_machine_id`
- Allow user to activate on a new machine

## Testing the Activation Flow

### 1. Create a Test Company

```bash
# Login as admin
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@druglane.com", "password": "password"}'

# Save the token, then create company
curl -X POST http://localhost:8000/api/companies \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Company",
    "contact_email": "test@company.com"
  }'
```

**Copy the `license_key` from the response**

### 2. Validate the License

```bash
curl -X POST http://localhost:8000/api/license/validate \
  -H "Content-Type: application/json" \
  -d '{
    "license_key": "YOUR_LICENSE_KEY_HERE"
  }'
```

### 3. Activate the License

```bash
curl -X POST http://localhost:8000/api/license/activate \
  -H "Content-Type: application/json" \
  -d '{
    "license_key": "YOUR_LICENSE_KEY_HERE",
    "machine_id": "TEST-MACHINE-12345"
  }'
```

### 4. Try to Activate Again (Should Fail)

```bash
curl -X POST http://localhost:8000/api/license/activate \
  -H "Content-Type: application/json" \
  -d '{
    "license_key": "YOUR_LICENSE_KEY_HERE",
    "machine_id": "DIFFERENT-MACHINE-67890"
  }'
```

Should return 409 Conflict

### 5. Check Activation Status

```bash
curl -X POST http://localhost:8000/api/license/check-activation \
  -H "Content-Type: application/json" \
  -d '{
    "license_key": "YOUR_LICENSE_KEY_HERE",
    "machine_id": "TEST-MACHINE-12345"
  }'
```

## API Endpoints Summary

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/license/validate` | POST | No | Check if license key is valid |
| `/api/license/activate` | POST | No | Activate license on a machine |
| `/api/license/check-activation` | POST | No | Verify activation status |

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 404 | License key not found |
| 403 | License suspended/expired or activated on different machine |
| 409 | License already activated on another machine |
| 422 | Validation error (missing fields) |

## Future Enhancements

1. **Reset Activation** - Allow admins to reset activation for machine changes
2. **Activation History** - Track activation attempts and changes
3. **Multiple Activations** - Support N concurrent machine activations per license
4. **Hardware Change Tolerance** - Allow minor hardware changes without losing activation
5. **Offline Grace Period** - Configure how long app can work offline
6. **License Transfer** - Allow users to transfer license to new machine (self-service)

## Related Documentation

- [AUTH_SYSTEM_SETUP.md](AUTH_SYSTEM_SETUP.md) - User authentication system
- [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) - Overall application context
