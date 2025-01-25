import React, { useState, useEffect } from 'react';

interface CheckoutFormProps {
  onCheckout: (email: string, address: string) => void;
  loggedInEmail?: string | null;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  onCheckout,
  loggedInEmail,
}) => {
  const [email, setEmail] = useState(loggedInEmail || '');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<{ email?: string; address?: string }>(
    {},
  );

  useEffect(() => {
    if (loggedInEmail) {
      setEmail(loggedInEmail);
    }
  }, [loggedInEmail]);

  const validateForm = () => {
    const newErrors: { email?: string; address?: string } = {};
    if (!email.trim()) newErrors.email = 'Email address is required.';
    if (!address.trim()) newErrors.address = 'Shipping address is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onCheckout(email, address);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <h2 className="mb-4 text-xl font-bold">Checkout</h2>

      {!loggedInEmail && (
        <label className="mb-4 block">
          Email Address:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="mt-2 w-full border p-2"
            required
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </label>
      )}

      <label className="mb-4 block">
        Shipping Address:
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your address"
          className="mt-2 w-full border p-2"
          required
        />
        {errors.address && (
          <p className="text-sm text-red-500">{errors.address}</p>
        )}
      </label>

      <button
        type="submit"
        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Place Order
      </button>
    </form>
  );
};

export default CheckoutForm;
