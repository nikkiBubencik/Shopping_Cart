import mongoose from 'mongoose';
import {dbURL}  from "./credentials.js";
import {Order, Product, Cart, User} from 
    './models/index.js';

export const connection = await mongoose.connect(dbURL);

// find all orders for a user
export const lookupUserOrders = async (id) => {
  let result = [];

	result = await Order.find({
		user: id
	}).populate('products.product');
  
	return JSON.parse(JSON.stringify(result));
};

// find all products
export const getProducts =  async () => {
	let result = [];

	result = await Product.find();
	
	return JSON.parse(JSON.stringify(result));
};

// find a specific products information
export const lookupByProduct =  async (id) => {
	let result = [];

	result = await Product.findById(id);

	return JSON.parse(JSON.stringify(result));
};

// Find products with a ceratin description
export const lookupByProductDesc = async(desc, sorting) => {
	let result = [];
	let val =  (sorting === "priceDec") ? -1 : 1;

	result = await Product.find({
		description: { $regex: desc, $options: 'i' }
	}).sort({price: val});

	return JSON.parse(JSON.stringify(result));
}

//find products with a ceratin name
export const lookupByProductName = async(name, sorting) => {
	let result = [];
	let val =  (sorting === "priceDec") ? -1 : 1;
	result = await Product.find({
		name: { $regex: name, $options: 'i' }
	}).sort({ price: val });

	return JSON.parse(JSON.stringify(result));
}

