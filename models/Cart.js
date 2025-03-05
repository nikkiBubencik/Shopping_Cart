// File: Cart.js

import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// Fill in the code

const cartSchema = new Schema({
  user: String,
  product: 
        {type: String,
        ref: "Product"},
  qty: Number
}, 
{collection : 'carts'});

export const Cart = mongoose.model(
  "Cart", cartSchema);