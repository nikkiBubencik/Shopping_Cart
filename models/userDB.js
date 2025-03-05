// File: userDb.js

import mongoose from 'mongoose';
const Schema = mongoose.Schema;

import {dbURL} from "../credentials.js";

let connection = null;
let model = null;

const userSchema = new Schema({
  _id: String,
  username: String,
  name: String,
  password: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {collection : 'users'});


// export default function getModel () {
//   if (connection == null) {
//     console.log("Creating connection and model...");
//     connection =   mongoose.createConnection(dbURL);
//     model = connection.model("UserModel", userSchema);
//   };
//   return model;
// };

export const User = mongoose.model(
  "User", userSchema);