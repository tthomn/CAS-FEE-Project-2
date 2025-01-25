# User Tests (Usability Testing)

## 1. Overview
This document outlines potential usability tests designed to evaluate the core functionalities of the Bee Webshop, including user-facing features and the admin panel. These tests aim to ensure a seamless shopping experience for users and provide administrators with efficient tools for managing products and categories.

## 2. Test Scenarios

### User-Side Tests

- **Scenario 1**: Landing on the Home Page  
  **Objective**: Ensure users understand the site's purpose and locate the primary call-to-action.  
  **Action**: Open the homepage and identify the main CTA (e.g., "Shop Now").

- **Scenario 2**: Navigating to the Shop Page  
  **Objective**: Verify ease of access to the shop section.  
  **Action**: Navigate from the homepage to the shop page using the "Shop Now" button.

- **Scenario 3**: Browsing Categories  
  **Objective**: Evaluate the intuitiveness of category navigation.  
  **Action**: Select a category (e.g., "Honey," "Candles") and browse its products.

- **Scenario 4**: Viewing Product Details  
  **Objective**: Confirm product detail pages display necessary information.  
  **Action**: Click on a product to view its details (e.g., image, description, price, stock availability and customer ratings).

- **Scenario 5**: Adding a Product to the Cart  
  **Objective**: Test the functionality of the "Add to Cart" button.  
  **Action**: Add a product to the cart and observe the feedback (e.g., cart icon update or confirmation message).

- **Scenario 6**: Rating a Product  
  **Objective**: Ensure logged-in users can rate products and see the updated average rating.  
  **Action**: Log in and rate a product by selecting a star rating. Verify the rating is recorded and that users cannot rate the same product twice.

- **Scenario 7**: Viewing and Editing the Cart  
  **Objective**: Ensure users can view and modify their cart.  
  **Action**: 
  - Access the cart, update product quantities, and remove items. Verify the total price updates accordingly.
  - Verify the total price updates accordingly.
  
- **Scenario 8**: Proceeding to Checkout  
  **Objective**: Test the login requirement for the checkout process.  
  **Action**:
  - If the user is not logged in, display a popup asking them to log in.
  - Redirect the user to the login page if they click "Go to Login."

- **Scenario 9**: Viewing Order History  
  **Objective**: Ensure users can view their order history and details for each order.  
  **Action**:
  - Log in and navigate to the "Account" tab.
  - Click on the "Orders" tab in the sidebar to view all orders.
  - Select the most recent order and press "View Details."

- **Scenario 10**: Completing the Order  
  **Objective**: Verify the final steps of placing an order and validate email confirmation.  
  **Action**:
  - Place an order after logging in.
  - Confirm that the user receives a clear order confirmation on the website with details like order number, total amount, and delivery expectations.
  - Check that the user receives an order confirmation email to the registered email address.

- **Scenario 11**: Switching Between Login and Registration  
  **Objective**: Test the functionality of switching between login and registration modes.  
  **Action**:
  - On the login page, click "Switch to Register" and fill in the registration form.
  - Verify error handling for invalid inputs and ensure successful account creation.

- **Scenario 12**: Validating Stock Quantity During Checkout
  **Objective**: Ensure users cannot exceed available product stock when updating the quantity in the cart.  
  **Action**:
  - Add a product to the cart with a quantity greater than the available stock.
  - Attempt to proceed to checkout.
  - Verify that an error message is displayed, indicating the insufficient stock.
  - Ensure that the user remains on the cart page and is prevented from proceeding to checkout until the cart quantities are adjusted to be within available stock limits.

- **Scenario 13**: Restoring Password  
  **Objective**: Ensure users can restore their password if they forget it.  
  **Action**:
  - On the login page, click "Forgot Password?"
  - Enter the email address associated with the user account.
  - Click "Restore My Password."
  - Check the inbox of the entered email address for a password reset email.
  - Follow the link in the email and set a new password.  
    **Expected Behavior**:
  - Users receive a password reset email shortly after clicking "Restore My Password."
  - The email contains a secure link to reset the password.
  - Users can successfully set a new password and log in with it.

---

### Admin-Side Tests

- **Scenario 14**: Accessing the Admin Panel  
  **Objective**: Verify that only users with admin privileges can access the admin panel.  
  **Action**: Attempt to navigate to `/admin` as a non-admin user.  
  **Expected Behavior**:
  - Non-admin users are redirected to the login page.

- **Scenario 15**: Adding a New Product  
  **Objective**: Test the functionality of adding a new product.  
  **Action**:
  - Log in as an admin.
  - Enter product details (e.g., name, price, stock, category, description, keywords).
  - Upload an image for the product.
  - Click "Add Product."  
    **Expected Behavior**:
  - The product is added successfully and appears in the product list.
  - Validation errors are shown for missing or invalid fields.

- **Scenario 16**: Editing an Existing Product  
  **Objective**: Ensure admins can edit product details.  
  **Action**:
  - Select a product from the list and click "Edit."
  - Modify details such as name, price, stock, and category.
  - Save changes.  
    **Expected Behavior**:
  - Changes are reflected immediately in the product list.

- **Scenario 17**: Deleting a Product  
  **Objective**: Verify the ability to delete a product.  
  **Action**:
  - Select a product from the list and click "Delete."
  - Confirm the deletion action.  
    **Expected Behavior**:
  - The product is removed from the product list and database.

- **Scenario 18**: Managing Categories  
  **Objective**: Test category management functionality.  
  **Action**:
  - Add a new category by clicking "Add New Category."
  - Assign a product to the new category.
  - Attempt to add a category that already exists.  
    **Expected Behavior**:
  - Duplicate categories are not allowed, and an error message is displayed.
  - New categories appear in the category dropdown and can be assigned to products.

- **Scenario 19**: Validation for Product Details  
  **Objective**: Verify that all important product fields are validated during creation and editing.  
  **Action**:
  - Attempt to add a product with missing or invalid fields (e.g., empty name, negative price).  
    **Expected Behavior**:
  - Validation errors are displayed, and the product is not added/updated until all errors are resolved.

---

## 3. Note
These usability tests are provided as a framework for potential future evaluations. They are included as an additional component to demonstrate the thought process behind ensuring a user-friendly design for both users and administrators.
