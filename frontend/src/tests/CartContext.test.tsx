import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartProvider, useCart } from "../context/CartContext"; 

import {
    getDocDataBy1Condition,
    getDocRefsBy1Condition,   
    addDocToCollection,
    updateDocByRef,
    deleteDocByRef,
  } from "../services/firebase/firestoreService";
  import { useAuth } from "../context/AuthContext";
  
/*
 * Mock: Firestore service functions
 */
jest.mock("../services/firebase/firestoreService", () => ({
  getDocDataBy1Condition: jest.fn(),
  getDocRefsBy1Condition: jest.fn(),
  getDocRefsBy2Condition: jest.fn(),
  addDocToCollection: jest.fn(),
  updateDocByRef: jest.fn(),
  deleteDocByRef: jest.fn(),
}));


/*
 * Mock AuthContext
 */
jest.mock("../context/AuthContext", () => ({
    useAuth: jest.fn(),
  }));
  

/**
 * Utility: default localStorage setup for  test.
 */
beforeEach(() => {
  jest.clearAllMocks();

  // By default, pretend the user is a guest
  (useAuth as jest.Mock).mockReturnValue({
    isAuthenticated: false,
    authUser: null,
  });

  localStorage.setItem("guestCart", JSON.stringify([]));
  localStorage.setItem("guestId", "test-guest-id"); // So it doesn't keep re-generating in tests
});

/** A small test component to consume CartContext */
function TestCartConsumer() {
  const {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice,
    updateQuantity,
  } = useCart();

  return (
    <div>
      <div data-testid="cart-length">{cartItems.length}</div>
      <div data-testid="total-items">{totalItems}</div>
      <div data-testid="total-price">{totalPrice}</div>

      <button
        data-testid="add-item"
        onClick={() =>
 
          addToCart({
            productId: "test-product",
            price: 100,
            quantity: 1,
          } as any)
          }
      >
        Add Item
      </button>

      <button
        data-testid="remove-item"
        onClick={() => removeFromCart("test-cart-item-id")}
      >
        Remove Item
      </button>

      <button data-testid="clear-cart" onClick={() => clearCart()}>
        Clear Cart
      </button>

      <button
        data-testid="update-quantity"
        onClick={() => updateQuantity("test-cart-item-id", 5)}
      >
        Update Quantity
      </button>
    </div>
  );
}

