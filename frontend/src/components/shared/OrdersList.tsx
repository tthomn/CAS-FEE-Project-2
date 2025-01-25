import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Order } from '../../types/order';

interface OrdersListProps {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

const OrdersList: React.FC<OrdersListProps> = ({ orders, loading, error }) => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  if (loading) {
    return <p className="text-gray-500">Loading orders...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (orders.length === 0) {
    return <p className="text-gray-500">No orders found.</p>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 lg:px-0">
      {orders.map((order) => (
        <div
          key={order.id}
          className="overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-lg transition-shadow hover:shadow-xl"
        >
          {/* Order Container */}
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="w-full md:w-1/2">
              <p className="break-words text-base font-medium tracking-wide text-gray-900">
                Order ID: <span className="block md:inline">{order.id}</span>
              </p>
              <p className="text-sm text-gray-600">
                Order Date: {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p
                className={`text-sm font-medium ${
                  order.status === 'completed'
                    ? 'text-green-600'
                    : order.status === 'canceled'
                      ? 'text-red-500'
                      : 'text-orange-500'
                }`}
              >
                Status: {order.status.toUpperCase()}
              </p>
            </div>

            <div className="flex w-full flex-col items-start md:w-1/4 md:items-center">
              <p className="text-sm">Total Items: {order.cartItems.length}</p>
              <p className="text-sm font-bold text-gray-800">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(order.totalPrice)}
              </p>
            </div>

            <div className="w-full text-right md:w-1/4">
              <button
                onClick={() => toggleOrderDetails(order.id)}
                className="font-medium text-gray-600 transition-colors duration-200 hover:text-blue-600"
              >
                {expandedOrderId === order.id
                  ? 'Hide Details ▲'
                  : 'View Details ▼'}
              </button>
            </div>
          </div>

          {/* Order Details */}
          {expandedOrderId === order.id && (
            <div className="mt-4 rounded-md bg-gray-50 p-6">
              <p className="text-md font-medium">Items in Order:</p>
              <ul className="mt-3 list-none space-y-2">
                {order.cartItems.map((item) => (
                  <li key={item.cartItemId} className="break-words text-sm">
                    <Link
                      to={`/shop/${item.productId}`}
                      className="font-medium text-orange-600 hover:text-orange-700"
                    >
                      <strong>{item.productName}</strong>
                    </Link>{' '}
                    (x{item.quantity}) -{' '}
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(item.price)}
                  </li>
                ))}
              </ul>
              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-800">
                    Total Price
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(order.totalPrice)}
                  </span>
                </div>
                <p className="mt-1 text-right text-sm text-gray-500">
                  (Including Delivery)
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default OrdersList;
