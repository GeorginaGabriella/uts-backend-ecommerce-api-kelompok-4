# API Testing Guide

## Testing the Order Module

### Prerequisites
- Server running: `npm run dev`
- Test data in database
- Valid JWT token

## Test Cases

### 1. Health Check
**Test**: Verify server is running

```bash
curl http://localhost:3000/health
```

**Expected Response** (200):
```json
{
  "status": "OK",
  "timestamp": "2024-04-15T10:30:00Z"
}
```

---

### 2. Create Order

**Test**: Create a new order with valid cart items

```bash
curl -X POST http://localhost:3000/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cartItems": [
      {
        "productId": 1,
        "quantity": 2,
        "price": 50000
      },
      {
        "productId": 2,
        "quantity": 1,
        "price": 75000
      }
    ]
  }'
```

**Expected Response** (201):
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": 1,
    "userId": 1,
    "totalPrice": 175000,
    "status": "PENDING_PAYMENT",
    "items": [
      {
        "id": 1,
        "productId": 1,
        "quantity": 2,
        "price": 50000,
        "subtotal": 100000
      },
      {
        "id": 2,
        "productId": 2,
        "quantity": 1,
        "price": 75000,
        "subtotal": 75000
      }
    ],
    "createdAt": "2024-04-15T10:30:00Z",
    "updatedAt": "2024-04-15T10:30:00Z"
  }
}
```

**Error Cases**:

**Empty cart**:
```bash
curl -X POST http://localhost:3000/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cartItems": []}'
```
Response (400): "Cart items are required and cannot be empty"

**Invalid quantity**:
```bash
curl -X POST http://localhost:3000/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cartItems": [{"productId": 1, "quantity": 0, "price": 50000}]
  }'
```
Response (400): "Quantity must be greater than 0"

**Missing authentication**:
```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{"cartItems": [...]}'
```
Response (401): "No authentication token provided"

---

### 3. Get All Orders

**Test**: Retrieve user's orders with pagination

```bash
curl http://localhost:3000/orders?page=1&limit=10 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `status`: Filter by status (PENDING_PAYMENT, PAID, CANCELLED)

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": {
    "data": [
      {
        "id": 1,
        "userId": 1,
        "totalPrice": 175000,
        "status": "PENDING_PAYMENT",
        "items": [...],
        "createdAt": "2024-04-15T10:30:00Z",
        "updatedAt": "2024-04-15T10:30:00Z"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

**Test Cases**:

**Pagination**:
```bash
# Page 2
curl "http://localhost:3000/orders?page=2&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Filter by status**:
```bash
curl "http://localhost:3000/orders?status=PAID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

curl "http://localhost:3000/orders?status=CANCELLED&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Limit enforcement**:
```bash
# Requested limit 500, should be capped at 100
curl "http://localhost:3000/orders?limit=500" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 4. Get Order Detail

**Test**: Retrieve a specific order

```bash
curl http://localhost:3000/orders/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Order retrieved successfully",
  "data": {
    "id": 1,
    "userId": 1,
    "totalPrice": 175000,
    "status": "PENDING_PAYMENT",
    "items": [...],
    "createdAt": "2024-04-15T10:30:00Z",
    "updatedAt": "2024-04-15T10:30:00Z"
  }
}
```

**Error Cases**:

**Order not found**:
```bash
curl http://localhost:3000/orders/99999 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
Response (404): "Order not found"

**Unauthorized access** (other user's order):
```bash
# Try to access someone else's order
curl http://localhost:3000/orders/999 \
  -H "Authorization: Bearer DIFFERENT_USER_TOKEN"
```
Response (403): "Unauthorized to view this order"

---

### 5. Get Order History

**Test**: Same as "Get All Orders" with optional alias endpoint

```bash
curl "http://localhost:3000/orders/history?status=PAID&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 6. Cancel Order

**Test**: Cancel a pending order

```bash
curl -X PUT http://localhost:3000/orders/1/cancel \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response** (200):
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "id": 1,
    "userId": 1,
    "totalPrice": 175000,
    "status": "CANCELLED",
    "createdAt": "2024-04-15T10:30:00Z",
    "updatedAt": "2024-04-15T10:30:01Z"
  }
}
```

**Error Cases**:

**Already paid**:
```bash
# Try to cancel a PAID order
curl -X PUT http://localhost:3000/orders/2/cancel \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
Response (400): "Order cannot be cancelled. Current status: PAID"

**Already cancelled**:
```bash
# Try to cancel an already cancelled order
curl -X PUT http://localhost:3000/orders/3/cancel \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
Response (400): "Order cannot be cancelled. Current status: CANCELLED"

**Order not found**:
```bash
curl -X PUT http://localhost:3000/orders/99999/cancel \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
Response (404): "Order not found"

**Unauthorized access**:
```bash
# Try to cancel someone else's order
curl -X PUT http://localhost:3000/orders/999/cancel \
  -H "Authorization: Bearer DIFFERENT_USER_TOKEN"
```
Response (403): "Unauthorized to cancel this order"

---

## JWT Token for Testing

Generate a test JWT token:

```javascript
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { id: 1, email: 'user@example.com' },
  'your-secret-key',
  { expiresIn: '7d' }
);

console.log(token);
```

Use in requests:
```bash
-H "Authorization: Bearer YOUR_GENERATED_TOKEN"
```

---

## Running Tests

### Option 1: Manual Testing (curl)

```bash
# Start server
npm run dev

# In another terminal, run tests
bash test-api.sh
```

### Option 2: Automated Testing (Jest)

```bash
npm test
```

### Option 3: Postman Collection

Import the provided `postman-collection.json` into Postman for GUI testing.

---

## Performance Testing

**Response time requirement**: < 500ms

```bash
# Using Apache Bench
ab -n 100 -c 10 http://localhost:3000/health

# Using wrk
wrk -t4 -c100 -d30s http://localhost:3000/health
```

---

## Acceptance Criteria

- Create order with multiple items
- Retrieve order details
- List user orders with pagination
- Filter orders by status
- Cancel pending order
- Prevent cancellation of paid orders
- Authorization checks work correctly
- All error cases return appropriate status codes
- Response time < 500ms
- Database data integrity maintained

---

## Debugging

**Enable debug logs**:
```bash
DEBUG=* npm run dev
```

**Check database**:
```bash
mysql -u root -p ecommerce_db
SELECT * FROM orders;
SELECT * FROM order_items;
```

**Monitor live requests**:
```bash
npm run dev  # Server logs all requests
```
