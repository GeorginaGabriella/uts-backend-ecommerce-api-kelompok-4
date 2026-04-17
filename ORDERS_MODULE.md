# Order & Transaction Module Documentation

## Overview
Complete implementation of the Order & Transaction (Checkout) module for the e-commerce system following Clean Architecture principles.

## Project Structure

```
src/
├── orders/
│   ├── domain/
│   │   ├── entities/           # Core business entities
│   │   │   ├── Order.js
│   │   │   └── OrderItem.js
│   │   └── interfaces/         # Repository contracts
│   │       └── IOrderRepository.js
│   ├── application/
│   │   ├── dtos/              # Data Transfer Objects
│   │   │   ├── CreateOrderDTO.js
│   │   │   └── OrderResponseDTO.js
│   │   └── usecases/          # Business logic
│   │       ├── CreateOrderUseCase.js
│   │       ├── GetOrderDetailUseCase.js
│   │       ├── GetOrderHistoryUseCase.js
│   │       ├── CancelOrderUseCase.js
│   │       └── index.js
│   ├── infrastructure/
│   │   ├── persistence/       # Data access
│   │   │   └── OrderRepository.js
│   │   └── database/          # Migrations
│   │       └── OrderMigration.js
│   ├── presentation/
│   │   ├── controllers/       # HTTP handlers
│   │   │   └── OrderController.js
│   │   └── routes/            # Route definitions
│   │       └── orderRoutes.js
│   └── OrderContext.js        # Dependency injection
├── config/
│   └── database.js            # Database configuration
├── middleware/
│   └── authMiddleware.js      # JWT authentication
└── app.js                      # Application entry point
```

## Architecture Pattern: Clean Architecture

The module follows Clean Architecture principles:

- **Domain Layer**: Pure business logic (entities, interfaces)
- **Application Layer**: Use cases and DTOs
- **Infrastructure Layer**: Database and external services
- **Presentation Layer**: HTTP controllers and routes

This separation ensures:
- Independence of frameworks
- Testability
- Flexibility in swapping implementations
- Clear separation of concerns

## API Endpoints

### 1. Create Order
```
POST /orders
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Request Body:
{
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
}

Response (201):
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": 1,
    "userId": 5,
    "totalPrice": 175000,
    "status": "PENDING_PAYMENT",
    "items": [
      {
        "id": 1,
        "productId": 1,
        "quantity": 2,
        "price": 50000,
        "subtotal": 100000
      }
    ],
    "createdAt": "2024-04-15T10:30:00Z",
    "updatedAt": "2024-04-15T10:30:00Z"
  }
}
```

### 2. Get Order Detail
```
GET /orders/:id
Authorization: Bearer <JWT_TOKEN>

Response (200):
{
  "success": true,
  "message": "Order retrieved successfully",
  "data": {
    "id": 1,
    "userId": 5,
    "totalPrice": 175000,
    "status": "PENDING_PAYMENT",
    "items": [...],
    "createdAt": "2024-04-15T10:30:00Z",
    "updatedAt": "2024-04-15T10:30:00Z"
  }
}
```

### 3. Get User Orders
```
GET /orders?status=PAID&page=1&limit=10
Authorization: Bearer <JWT_TOKEN>

Query Parameters:
- status (optional): PENDING_PAYMENT, PAID, or CANCELLED
- page (optional): default 1
- limit (optional): default 10, max 100

Response (200):
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": {
    "data": [...],
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

### 4. Get Order History
```
GET /orders/history?status=PAID&page=1&limit=10
Authorization: Bearer <JWT_TOKEN>

(Same as Get User Orders)
```

### 5. Cancel Order
```
PUT /orders/:id/cancel
Authorization: Bearer <JWT_TOKEN>

Response (200):
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "id": 1,
    "userId": 5,
    "totalPrice": 175000,
    "status": "CANCELLED",
    "createdAt": "2024-04-15T10:30:00Z",
    "updatedAt": "2024-04-15T10:31:00Z"
  }
}
```

## Database Schema

### Orders Table
```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING_PAYMENT',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

### Order Items Table
```sql
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order_id (order_id),
  INDEX idx_product_id (product_id)
);
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Run Migrations
```bash
npm run migrate
```

The migration will automatically create:
- `orders` table
- `order_items` table

### 4. Start Development Server
```bash
npm run dev
```

Server will run on `http://localhost:3000`

## Business Rules

### Order Creation
- User must be authenticated (JWT token required)
- Cart cannot be empty
- All items must have valid quantity (> 0)
- All items must have valid price (>= 0)
- Stock validation can be integrated with Product module
- Default status is `PENDING_PAYMENT`

### Get Order
- User can only view their own orders
- Returns 404 if order not found
- Returns 403 if accessing other user's order

### Order History
- Supports pagination (max 100 items per page)
- Optional status filtering
- Returns total count and page info
- Ordered by creation date (newest first)

### Cancel Order
- Only orders with `PENDING_PAYMENT` status can be cancelled
- User can only cancel their own orders
- Cancelled orders cannot be reversed
- Returns error if already paid

## Error Handling

The API uses standard HTTP status codes:

- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: User doesn't have permission
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Specific error 1", "Specific error 2"]  // Optional
}
```

## Integration Points

### With Cart Module
- Clear cart after successful order creation
- Use cart items to create order items

### With Product Module
- Validate product stock before checkout
- Reduce stock after order creation
- Restore stock if order is cancelled

### With Payment Module
- Update order status to `PAID` after successful payment
- Prevent order cancellation if already paid

### With Auth Module
- JWT token required for all endpoints
- Extract user ID from JWT claims

## Extension Points

The following features can be easily added:

1. **Order Status Tracking**
   - Add new statuses: `SHIPPED`, `DELIVERED`, `RETURNED`
   - Update `CancelOrderUseCase` to prevent cancellation on these statuses

2. **Notifications**
   - Send email/SMS when order created
   - Send email/SMS when order cancelled
   - Uncomment notification service calls in use cases

3. **Invoicing**
   - Generate PDF invoice for each order
   - Store invoice reference in database

4. **Refunds**
   - Create refund use case for completed orders
   - Track refund status

5. **Analytics**
   - Add query methods for order statistics
   - Track revenue by date/product/user

## Testing

To add tests, create files in `__tests__` directory:

```
__tests__/
├── orders/
│   ├── domain/
│   ├── application/
│   └── presentation/
```

Example test:
```javascript
const CreateOrderUseCase = require('../../src/orders/application/usecases/CreateOrderUseCase');
const CreateOrderDTO = require('../../src/orders/application/dtos/CreateOrderDTO');

describe('CreateOrderUseCase', () => {
  it('should create order successfully', async () => {
    // Test implementation
  });
});
```

Run tests:
```bash
npm test
```

## Performance Considerations

- Database indexes on frequently queried fields
- Pagination to limit large result sets
- Connection pooling for database
- Transaction support for data integrity
- Response time target < 500ms

## Security Features

- JWT authentication on all endpoints
- User isolation (can't access other user's orders)
- Input validation on all DTOs
- SQL parameter binding (prevents injection)
- Database constraints for data integrity

## Future Improvements (from PRD)

- [ ] Payment gateway integration (Midtrans/Xendit)
- [ ] Order status tracking (SHIPPED, DELIVERED)
- [ ] Invoice PDF download
- [ ] Email/WhatsApp notifications
- [ ] Real-time order tracking
- [ ] Admin order management panel
