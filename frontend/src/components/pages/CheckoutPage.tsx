import emailjs from '@emailjs/browser';
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { addDocToCollection } from '../../services/firebase/firestoreService';
import {
  createDocRef,
  decrementStock,
  getData,
} from '../../services/firebase/firestoreService';
import { CartItem } from '../../types/cartItem';
import Modal from '../shared/Modal';

const CheckoutPage: React.FC = () => {
  const { cartItems, clearCart } = useCart();
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shippingFee = 5.2;

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const { authUser } = useAuth(); // Auth context for user email and ID
  const [email, setEmail] = useState(''); // To display the email

  const [isEditing, setIsEditing] = useState(false);
  const [backupData, setBackupData] = useState({
    name: '',
    surname: '',
    deliveryAddress: '',
  });
  const navigate = useNavigate();

  const fetchUserDetails = useCallback(async () => {
    try {
      setEmail(authUser?.userName || 'Keine E-Mail verfügbar');
      const fullAddress = `${authUser?.street || ''} ${authUser?.houseNumber || ''}, ${authUser?.zip || ''} ${authUser?.city || ''}`;
      setDeliveryAddress(fullAddress);
      setBillingAddress(fullAddress);
      setName(authUser?.name || '');
      setSurname(authUser?.surname || '');
      localStorage.setItem(
        'userDetails',
        JSON.stringify({
          name: authUser?.name,
          surname: authUser?.surname,
          deliveryAddress: fullAddress,
        }),
      );
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  }, [authUser]);

  // Load saved data on mount
  useEffect(() => {
    const savedDetails = localStorage.getItem('userDetails');
    if (savedDetails) {
      const { name, surname, deliveryAddress } = JSON.parse(savedDetails);
      setName(name || '');
      setSurname(surname || '');
      setDeliveryAddress(deliveryAddress || '');
    } else if (authUser?.id) {
      fetchUserDetails();
    }
  }, [authUser, fetchUserDetails]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!deliveryAddress.trim()) {
      newErrors.deliveryAddress = 'Die Lieferadresse darf nicht leer sein.';
    }
    if (!name.trim()) {
      newErrors.name = 'Vorname darf nicht leer sein.';
    }
    if (!surname.trim()) {
      newErrors.surname = 'Nachname darf nicht leer sein.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const sendInvoiceEmail = async (order: any, orderId: string) => {
    const emailParams = {
      to_name: email,
      to_email: email,
      order_id: orderId,
      delivery_address: order.deliveryAddress,
      billing_address: order.billingAddress,
      total_price: order.totalPrice.toFixed(2),
      items: order.cartItems
        .map(
          (item: CartItem) =>
            `${item.productName} (x${item.quantity}): CHF ${(item.price * item.quantity).toFixed(2)}`,
        )
        .join('\n'),
    };
    try {
      await emailjs.send(
        'service_ua1imoh',
        'template_qdffusf',
        emailParams,
        'LhmWwd3pEmYkAMNKW',
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error sending invoice email:', error.message);
      } else {
        console.error('Error sending invoice email');
      }
      throw new Error(
        'Failed to send email. Please check the logs for details.',
      );
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const order = {
        deliveryAddress,
        billingAddress: billingAddress || deliveryAddress,
        email: authUser?.userName,
        name,
        surname,
        cartItems,
        totalPrice: totalPrice + shippingFee,
        createdAt: new Date().toISOString(),
        status: 'pending',
        userId: authUser?.id || 'guest',
      };

      const stockValidationAndUpdatePromises = cartItems.map(async (item) => {
        const productDocRef = await createDocRef('products', item.productId);
        const productDoc = await getData(productDocRef);

        if (productDoc.exists()) {
          const productData = productDoc.data();
          const updatedStock = productData.stock - item.quantity;

          if (updatedStock < 0) {
            throw new Error(
              `${item.productName} has insufficient stock. Available: ${productData.stock}, Requested: ${item.quantity}`,
            );
          }
          await decrementStock(item.productId, item.quantity);
        } else {
          throw new Error(`Product ${item.productName} does not exist.`);
        }
      });

      await Promise.all(stockValidationAndUpdatePromises);

      const docRef = await addDocToCollection('orders', order);

      await sendInvoiceEmail(order, docRef);

      await clearCart();
      localStorage.removeItem('userDetails');

      setIsModalOpen(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message, {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'colored',
        });
      } else {
        toast.error('Stock validation or update failed. Please try again.', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: 'colored',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDetails = () => {
    localStorage.setItem(
      'userDetails',
      JSON.stringify({ name, surname, deliveryAddress }),
    );
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setName(backupData.name);
    setSurname(backupData.surname);
    setDeliveryAddress(backupData.deliveryAddress);
    setIsEditing(false);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
        Shipping and invoice
      </h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-bold">Personal Data</h2>
          <div className="mb-4 block">
            <strong>First name:</strong>
            {!isEditing ? (
              <p>{name || 'Not specified'}</p>
            ) : (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded border p-2"
                placeholder="Vorname eingeben"
              />
            )}
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>
          <div className="mb-4 block">
            <strong>Last name:</strong>
            {!isEditing ? (
              <p>{surname || 'Not specified'}</p>
            ) : (
              <input
                type="text"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                className="mt-2 w-full rounded border p-2"
                placeholder="Nachname eingeben"
              />
            )}
            {errors.surname && (
              <p className="text-sm text-red-500">{errors.surname}</p>
            )}
          </div>
          {/*<div className="block mb-4">*/}
          {/*    <strong>E-Mail-Adresse:</strong>*/}
          {/*    <p>{email || "Keine E-Mail verfügbar"}</p>*/}
          {/*</div>*/}
          <div className="mb-4 block">
            <strong>Delivery address:</strong>
            {!isEditing ? (
              <p>{deliveryAddress || 'Keine Angabe'}</p>
            ) : (
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="mt-2 w-full rounded border p-2"
                placeholder="Lieferadresse eingeben"
              />
            )}
            {errors.deliveryAddress && (
              <p className="text-sm text-red-500">{errors.deliveryAddress}</p>
            )}
          </div>
          <div className="mt-4 flex gap-4">
            {!isEditing ? (
              <button
                onClick={() => {
                  setBackupData({ name, surname, deliveryAddress });
                  setIsEditing(true);
                }}
                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                Edit data
              </button>
            ) : (
              <>
                <button
                  onClick={handleSaveDetails}
                  className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
        <div>
          <h2 className="mb-4 text-lg font-bold">Summary</h2>
          <ul className="mb-4">
            {cartItems.map((item) => (
              <li key={item.id} className="mb-4 flex justify-between">
                <span>
                  {item.productName}{' '}
                  <span className="text-black">({item.quantity} Stück)</span>
                </span>
                <span>CHF {item.price.toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between">
              <span>Cost without shipping</span>
              <span>CHF {totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipment</span>
              <span>CHF {shippingFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>CHF {(totalPrice + shippingFee).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-between">
        <Link
          to="/cart"
          className="rounded bg-gray-500 px-6 py-2 text-white transition hover:bg-gray-600"
        >
          Back to the shopping cart
        </Link>
        <button
          className={`rounded bg-red-500 px-6 py-2 text-white ${
            isLoading ? 'cursor-not-allowed opacity-50' : 'hover:bg-red-600'
          }`}
          onClick={handlePlaceOrder}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Complete order'}
        </button>
      </div>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            navigate('/shop');
          }}
          message="Your order has been completed successfully! An invoice has been sent via email."
        />
      )}
    </div>
  );
};

export default CheckoutPage;