describe("CartContext", () => {
  test("initially renders empty for a guest user", async () => {
    // 1) The first call to `fetchCartItems` in useEffect => we return empty
    (getDocDataBy1Condition as jest.Mock).mockResolvedValueOnce([]);

    await act(async () => {
      render(
        <CartProvider>
          <TestCartConsumer />
        </CartProvider>
      );
    });

    // Expect cart to be empty
    expect(screen.getByTestId("cart-length")).toHaveTextContent("0");
  });

  test("adds an item for a guest user", async () => {
    // 1) On mount => returns empty cart from Firestore
    (getDocDataBy1Condition as jest.Mock)
      .mockResolvedValueOnce([]) // first call: no items
      // subsequent calls if fetchCartItems is triggered again
      .mockResolvedValue([]); 

    await act(async () => {
      render(
        <CartProvider>
          <TestCartConsumer />
        </CartProvider>
      );
    });

    await act(async () => {
      await userEvent.click(screen.getByTestId("add-item"));
    });

    expect(addDocToCollection).toHaveBeenCalledTimes(1);

    // The local state should show 1 item
    expect(screen.getByTestId("cart-length")).toHaveTextContent("1");
  });

  test("removes an item from the cart", async () => {
    (getDocDataBy1Condition as jest.Mock)
      .mockResolvedValueOnce([
        {
          cartItemId: "test-cart-item-id",
          productId: "test-product",
          price: 100,
          quantity: 1,
        },
      ]) // first call => 1 item
      .mockResolvedValue([]); // subsequent calls => empty

    // For remove, we also need docRefs for "cartItemId" == "test-cart-item-id"
    (getDocRefsBy1Condition as jest.Mock).mockResolvedValue([
      { id: "docRef1" },
    ]);

    await act(async () => {
      render(
        <CartProvider>
          <TestCartConsumer />
        </CartProvider>
      );
    });

    // Confirm the cart started with 1 item
    expect(screen.getByTestId("cart-length")).toHaveTextContent("1");

    // Remove the item
    await act(async () => {
      await userEvent.click(screen.getByTestId("remove-item"));
    });

    // Deletion call
    expect(deleteDocByRef).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("cart-length")).toHaveTextContent("0");
  });

  test("clears the cart", async () => {
    (getDocDataBy1Condition as jest.Mock)
      .mockResolvedValueOnce([
        {
          cartItemId: "test-cart-item-id",
          productId: "test-product",
          price: 100,
          quantity: 2,
        },
      ])
      .mockResolvedValue([]); // after clearing => empty

    // Suppose the cart has multiple docRefs
    (getDocRefsBy1Condition as jest.Mock).mockResolvedValue([
      { id: "docRef1" },
      { id: "docRef2" },
    ]);

    await act(async () => {
      render(
        <CartProvider>
          <TestCartConsumer />
        </CartProvider>
      );
    });

    // Initially 1 item in the cart
    expect(screen.getByTestId("cart-length")).toHaveTextContent("1");

    // Clear cart
    await act(async () => {
      await userEvent.click(screen.getByTestId("clear-cart"));
    });

    // Should delete docRef1 and docRef2
    expect(deleteDocByRef).toHaveBeenCalledTimes(2);

    // Now 0 items
    expect(screen.getByTestId("cart-length")).toHaveTextContent("0");
  });

  test("updates the quantity of an item", async () => {
    // Start with 1 item, quantity=1
    (getDocDataBy1Condition as jest.Mock)
      .mockResolvedValueOnce([
        {
          cartItemId: "test-cart-item-id",
          productId: "test-product",
          price: 100,
          quantity: 1,
        },
      ])
      .mockResolvedValue([]); // subsequent calls => empty or something

    // For updateQuantity => docRef
    (getDocRefsBy1Condition as jest.Mock).mockResolvedValue([
      { id: "docRef1" },
    ]);

    await act(async () => {
      render(
        <CartProvider>
          <TestCartConsumer />
        </CartProvider>
      );
    });

    // Initially totalItems should be 1
    expect(screen.getByTestId("total-items")).toHaveTextContent("1");
    expect(screen.getByTestId("total-price")).toHaveTextContent("100");

    // Click update
    await act(async () => {
      await userEvent.click(screen.getByTestId("update-quantity"));
    });

    // Updated doc in Firestore
    expect(updateDocByRef).toHaveBeenCalledTimes(1);

    // Now totalItems=5 => totalPrice=5*100=500
    expect(screen.getByTestId("total-items")).toHaveTextContent("5");
    expect(screen.getByTestId("total-price")).toHaveTextContent("500");
  });

  test("handles authenticated user scenario", async () => {
    // Switch to authenticated user
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      authUser: { id: "mockUserId" },
    });

    // Firestore has 2 items for this user
    (getDocDataBy1Condition as jest.Mock).mockResolvedValueOnce([
      {
        cartItemId: "abc123",
        userId: "mockUserId",
        productId: "test-product-1",
        price: 200,
        quantity: 2,
      },
      {
        cartItemId: "xyz789",
        userId: "mockUserId",
        productId: "test-product-2",
        price: 50,
        quantity: 1,
      },
    ]);

    await act(async () => {
      render(
        <CartProvider>
          <TestCartConsumer />
        </CartProvider>
      );
    });

    expect(screen.getByTestId("cart-length")).toHaveTextContent("2");
    expect(screen.getByTestId("total-items")).toHaveTextContent("3");
    expect(screen.getByTestId("total-price")).toHaveTextContent("450");
  });
  test("adds a new item to the cart for a guest user", async () => {
    // Mock Firestore responses
    (getDocDataBy1Condition as jest.Mock).mockResolvedValueOnce([]); // Always return an array
    (addDocToCollection as jest.Mock).mockResolvedValueOnce(undefined); // Adding item resolves successfully
  
    // Render the provider and consumer
    await act(async () => {
      render(
        <CartProvider>
          <TestCartConsumer />
        </CartProvider>
      );
    });
  
    // Verify initial state
    expect(screen.getByTestId("cart-length")).toHaveTextContent("0");
  
    // Add an item to the cart
    await act(async () => {
      await userEvent.click(screen.getByTestId("add-item"));
    });
  
    // Wait for state updates
    await waitFor(() => {
      // Verify Firestore interaction
      expect(addDocToCollection).toHaveBeenCalledTimes(1);
      expect(addDocToCollection).toHaveBeenCalledWith("cart", expect.objectContaining({
        productId: "test-product",
        price: 100,
        quantity: 1,
      }));
  
      // Verify UI state
      expect(screen.getByTestId("cart-length")).toHaveTextContent("1");
    });
  
    // Verify localStorage sync
    const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
    expect(guestCart).toHaveLength(1);
    expect(guestCart[0]).toMatchObject({
      productId: "test-product",
      price: 100,
      quantity: 1,
    });
  });
  
  
  
});