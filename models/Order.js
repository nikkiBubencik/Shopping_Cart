// File: Course.js

import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// Fill in the code

const orderSchema = new Schema({
  _id: String,
  user: String,
  products: [{ 
    product:
      {type: String,
      ref: "Product"},
    qty: Number}
  ]
}, 
{collection : 'orders'});

export const Order = mongoose.model(
  "Order", orderSchema);