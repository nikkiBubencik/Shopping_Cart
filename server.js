import express from 'express';
import { ApolloServer } from '@apollo/server';
// import { startStandaloneServer } 
   from '@apollo/server/standalone';
import { expressMiddleware } from '@apollo/server/express4';
import { Order, Product, Cart, User } from './models/index.js';

const app = express();

// setup handlebars view engine
import { engine } from 'express-handlebars';

app.engine('handlebars', 
		engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.set('views', './views');

// static resources
app.use(express.static('./public'));

// to parse request body
app.use(express.urlencoded({extended: false}));
app.use(express.json());

import cookieParser from 'cookie-parser';
import expressSession from 'express-session';

// cookie-parser first
app.use(cookieParser());
// session 
app.use(expressSession(
	{ secret: 'cs602-secret',
	  resave: false, 
	  saveUninitialized: false }));

let orderIdx = 2;
import * as courseDB from './courseModule.js';
  
const typeDefs_Queries = `#graphql
	enum roleType {
	user
	admin
	}

	type OrderProduct {
		product: Product!
		qty: Int!
	}

	type Order {
	  _id: String!
	  user: String!
	  products: [OrderProduct]
	}
  
	type Product {
	  _id: String!
	  name: String!
	  description: String
	  price: Float!
	  qty: Int!
	}

	type Cart {
		user: String!
		product: Product!
		qty: Int!
	}

	type User {
		_id: String!
		name: String!
		username: String!
		password: String!
		role: roleType!
	}
  
  
	type Query {
	  getUsers: [User]
	  getCart(id: String!): [Cart]
	  userOrders(user: String): [Order]
	  getProducts: [Product]
	  productDesc(desc: String, sort: String): [Product]
	  productName(name: String, sort: String): [Product]
	  product(id: String): Product
	  allUsers: [User]
	  findUser(username: String, password: String): User
	  getOrder(id: String): Order
	}
	type deleteOrderReturn {
		success: Boolean,
		message: String
	}

	type Mutation {
		addToCart(id: String, product: String, qty: Int): deleteOrderReturn
		deleteProduct(id: String): Product
		deleteOrder(id: String): deleteOrderReturn
		updateOrderAdd(id: String, product: String, qty: Int): Order
		updateOrderDel(id: String, product: String, qty: Int): deleteOrderReturn
		addProduct(_id: String, name: String, description: String, price: Float, qty: Int): Product
		updateProduct(_id: String, name: String, description: String, price: Float, qty: Int): Product
		placeOrder(user: String): Order
	}
  `
  
  const resolvers_Queries = {
  
	Mutation: {
		placeOrder: async(parent, args, context) => {
			//Get Cart
			const result = await Cart.find({user: args.user});
			const products = result.map(item => ({
				product: item.product,
				qty: item.qty
			  }));
			
			const newOrder = {
				_id: orderIdx,
				user: args.user,
				products: products
			}
			orderIdx++;
			//Place order
			const orderResult = await Order.insertOne(
				newOrder
			)
			//delete cart
			const deleteUserCart = await Cart.deleteMany(
				{user: args.user}
			);
			return newOrder;
		},
		addToCart: async(parent, args, context) => {
			let result;
			// Check if product is laready in cart
			const alreadyInCart = await Cart.findOne({user: args.id, product: args.product});
			if(alreadyInCart){
				// If in Cart update quantity else add product to cart
				result = await Cart.updateOne(
					{user: args.id, product: args.product},
					{$inc: {qty: args.qty}}
				)
			}
			else{
				result = await Cart.insertOne(
					{
						user: args.id,
						product: args.product,
						qty: args.qty
					}
				) 
			}
			//update product qty
			const updateProduct = await Product.updateOne(
				{_id: args.product},
				{$inc: {qty: -args.qty}}
			)
			return {success: true};
		},
		deleteProduct: async (parent, args, context) => {
		  const deletedProduct = await Product.findByIdAndDelete(args.id);
	
		  if (!deletedProduct) {
			throw new Error("Product not found");
		  }
	
		  return deletedProduct;
		},
		updateOrderDel: async (parent, args, ontext) => {
			const addQtyBack = await Product.updateOne(
				{_id: args.product},
				{$inc: {qty: args.qty}}
			)
			// pull product from products array
			const result = await Order.updateOne(
				{ _id: args.id },
				{ $pull: { products: { product: args.product, qty: args.qty } } }
			);
			if(result.modifiedCount === 0){
				console.error("none changed");
				return false;
			}
			return true;

		},
		deleteOrder: async (parent, args, context) => {
			await Order.findByIdAndDelete(args.id);

			return true;
		  },
		addProduct: async (parent, args, context) => {
			// const { _id, name, description, price, qty } = args;
			const result = await Product.insertOne(args);
			return await Product.findById(args._id);
		},
		updateProduct: async(parent, args, context) => {
			const result = await Product.updateOne(
				{_id: args._id},
				{$set:
					{
						name: args.name,
						description: args.description,
						price: args.price,
						qty: args.qty
					}
				}
			)
			return await Product.findById(args._id);
		},
		updateOrderAdd: async(parent, args, context) => {
			// if product already in order update its quantity
			const result = await Order.updateOne(
				{ _id: args.id, "products.product": args.product },
				{ $inc: { "products.$.qty": args.qty } }
			);
			if (result.modifiedCount === 0) {
				console.log("no matcher");
				// Product not found in products array, push a new one
				await Order.updateOne(
					{ _id: args.id },
					{ $push: { products: { product: args.product, qty: args.qty } } }
				);
			}
			// Update product quantity in stock
			const productResult = await Product.updateOne(
				{ _id: args.product }, 
				{ $inc: { qty: -args.qty } }
			);

			return await Order.findById(args.id);
		}
	},
	Query: {
		getUsers: async (parent, args, context) => {
			const result = await User.find();
			return result;
		},
	getCart: async(parent, args, context) => {
		const result = await Cart.find(
			{
				user: args.id
			}
		);
		return result;
	},
	userOrders: async (parent, args, context) => {
		const result = await courseDB.lookupUserOrders(args.user);
		return result;
	  },
	  product: async (parent, args, context) => {
		const result = await courseDB.lookupByProduct( args.id );
		return result;
	  },
	  getProducts: async (parent, args, context) => {
		const result = await courseDB.getProducts();
		return result;
	  },
	  productDesc: async (parent, args, context) => {
		const result = await courseDB.lookupByProductDesc(args.desc, args.sort);
		return result;
	  },
	  productName: async (parent, args, context) => {
		const result = await courseDB.lookupByProductName(args.name, args.sort);
		return result;
	  },
	  allUsers: async(parent, args, context) => {
		const result = await User.find();
		return result;
	  },
	  findUser: async (parent, args, context) => {
		const result = await User.findOne({
            username: args.username,
			password: args.password
	  	});
		return result;
	  },
	  getOrder: async(parent, args, context) => {
		const result = await Order.findOne(
			{_id: args.id}
		)
		return result;
	  }
  
	},
  
	// chain resolver for Order -> Product
	Order: {
	  products:  async (parent, args, context) => {
		try{
			const result = await Order.findById(parent._id).populate("products.product");
			return result.products;
		}
		catch(error){
			console.error("Error populating products.product", error);
		}
	  }
	},
	Cart: {
		product:  async (parent, args, context) => {
		  const result = await Cart.findById(parent._id).populate("product");
		  return result.product;
		}
	}
  
  };
  
  const server = new ApolloServer(
	{typeDefs: [typeDefs_Queries], 
	 resolvers: [resolvers_Queries]});

await server.start();
app.use(
  '/graphql',
  expressMiddleware(server, {
    context: async ({ req }) => ({
      // You can add authenticated user/session/cookies if needed here
      user: req.session?.user || null
    }),
  })
);

// Routing
import {router as routes} from 
    './routes/index.js';
import { updateProduct } from './clienntCourseModules.js';

app.use('/', routes);


app.use(function(req, res) {
	res.status(404).render('404');
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
