# Quick Start Guide - Order & Transaction Module

## Prerequisites
- Node.js v14+ 
- MySQL 5.7+
- npm or yarn

## Quick Setup (5 minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Database
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your MySQL credentials
# Example:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=ecommerce_db
```

### Step 3: Run Migrations
```bash
npm run migrate
```

This creates `orders` and `order_items` tables automatically

### Step 4: Start Server
```bash
npm run dev
```

Server running on `http://localhost:3000`

## Test Endpoints

### 1. Create Order
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
      }
    ]
  }'
```

### 2. Get All Orders
```bash
curl http://localhost:3000/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Get Single Order
```bash
curl http://localhost:3000/orders/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Cancel Order
```bash
curl -X PUT http://localhost:3000/orders/1/cancel \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Documentation

For detailed documentation, see [ORDERS_MODULE.md](ORDERS_MODULE.md)

Topics covered:
- Architecture overview
- Complete API reference
- Database schema
- Business rules
- Error handling
- Integration points

## Project Structure

```
src/
├── orders/               # Main module
│   ├── domain/          # Business entities & interfaces
│   ├── application/     # Use cases & DTOs
│   ├── infrastructure/  # Database & persistence
│   ├── presentation/    # Controllers & routes
│   └── OrderContext.js  # Dependency injection
├── config/              # Configuration
├── middleware/          # Authentication
└── app.js              # Application entry point
```

## Key Features

[OK] Clean Architecture - Organized, maintainable code structure
[OK] JWT Authentication - Secure API endpoints
[OK] Input Validation - Validate all requests
[OK] Error Handling - Comprehensive error responses
[OK] Database Transactions - Atomic operations
[OK] Pagination - Handle large datasets
[OK] User Isolation - Users can only access their own orders

## Available Scripts

```bash
npm start      # Start production server
npm run dev    # Start development server with auto-reload
npm run migrate # Run database migrations
npm test       # Run test suite (not yet implemented)
```

## Example JWT Token

To test the API, you'll need a JWT token. Here's how to generate one:

```javascript
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { id: 1, email: 'user@example.com' },
  'your-secret-key',
  { expiresIn: '7d' }
);

console.log(token);
```

Use this token in the `Authorization: Bearer <TOKEN>` header.

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution**: Make sure MySQL is running and credentials in `.env` are correct

### JWT Error
```
Error: Invalid or expired token
```
**Solution**: Ensure you're sending a valid JWT token in `Authorization` header

### No orders found
**Solution**: Make sure you're using the correct user ID in token and viewing your own orders

## What's Next?

1. **Integrate with Cart Module** - Clear cart after checkout
2. **Integrate with Product Module** - Validate stock & reduce inventory
3. **Add Notifications** - Email/SMS on order events
4. **Add Tests** - Unit & integration tests
5. **Payment Integration** - Midtrans or Xendit

## Support

For more details:
- Check [ORDERS_MODULE.md](ORDERS_MODULE.md) for full documentation
- Review code comments in each file
- Check error messages for specific issues

---

**Happy Coding!
