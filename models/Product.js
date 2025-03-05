// File: Product.js

import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// Fill in the code
const productScehma = new Schema({
  _id: String,
  name: String,
  description: String,
  price: Number,
  qty: Number
}, 
{collection : 'products'});

export const Product = mongoose.model(
  "Product", productScehma);
