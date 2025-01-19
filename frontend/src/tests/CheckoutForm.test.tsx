import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import CheckoutForm from '../components/checkout/CheckoutForm';

describe('CheckoutForm', () => {
    const mockOnCheckout = jest.fn();

    beforeEach(() => {
        mockOnCheckout.mockClear();
    });

    test('renders correctly when loggedInEmail is not provided', () => {
        render(<CheckoutForm onCheckout={mockOnCheckout} />);
        
        expect(screen.getByText('Checkout')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    });

    test('shows error messages when form is submitted with empty fields', () => {
        render(<CheckoutForm onCheckout={mockOnCheckout} />);
        
        fireEvent.click(screen.getByText('Place Order'));
        
        expect(screen.getByText('Email address is required.')).toBeInTheDocument();
        expect(screen.getByText('Shipping address is required.')).toBeInTheDocument();
        expect(mockOnCheckout).not.toHaveBeenCalled();
    });

    test('calls onCheckout with correct data when form is valid', () => {
        render(<CheckoutForm onCheckout={mockOnCheckout} />);
        
        fireEvent.change(screen.getByPlaceholderText('Enter your email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Enter your address'), { target: { value: '123 Test St' } });
        fireEvent.click(screen.getByText('Place Order'));
        
        expect(mockOnCheckout).toHaveBeenCalledWith('test@example.com', '123 Test St');
    });

    test('does not show email input when loggedInEmail is provided', () => {
        render(<CheckoutForm onCheckout={mockOnCheckout} loggedInEmail="test@example.com" />);
        
        expect(screen.queryByPlaceholderText('Enter your email')).not.toBeInTheDocument();
    });
});