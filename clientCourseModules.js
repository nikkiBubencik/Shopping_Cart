import { ApolloClient, InMemoryCache, gql } 
  from "@apollo/client/core/core.cjs";

// const baseServerURL = "http://localhost:4000";

export const client = new ApolloClient({
  uri: '/graphql',
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'network-only',
    }
  }
});

// Get Cart Information
export const getCart = async(id) => {
  const QUERY_GET_USER_CART = `
    query ExampleQuery($id: String!) {
      getCart(id: $id) {
        product {
            _id
            name
            description
            price
        }
        qty
        }
      }
    
  `;
  try {
    const result = await client.query({
      query: gql(QUERY_GET_USER_CART),
      variables: { id: id }
    });

    return result.data;
  } catch (error) {
    console.error('Error fetching user cart:', error);
    throw new Error('Failed to fetch user cart');
  }

}
// See Orders for each User
export const lookupUserOrders = async (id) => {
	
	const QUERY_GET_USER_ORDERS = gql`
  query ExampleQuery($user: String) {
    userOrders(user: $user) {
      _id
      user
      products {
        product {
          _id
          name
          description
          price
        }
        qty
      }
    }
  }
`;

try {
    const result = await client.query({
      query: QUERY_GET_USER_ORDERS,
      variables: { user: id }
    });
    return result.data.userOrders;

  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw new Error('Failed to fetch user orders');
  }
};

// Get specific order information
export const getOrder = async (id) => {
    console.log("get order");
    const QUERY_GET_ORDER = gql`
  query ExampleQuery($id: String) {
    getOrder(id: $id) {
      _id
      user
      products {
        product {
            _id
            name
            description
        }
        qty
      }
    }
  }
`;

try {
    const result = await client.query({
      query: QUERY_GET_ORDER,
      variables: {id: id}
    });
    return result.data.getOrder;

  } catch (error) {
    console.error('Error fetching order:', error);
    throw new Error('Failed to fetch order');
  }
}

//Get All Users
export const lookupUsers = async () => {
	
	const QUERY_GET_USERS = gql`
  query ExampleQuery {
    getUsers {
      _id
      name
      role
    }
  }
`;

try {
    const result = await client.query({
      query: QUERY_GET_USERS,
    });
    return result.data.getUsers;

  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }
};

// Get All Products
export const getProducts = async () => {
	
	const QUERY_GET_ALL_PRODUCTS = 
		`query ExampleQuery {
		  getProducts {
		    _id
		    name
		    description 
            price
            qty
		  }
		}
		`;

	const result = await client.query({
	  query: gql(QUERY_GET_ALL_PRODUCTS)
	});

	return result.data;
};

// gets products from user's description search
export const lookupByProductDesc = async(desc, sort) => {

    const QUERY_PRODUCT_DESC = 
    `query ExampleQuery($desc: String, $sort: String) {
		  productDesc(desc: $desc, sort: $sort) {
		    _id
		    name
		    description 
        price
        qty
		  }
		}
		`;

    const result = await client.query({
        query: gql(QUERY_PRODUCT_DESC),
        variables: { desc, sort }
    });
    
    return result.data;
}
// find products by user's Name search
export const lookupByProductName = async(name, sort) => {

    const QUERY_PRODUCT_NAME = 
    `query ExampleQuery($name: String, $sort: String) {
		  productName(name: $name, sort: $sort) {
		    _id
		    name
		    description 
        price
        qty
		  }
		}
		`;

    const result = await client.query({
        query: gql(QUERY_PRODUCT_NAME),
        variables: { name, sort }
    });
    
    return result.data;
}

// get product information based on id
export const lookupByProduct = async(id) => {
    const QUERY_PRODUCT_ID = 
    `query ExampleQuery($id: String) {
		  product(id: $id) {
		    _id
		    name
		    description 
        price
        qty
		  }
		}
		`;

    const result = await client.query({
        query: gql(QUERY_PRODUCT_ID),
        variables: { id }
    });
    
    return result.data;
}

