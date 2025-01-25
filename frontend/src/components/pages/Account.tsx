import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDocDataBy1Condition } from '../../services/firebase/firestoreService';
import { Order } from '../../types/order';
import Footer from '../layouts/Footer';
import CountryDropdown from '../shared/CountryDropdown';
import OrdersList from '../shared/OrdersList';
import UserInfo from '../shared/UserInfo';

const Account: React.FC = () => {
  const { user, login, register, resetPassword, logout, loading } = useAuth();
  const [formData, setFormData] = useState<{
    email: string;
    password: string;
    confirmPassword: string;
    title: string;
    name: string;
    surname: string;
    dob: string;
    street: string;
    houseNumber: string;
    zip: string;
    city: string;
    country: string | { value: string; label: string };
    authType: string;
  }>({
    email: '',
    password: '',
    confirmPassword: '',
    title: '',
    name: '',
    surname: '',
    dob: '',
    street: '',
    houseNumber: '',
    zip: '',
    city: '',
    country: '',
    authType: 'user',
  });

  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showOrders, setShowOrders] = useState(false);

  const { authUser } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.uid) return;
      setOrdersLoading(true);
      try {
        const fetchedOrders = await getDocDataBy1Condition<Order>(
          'orders',
          'userId',
          '==',
          user.uid,
        );
        setOrders(fetchedOrders);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setOrdersError('Failed to fetch orders: ' + error.message);
        } else {
          console.error('Non-standard error:');
        }
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [user?.uid]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    const isRequired = (value: string, fieldName: string) =>
      value.trim() ? '' : `${fieldName} is required`;

    const emailError =
      isRequired(formData.email, 'Email') ||
      (!formData.email.includes('@') ? 'Invalid email address' : '');
    if (emailError) newErrors.email = emailError;

    const passwordError = isRequired(formData.password, 'Password');
    if (passwordError) newErrors.password = passwordError;

    if (isRegistering) {
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      ['name', 'surname', 'street', 'houseNumber', 'zip', 'city'].forEach(
        (field) => {
          const fieldValue = formData[field as keyof typeof formData]; // Type-safe lookup
          const fieldError = isRequired(
            fieldValue as string,
            field.charAt(0).toUpperCase() + field.slice(1),
          );
          if (fieldError) newErrors[field] = fieldError;
        },
      );

      if (!formData.country || formData.country === '') {
        newErrors.country = 'Country is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setMessage('');
    setAuthLoading(true);

    const isValid = validateForm();

    if (!isValid) {
      setAuthLoading(false);
      return;
    }
    try {
      if (isRegistering) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        const countryName =
          typeof formData.country === 'string'
            ? formData.country
            : formData.country?.label || '';

        await register(formData.email, formData.password, {
          title: formData.title,
          name: formData.name,
          surname: formData.surname,
          dob: formData.dob,
          street: formData.street,
          houseNumber: formData.houseNumber,
          zip: formData.zip,
          city: formData.city,
          country: countryName,
          authType: formData.authType,
          addedAt: new Date(),
          email: formData.email,
        });

        setMessage('Registration successful! Please verify your email.');
      } else {
        await login(formData.email, formData.password);
        setMessage('Login successful!');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(error.message || 'An unknown error occurred');
      } else {
        setMessage('An unknown error occurred');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setMessage('');
    try {
      await resetPassword(formData.email);
      setMessage('Password reset email sent. Please check your inbox.');
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage('An unknown error occurred');
      }
    }
  };

  const handleLogout = async () => {
    setMessage('');
    try {
      await logout();
      localStorage.removeItem('userDetails');
      setMessage('Logged out successfully!');
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage('Failed to log out.');
      }
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fff8e1]">
      {/* Banner Section */}
      <div className="relative">
        <img
          src="/images/banner_account.png"
          alt="Account Banner"
          className="h-40 w-full object-cover sm:h-64"
          loading="eager"
        />
        <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-2xl font-bold text-white sm:text-4xl">
          My Account
        </h1>
      </div>

      <button
        className="rounded bg-yellow-500 p-2 text-white sm:hidden"
        onClick={() => setShowSidebar(!showSidebar)}
      >
        {showSidebar ? 'Close Menu' : 'Menu'}
      </button>

      <main className="flex-grow">
        <div className="mx-auto flex max-w-full flex-col sm:max-w-6xl sm:flex-row">
          {/* Sidebar */}
          {user && (
            <div
              className={`${
                showSidebar ? 'block' : 'hidden'
              } w-full border-r border-gray-300 p-4 sm:block sm:w-1/4`}
            >
              <h2 className="mb-6 text-center text-xl font-semibold text-gray-800 sm:text-left">
                Account
              </h2>
              <ul className="space-y-4 text-center sm:text-left">
                <li
                  className={`cursor-pointer ${!showOrders ? 'font-semibold text-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
                  onClick={() => setShowOrders(false)}
                >
                  Profile
                </li>
                <li
                  className={`cursor-pointer ${showOrders ? 'font-semibold text-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
                  onClick={() => setShowOrders(true)}
                >
                  Orders
                </li>

                {authUser?.authType === 'admin' && (
                  <li className="cursor-pointer text-gray-600 hover:text-blue-500">
                    <Link to="/admin" className="block">
                      Admin Page
                    </Link>
                  </li>
                )}

                <li
                  className="cursor-pointer text-gray-600 hover:text-blue-500"
                  onClick={handleLogout}
                >
                  Log Out
                </li>
              </ul>
            </div>
          )}

          {/* Login/Account Content */}
          <div className={`flex-1 ${user ? 'p-4 sm:p-6' : ''}`}>
            <div
              className={`mx-auto ${user ? 'max-w-full p-4 sm:p-6' : 'max-w-md p-4'} text-center`}
            >
              {isForgotPassword ? (
                <>
                  <h2 className="mb-4 text-xl font-bold">Restore Password</h2>
                  <div className="mb-4">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mb-4 w-full rounded border p-2 focus:outline-none focus:ring focus:ring-yellow-500"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}

                  <button
                    onClick={handlePasswordReset}
                    className={`mb-4 w-full rounded bg-blue-500 p-2 text-white hover:bg-blue-600 sm:p-3 ${
                      authLoading ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                    disabled={authLoading || !formData.email.trim()}
                  >
                    {authLoading ? 'Sending...' : 'Restore My Password'}
                  </button>
                  <button
                    onClick={() => {
                      setIsForgotPassword(false);
                      setMessage('');
                    }}
                    className="mb-4 w-full rounded bg-gray-500 p-2 text-white hover:bg-gray-600 sm:p-3"
                  >
                    Back to Login
                  </button>
                  {message && <p className="mt-4 text-green-500">{message}</p>}
                </>
              ) : user ? (
                <div className="-mt-8 w-full px-12 py-4">
                  <></>

                  {showOrders ? (
                    <div>
                      <h2 className="mb-4 mt-0 text-2xl font-bold">
                        My Orders
                      </h2>
                      <OrdersList
                        orders={orders}
                        loading={ordersLoading}
                        error={ordersError}
                      />
                      <button
                        onClick={() => setShowOrders(false)}
                        className="mt-4 text-blue-500 hover:underline"
                      >
                        Back to Profile
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h2 className="mb-8 text-2xl font-bold">
                        My Information
                      </h2>
                      <div className="mx-auto w-full overflow-x-auto rounded-lg bg-white p-4 shadow-md sm:w-[90%] sm:p-6 lg:w-[85%]">
                        <div className="w-full break-words">
                          <UserInfo
                            authUser={authUser}
                            userEmail={
                              authUser?.userName || 'No email available'
                            }
                            loading={loading}
                            onLogout={handleLogout}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => setShowOrders(true)}
                        className="mt-4 text-blue-500 hover:underline"
                      >
                        View My Orders
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <h1 className="mb-4 text-2xl font-bold">
                    {isRegistering ? 'Register' : 'Login'}
                  </h1>
                  <div className="relative mb-4">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full rounded border p-2 focus:outline-none focus:ring focus:ring-yellow-500"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

                  <div className="relative mb-4">
                    <div className="mb-4">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full rounded border p-2 focus:outline-none focus:ring focus:ring-yellow-500"
                      />
                      {errors.password && (
                        <p className="text-sm text-red-500">
                          {errors.password}
                        </p>
                      )}
                    </div>

                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex cursor-pointer items-center justify-center text-gray-500"
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.34 1.36-1.02 2.623-1.92 3.682m-2.11 2.372A9.963 9.963 0 0112 19c-4.477 0-8.268-2.943-9.542-7-.34-1.36-1.02-2.623-1.92-3.682"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.98 8.29A10.024 10.024 0 0112 5c4.478 0 8.269 2.943 9.543 7-.34 1.361-1.02 2.624-1.92 3.682m-2.11 2.373A9.963 9.963 0 0112 19c-4.478 0-8.269-2.943-9.543-7a10.054 10.054 0 012.02-3.71m1.42-1.42l13.75 13.75"
                          />
                        </svg>
                      )}
                    </span>
                  </div>
                  {isRegistering && (
                    <>
                      <div className="relative mb-4">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm Password"
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              confirmPassword: e.target.value,
                            }))
                          }
                          className="w-full rounded border p-2 pr-10 focus:outline-none focus:ring focus:ring-yellow-500"
                        />
                        {errors.confirmPassword && (
                          <p className="text-sm text-red-500">
                            {errors.confirmPassword}
                          </p>
                        )}
                        <span
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute inset-y-0 right-3 flex cursor-pointer items-center text-gray-500"
                        >
                          {showConfirmPassword ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.34 1.36-1.02 2.623-1.92 3.682m-2.11 2.372A9.963 9.963 0 0112 19c-4.477 0-8.268-2.943-9.542-7-.34-1.36-1.02-2.623-1.92-3.682"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3.98 8.29A10.024 10.024 0 0112 5c4.478 0 8.269 2.943 9.543 7-.34 1.361-1.02 2.624-1.92 3.682m-2.11 2.373A9.963 9.963 0 0112 19c-4.478 0-8.269-2.943-9.543-7a10.054 10.054 0 012.02-3.71m1.42-1.42l13.75 13.75"
                              />
                            </svg>
                          )}
                        </span>
                      </div>
                      <div className="mb-4">
                        <div className="mb-4">
                          <input
                            type="text"
                            name="name"
                            placeholder="Name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full rounded border p-2 focus:outline-none focus:ring focus:ring-yellow-500"
                          />
                          {errors.name && (
                            <p className="text-sm text-red-500">
                              {errors.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="mb-4">
                          <input
                            type="text"
                            name="surname"
                            placeholder="Surname"
                            value={formData.surname}
                            onChange={handleInputChange}
                            className="w-full rounded border p-2 focus:outline-none focus:ring focus:ring-yellow-500"
                          />
                          {errors.surname && (
                            <p className="text-sm text-red-500">
                              {errors.surname}
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                  {isRegistering && (
                    <>
                      <div className="mb-4 text-left">
                        <label className="mb-2 block font-bold">Anrede</label>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="title"
                              value="Herr"
                              checked={formData.title === 'Herr'}
                              onChange={handleInputChange}
                              className="mr-2"
                            />
                            Herr
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="title"
                              value="Frau"
                              checked={formData.title === 'Frau'}
                              onChange={handleInputChange}
                              className="mr-2"
                            />
                            Frau
                          </label>
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="mb-4">
                          <input
                            type="text"
                            name="street"
                            placeholder="Street"
                            value={formData.street}
                            onChange={handleInputChange}
                            className="w-full rounded border p-2 focus:outline-none focus:ring focus:ring-yellow-500"
                          />
                          {errors.street && (
                            <p className="text-sm text-red-500">
                              {errors.street}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="mb-4">
                          <input
                            type="text"
                            name="houseNumber"
                            placeholder="House Number"
                            value={formData.houseNumber}
                            onChange={handleInputChange}
                            className="w-full rounded border p-2 focus:outline-none focus:ring focus:ring-yellow-500"
                          />
                          {errors.houseNumber && (
                            <p className="text-sm text-red-500">
                              {errors.houseNumber}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mb-4">
                        <input
                          type="text"
                          name="zip"
                          placeholder="Postal Code (ZIP)"
                          value={formData.zip}
                          onChange={handleInputChange}
                          className="w-full rounded border p-2 focus:outline-none focus:ring focus:ring-yellow-500"
                        />
                        {errors.zip && (
                          <p className="text-sm text-red-500">{errors.zip}</p>
                        )}
                      </div>
                      <div className="mb-4">
                        <input
                          type="text"
                          name="city"
                          placeholder="City"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="mb-2 w-full rounded border p-2 focus:outline-none focus:ring focus:ring-yellow-500"
                        />
                        {errors.city && (
                          <p className="text-sm text-red-500">{errors.city}</p>
                        )}
                      </div>
                      <div className="mb-4">
                        <CountryDropdown
                          value={
                            typeof formData.country === 'object' &&
                            formData.country !== null
                              ? formData.country
                              : { value: '', label: 'Select Country' }
                          }
                          onChange={(selectedOption) =>
                            setFormData((prevData) => ({
                              ...prevData,
                              country: selectedOption ?? {
                                value: '',
                                label: 'Select Country',
                              },
                            }))
                          }
                        />
                        {errors.country && (
                          <p className="text-sm text-red-500">
                            {errors.country}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                  <button
                    onClick={handleSubmit}
                    className={`mb-4 w-full rounded p-2 sm:p-3 ${
                      isRegistering ? 'bg-blue-500' : 'bg-green-500'
                    } text-white hover:bg-opacity-90`}
                    disabled={authLoading}
                  >
                    {authLoading
                      ? isRegistering
                        ? 'Registering...'
                        : 'Logging in...'
                      : isRegistering
                        ? 'Register'
                        : 'Login'}
                  </button>
                  {!isRegistering && (
                    <div className="mt-4">
                      <button
                        onClick={() => setIsForgotPassword(true)}
                        className="cursor-pointer border-none bg-transparent text-sm text-blue-600 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        setIsRegistering(!isRegistering);
                        setErrors({});
                        setFormData({
                          email: '',
                          password: '',
                          confirmPassword: '',
                          title: '',
                          name: '',
                          surname: '',
                          dob: '',
                          street: '',
                          houseNumber: '',
                          zip: '',
                          city: '',
                          country: '',
                          authType: 'user',
                        });
                      }}
                      className="cursor-pointer border-none bg-transparent text-sm text-blue-600 hover:underline"
                    >
                      {isRegistering ? '← Back to Login' : 'Switch to Register'}
                    </button>
                  </div>
                  {message && <p className="mt-4 text-red-500">{message}</p>}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Account;
