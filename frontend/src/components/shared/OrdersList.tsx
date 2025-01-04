import React, { useState } from "react";
import { Order } from "../../types/order";
import { Link } from "react-router-dom";

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
        <div className="max-w-4xl mx-auto space-y-8 px-4 lg:px-0">
        {orders.map((order) => (
                <div
                    key={order.id}
                    className="bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6"
                >
                    {/* Order Container*/}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div className="mb-4 md:mb-0 flex-grow">
                            <p className="font-medium text-base tracking-wide text-gray-900">Order ID: {order.id}</p>
                            <p className="text-sm text-gray-600">
                                Order Date: {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                            <p
                                className={`text-sm font-medium ${
                                    order.status === "completed"
                                        ? "text-green-600"
                                        : order.status === "canceled"
                                            ? "text-red-500"
                                            : "text-orange-500"
                                }`}

                            >
                                Status: {order.status.toUpperCase()}
                            </p>
                        </div>

                        <div className="flex flex-col items-start md:items-center flex-grow mb-4 md:mb-0">
                            <p className="text-sm">Total Items: {order.cartItems.length}</p>
                            <p className="text-sm font-bold text-gray-800">
                                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(order.totalPrice)}
                            </p>
                        </div>

                        <div className="text-right flex-none">
                            <button
                                onClick={() => toggleOrderDetails(order.id)}
                                className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
                            >
                                {expandedOrderId === order.id ? "Hide Details ▲" : "View Details ▼"}
                            </button>
                        </div>
                    </div>

                    {/* Order Details */}
                    {expandedOrderId === order.id && (
                        <div className="bg-gray-50 p-6 mt-4 rounded-md">
                        <p className="text-md font-medium">Items in Order:</p>
                            <ul className="list-none mt-3 space-y-2">
                            {order.cartItems.map((item) => (
                                    <li key={item.cartItemId} className="text-sm">
                                        <Link
                                            to={`/shop/${item.productId}`}
                                            className="text-orange-600 font-medium hover:text-orange-700"
                                        >
                                            <strong>{item.productName}</strong>
                                        </Link>{" "}
                                        (x{item.quantity}) -{" "}
                                        {new Intl.NumberFormat("en-US", {
                                            style: "currency",
                                            currency: "USD",
                                        }).format(item.price)}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-4 border-t border-gray-200 pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-lg text-gray-800">Total Price</span>
                                    <span className="text-green-600 text-lg font-bold">
            {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(order.totalPrice)}
        </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1 text-right">(Including Delivery)</p>
                            </div>

                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default OrdersList;

