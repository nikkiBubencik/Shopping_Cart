# Shopping Cart Application
CS 602 Term Project

This Application simulates a shopping cart for a merchant's website. Users can view a list of all products and search the products by their name and description as well as sort the products by increasing or decreasing prices. Users can view the product’s information and choose a quantity to add to their cart. They can then place the order buying all the items in their cart. Users can see all their previous orders and the products and quantities they bought. Admin can do everything a basic user can do and more. Admin have the ability to add a product, delete a product, and update a product’s information. Admin can view a list of all users and select a user to see all of their orders. Admins have the ability to edit an order by adding or removing products, or deleting an order altogether. When adding a product to a user’s cart or adding a product to an existing order the applications check that they are not adding more than they have in stock. The application supports the REST APIs and GraphQL endpoints for the list of products, users, orders, and more. PassportJS is used for customer registration and authentication. 

# Technologies Used:
-NodeJS and ExpressJs
-Mongoose/MongoDB
-GraphQL
-PassportJS

# Data Models:
Cart(user, Product, qty)
- Stores all the products, corresponding quantities, and which user has what products in their cart
- Products can appear multiple times in thai model
Order(_id, user, [{Product, qty}])
- Stores information on all orders, users can have multiple orders and many products in each order
Product(_id, name, description, price, qty)
-stores the product’s information
User(_id, name, username, password, role)
- stores the user information
- role is either ‘admin’ or ‘user’

# How to run
Run the following command to initialize the database
> node dbInit
Start the server by 
> node server
