import fs from 'node:fs';

import { MongoClient, ServerApiVersion } 
  from "mongodb";

import {dbURL}  from "./credentials.js";

const client = new MongoClient(dbURL, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let result;

const json1Data = fs.readFileSync('cs602_project_orders.json');
const orderData = JSON.parse(json1Data);
console.log("Read", orderData.length, "orders");

const orderCollection = client.db("cs602_project").collection("orders");
await orderCollection.deleteMany({});
result = await orderCollection.insertMany(orderData);
console.log('Inserted Ids:', result.insertedIds);


const json2Data = fs.readFileSync('cs602_project_products.json');
const productData = JSON.parse(json2Data);
console.log("Read", productData.length, "products");

const productsCollection = client.db("cs602_project").collection("products");
await productsCollection.deleteMany({});
result = await productsCollection.insertMany(productData);
console.log('Inserted Ids:', result.insertedIds);

const json3Data = fs.readFileSync('cs602_project_users.json');
const userData = JSON.parse(json3Data);
console.log("Read", userData.length, "users");
console.log(userData);

const userCollection = client.db("cs602_project").collection("users");
await userCollection.deleteMany({});
result = await userCollection.insertMany(userData);
console.log('Inserted Ids:', result.insertedIds);

const json4Data = fs.readFileSync('cs602_project_carts.json');
const cartData = JSON.parse(json4Data);
console.log("Read", cartData.length, "carts");

const cartCollection = client.db("cs602_project").collection("carts");
await cartCollection.deleteMany({});
result = await cartCollection.insertMany(cartData);
console.log('Inserted Ids:', result.insertedIds);

await client.close();
