#!/bin/bash
# API Testing Script
# Test all Order endpoints using curl

# Configuration
BASE_URL="http://localhost:3000"
JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIn0.YOUR_SIGNATURE"

echo "==================================="
echo "Order Module API Testing"
echo "==================================="
echo ""

# 1. Health Check
echo "1️⃣ Health Check"
echo "GET /health"
curl -X GET $BASE_URL/health
echo ""
echo ""

# 2. Create Order
echo "2️⃣ Create Order"
echo "POST /orders"
curl -X POST $BASE_URL/orders \
  -H "Authorization: Bearer $JWT_TOKEN" \
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
  }' | jq '.'
echo ""
echo ""
ORDER_ID=1  # Replace with actual order ID from response

# 3. Get All Orders
echo "3️⃣ Get User Orders"
echo "GET /orders"
curl -X GET "$BASE_URL/orders?page=1&limit=10" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'
echo ""
echo ""

# 4. Get Specific Order
echo "4️⃣ Get Order Detail"
echo "GET /orders/$ORDER_ID"
curl -X GET $BASE_URL/orders/$ORDER_ID \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'
echo ""
echo ""

# 5. Get Order History with Filter
echo "5️⃣ Get Order History (Filter by Status)"
echo "GET /orders/history?status=PAID"
curl -X GET "$BASE_URL/orders/history?status=PAID&page=1&limit=10" \
  -H "Authorization: Bearer $JWT_TOKEN" | jq '.'
echo ""
echo ""

# 6. Cancel Order
echo "6️⃣ Cancel Order"
echo "PUT /orders/$ORDER_ID/cancel"
curl -X PUT $BASE_URL/orders/$ORDER_ID/cancel \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo ""

echo "==================================="
echo "Testing Complete!"
echo "==================================="
