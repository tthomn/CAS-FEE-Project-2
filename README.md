# Bee Products Web Shop

[**Live App on Firebase**](https://beeproductswebshop.web.app/)
***Honey Hive Treasures*** is an online storefront designed to sell a variety of bee-related products such as honey, soaps, candles, and more.

## Table of Contents

- [Key Features](#features)
- [Getting Started](#getting-started)
    - [Installation](#installation)
- [Access the Application](#access-the-application)
- [Firebase Functions](#firebase-functions)

---

## Features

- **User Management**
    - Customer registration and login
    - Profile management 
    - Forgot password option
  
- **Shop Management**
    - Admin User:
        - Adding new product
        - Modifying existing product
        - Delete product
        - Manage product categories (e.g., Wildflower Honey, Beeswax Candles)
        - Inventory tracking

- **Shopping Cart & Checkout**
    - Add products to cart
    - Validation if propduct is in stock
    - Secure checkout process
    - Order history for customers
    - Search for Products

- **Responsive Design**
    - Optimized for mobile and desktop devices using Tailwind CSS

---

## Getting Started

Follow these instructions to set up and run the project locally.


### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/tthomn/CAS-FEE-Project-2.git

### Navigate to the directory frontend directory

`cd yourPath/frontend`

### Install Dependencies

`npm install`

### Run the App

`npm start`

### Unit-Tests

`npm run test`

### Access the Application

You can access the live version of **Honey Hive Treasures** here:

[**Live App on Firebase**](https://beeproductswebshop.web.app/)

Alternatively, if you’re running the app locally, open your browser and navigate to:

`http://localhost:3000`

### Firebase Functions

At: `cd yourPath/frontend/functions` this project includes the following Firebase Functions:

### 1. `cartCollectionCleaner`

- **Type**: Scheduled Function
- **Description**: Automatically deletes cart items in the `cart` collection that:
  - Are older than 14 days.
  - Have a `guestId`.
- **Schedule**: Runs every 14 days (336 hours)
- **Use Case**: Ensures the database is kept clean by removing abandoned guest user cart items.

---

### 2. `setAdditionalUserData`

- **Type**: Callable Function
- **Description**: Writes the users data to the `users` collection on registration. Fields include:
  - `name`, `surname`, `authType`,`title`, `dob`, `street`, `houseNumber`, `zip`, `city`, `country`, and `email`.
- **Use Case**: Savely adds new user to the collection 

---

### 3. `setAdmin`

- **Type**: Callable Function
- **Description**: Grants administrative privileges to a user if their `authType` in the `users` collection is `admin`.
- **Security**:
  - Validates the user's `authType` before assigning admin rights.
  - Ensures only eligible users receive admin privileges.
- **Use Case**: Allows administrators to manage restricted areas of the application.

---


