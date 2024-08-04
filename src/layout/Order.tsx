import axios from 'axios';
import React, { useState, useEffect } from 'react';

const Order = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios('http://localhost:8000/orders/orderallpay', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrders(response.data);
                console.log(response.data);
            } catch (err) {
                console.log(`เกิดข้อผิดพลาด: ${err}`);
            }
        };
        fetchOrders();
    }, []);

    return (
        <div>
            {orders.map(order => (
                <div key={order.id} style={{ marginBottom: '20px', border: '1px solid #ddd', padding: '10px' }}>
                    {/* <h2>Order ID: {order.id}</h2> */}
                    <p>Status: {order.status}</p>
                    <p>Date: {new Date(order.date).toLocaleDateString()}</p>
                    <h3>Order Carts:</h3>
                    <ul>
                        {order.orderCarts.map(cart => (
                            <li key={cart.id} style={{ marginBottom: '10px', border: '1px solid #eee', padding: '5px' }}>
                                {/* <p>Cart ID: {cart.id}</p> */}
                                <p>Total: {cart.cartclone.total}</p>
                                <p>Price: {cart.cartclone.all_price}</p>
                                <p>Status: {cart.cartclone.status}</p>
                                {/* <p>Product ID: {cart.cartclone.productId}</p> */}
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <img src={cart.cartclone.product.image} alt={cart.cartclone.product.name} style={{ width: '100px', height: '100px', marginRight: '10px' }} />
                                    <div>
                                        <p>Product Name: {cart.cartclone.product.name}</p>
                                        <p>Category: {cart.cartclone.product.category}</p>
                                        <p>Price: {cart.cartclone.product.price}</p>
                                        <p>Store: {cart.cartclone.product.store}</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default Order;
