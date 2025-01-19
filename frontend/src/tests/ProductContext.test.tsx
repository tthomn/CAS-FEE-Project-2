import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { ProductProvider, useProduct } from "../context/ProductContext";
import { getCollectionData } from "../services/firebase/firestoreService";
import { Product } from "../types/product";

jest.mock("../services/firebase/firestoreService", () => ({
  getCollectionData: jest.fn(),
}));

/**
 * A simple test component to consume the context values
 */
const TestConsumer: React.FC = () => {
  const { products, productsLoading, productsError, fetchProducts } = useProduct();

  React.useEffect(() => {
    // We'll call fetchProducts in different tests   
  }, [fetchProducts]);

  return (
    <div>
      {productsLoading && <p data-testid="loading">Loading...</p>}
      {productsError && <p data-testid="error">{productsError}</p>}
      {products.map((product) => (
        <div key={product.id} data-testid="product-name">
          {product.name}
        </div>
      ))}
    </div>
  );
};

describe("ProductContext and useProduct Hook", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders children and provides default context values", () => {
    // Render TestConsumer inside the provider
    render(
      <ProductProvider>
        <TestConsumer />
      </ProductProvider>
    );

    // Default: no products, no error, not loading
    expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    expect(screen.queryByTestId("error")).not.toBeInTheDocument();
    expect(screen.queryAllByTestId("product-name")).toHaveLength(0);
  });

  it("fetches products successfully (without categoryId) and updates state", async () => {
    const mockProducts: Product[] = [
      { id: "1", name: "Product A", categoryId: "cat1", price: 10, weight: 1, imageUrl: "http://example.com", stock: 10 },
      { id: "2", name: "Product B", categoryId: "cat2" , price: 20, weight: 2, imageUrl: "http://example.com", stock: 20 },
    ];
  
    // Force the mocked function to resolve with data
    (getCollectionData as jest.Mock).mockResolvedValue(mockProducts);
  
    // ConsumerWithFetch triggers fetch, but doesn't render anything
    const ConsumerWithFetch: React.FC = () => {
      const { fetchProducts } = useProduct();
  
      React.useEffect(() => {
        fetchProducts(null);
      }, [fetchProducts]);
  
      return null;
    };
  
    render(
      <ProductProvider>
        <ConsumerWithFetch />
        <TestConsumer />
      </ProductProvider>
    );
  
    // Check loading state is displayed initially
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  
    // Wait for the fetch to complete & the products to render
    await waitFor(() => {
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });
  
    // Verify products are rendered
    const productElements = screen.getAllByTestId("product-name");
    expect(productElements).toHaveLength(mockProducts.length);
    expect(productElements[0]).toHaveTextContent("Product A");
    expect(productElements[1]).toHaveTextContent("Product B");
  
    // Also ensure getCollectionData was called with an empty array for constraints
    expect(getCollectionData).toHaveBeenCalledWith("products", []);
  });

  it("fetches products successfully (with categoryId) and applies constraints", async () => {
    const mockCategoryId = "cat1";
    const mockProducts: Product[] = [
      { id: "1", name: "Product A", categoryId: "cat1", price: 10, weight: 1, imageUrl: "http://example.com", stock: 10 },
    ];

    (getCollectionData as jest.Mock).mockResolvedValue(mockProducts);

    const ConsumerWithFetch: React.FC = () => {
      const { fetchProducts } = useProduct();

      React.useEffect(() => {
        // Pass the categoryId
        fetchProducts(mockCategoryId);
      }, [fetchProducts]);

      return null;
    };

    render(
      <ProductProvider>
        <ConsumerWithFetch />
        <TestConsumer />
      </ProductProvider>
    );

    // Wait for the fetch to complete
    await waitFor(() => {
      const productElements = screen.getAllByTestId("product-name");
      expect(productElements).toHaveLength(1);
      expect(productElements[0]).toHaveTextContent("Product A");
    });

    // Ensure getCollectionData was called with a where constraint
    expect(getCollectionData).toHaveBeenCalledTimes(1);
    const constraints = (getCollectionData as jest.Mock).mock.calls[0][1];
    expect(constraints).toHaveLength(1);

  });

  it("handles errors during fetch", async () => {
    const mockErrorMessage = "Failed to load products. Please try again.";
    (getCollectionData as jest.Mock).mockRejectedValue(new Error("Firestore error"));

    const ConsumerWithFetch: React.FC = () => {
      const { fetchProducts } = useProduct();

      React.useEffect(() => {
        fetchProducts(null);
      }, [fetchProducts]);

      return null;
    };

    render(
      <ProductProvider>
        <ConsumerWithFetch />
        <TestConsumer />
      </ProductProvider>
    );

    // Wait for error state
    await waitFor(() => {
      // The error message is rendered
      expect(screen.getByTestId("error")).toHaveTextContent(mockErrorMessage);
    });

    // No products should be rendered
    expect(screen.queryAllByTestId("product-name")).toHaveLength(0);
  });
});