// delete a product
export const deleteProduct = async(id) => {
    const DELETE_ITEM_MUTATION = gql`
    mutation deleteProduct($id: String!) {
        deleteProduct(id: $id) {
        _id
        name
        description
        price
        }
    }
    `;

    const result = await client.mutate({
        mutation: DELETE_ITEM_MUTATION,
        variables: { id },
    });
  
}

// delte an order
export const deleteOrder = async(id) => {
    const DELETE_ORDER_MUTATION = gql`
    mutation deleteOrder($id: String!) {
        deleteOrder(id: $id) {
            success
        }
    }
    `;

    const result = await client.mutate({
        mutation: DELETE_ORDER_MUTATION,
        variables: { id },
    });
    
    return;
}

// add a new product
export const addProduct = async(newProduct) => {
    const {_id, name, desc, price, qty } = newProduct;
    const INSERT_ITEM_MUTATION = gql`
    mutation addProduct($_id: String, $name: String, $description: String, $price: Float, $qty: Int) {
        addProduct(_id: $_id, name: $name, description: $description, price: $price, qty: $qty) {
        _id
        name
        description
        price
        }
    }
    `;

    const result = await client.mutate({
        mutation: INSERT_ITEM_MUTATION,
        variables: { _id: _id, name: name, description: desc, price: price, qty: qty },
    });
  
}

// update product information
export const updateProduct = async (updatedProduct) => {
    const {_id, name, desc, price, qty } = updatedProduct;

    const UPDATE_ITEM_MUTATION = gql`
    mutation updateProduct($_id: String, $name: String, $description: String, $price: Float, $qty: Int) {
        updateProduct(_id: $_id, name: $name, description: $description, price: $price, qty: $qty) {
        _id
        name
        description
        price
        qty
        }
    }
    `;

    const result = await client.mutate({
        mutation: UPDATE_ITEM_MUTATION,
        variables: { _id: _id, name: name, description: desc, price: price, qty: qty },
    });
  
}

// delete a product from an order
export const updateOrderDel = async (updatedOrder) => {
    const { id, product, qty } = updatedOrder;
    const DELETE_FROM_ORDER_MUTATION = gql`
    mutation updateOrderAdd($id: String, $product: String, $qty: Int) {
        updateOrderDel(id: $id, product: $product, qty: $qty) {
            success
        }
    }
    `;

    const result = await client.mutate({
        mutation: DELETE_FROM_ORDER_MUTATION,
        variables: { id: id, product: product, qty: parseInt(qty, 10) },
    });
  
    return result.data.updateOrderDel;
}

// add a product to an existing order
export const updateOrderAdd = async (updatedOrder) => {
    const { id, product, qty } = updatedOrder;
    const ADD_TO_ORDER_MUTATION = gql`
    mutation updateOrderAdd($id: String, $product: String, $qty: Int) {
        updateOrderAdd(id: $id, product: $product, qty: $qty) {
        _id
        user
        products{
            product{
            _id
            name
            }
            qty
        }
        }
    }
    `;

    const result = await client.mutate({
        mutation: ADD_TO_ORDER_MUTATION,
        variables: { id: id, product: product, qty: parseInt(qty, 10) },
    });
  
    return result.data.updateOrderAdd;
}

// Place an order
export const placeOrder = async (user) => {
  const PLACE_ORDER_MUTATION = `
    mutation placeOrder($user: String) {
        placeOrder(user: $user) {
          _id
          user
          products{
            product {
              _id
              name
              price
            }
            qty
          }
        }
    }
    `;

    const result = await client.mutate({
        mutation: gql(PLACE_ORDER_MUTATION),
        variables: { user: user},
    }).catch(error => {
        console.error("Mutation Error: ", error);
    });

    return result;
}
// add a product to cart
export const addToCart = async ({ user, product, qty }) => {
    const ADD_CART_MUTATION = `
    mutation addToCart($id: String, $product: String, $qty: Int) {
        addToCart(id: $id, product: $product, qty: $qty) {
        success
        }
    }
    `;
    const productInput = {
        _id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        qty: parseInt(product.qty, 10), 
    };

    const result = await client.mutate({
        mutation: gql(ADD_CART_MUTATION),
        variables: { id: user.id, product: product._id, qty: parseInt(qty, 10) },
    }).catch(error => {
        console.error("Mutation Error: ", error);
    });

    return result;
}
