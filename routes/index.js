import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';

import { validateUser } from '../dbUsers.js';
import * as courseDB from '../clienntCourseModules.js';

passport.use(
  new LocalStrategy(
    function (username, password, cb) {
      process.nextTick(async function () {
        const user = await validateUser(username, password);
        console.log("user: ", user);
        if (!user) { 
          return cb(null, false, 
            { message: 'Incorrect username or password.' }); 
        }
        else {
          return cb(null, user);  
        }
  
      });
    }
  )
);

import express from 'express';
import session from 'express-session';

const router = express.Router();

// Use express session
router.use(
  session({
    secret: 'cs602_secret', 
    resave: false, 
    saveUninitialized: false
  })
);

// Initialize Passport and session
router.use(passport.initialize());
router.use(passport.session());

// Serialize user information
passport.serializeUser((user, cb) => {
  console.log("Serialize", user);
  cb(null, {
    id: user.id,
    name: user.name,
    role: user.role
  });
});

// Deserialize user information
passport.deserializeUser((obj, cb) => {
  console.log("DeSerialize", obj);
  cb(null, obj);
});

router.get('/', function (req, res){
  res.render('homeView', {user: req.user});
});

router.get('/login', function (req, res) {
  res.render(
    'login', {
      user: req.user, 
      messages: req.session.messages});
});

router.post('/login', passport.authenticate('local', {
  successRedirect: "/",
  failureRedirect: '/login',
  failureMessage: true
}), (req, res, next) => {
  console.log("Login failure:", req.session.messages);
});

// protected route middleware function
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

const ensureAuthorized = (requiredRole) => {
  return (req, res, next) => {
    if (req.isAuthenticated) {
      const user = req.user;
      if (user?.role === requiredRole) {
        return next();
      } else {
        res.render('error', 
          { user: req.user,
            message: 'Insufficient access permissions'});
      }
    } else {
      res.redirect('/login'); 
    }
  }
}

// show users orders
router.get('/orders', ensureAuthenticated ,
  async function(req, res) {
    let id = req.user.id;
    let result = await courseDB.lookupUserOrders(id);
    const isAdmin = req.user.role === "admin";

    res.render('ordersView', 
      { orders: result, user: req.user, isAdmin: isAdmin});

});

// show Users
router.get('/users', ensureAuthorized('admin') ,
  async function(req, res) {

    let result = await courseDB.lookupUsers();

    res.render('allUsers', 
      { users: result, user: req.user, isAdmin: true});

});

//look up user orders
router.get('/user/:id',  ensureAuthorized('admin') ,
  async function(req, res) {
    let id = req.params.id;
    let result = await courseDB.lookupUserOrders(id);

    res.render('ordersView', 
      { orders: result, user: req.user, id: id, isAdmin: true});

});

// edit An Order
router.post('/editOrder',  ensureAuthorized('admin') ,
  async function(req, res) {
    const result = await courseDB.getOrder(req.body.id);
    res.render('editOrdersView', 
      { order: result, user: req.user, isAdmin: true});

});

//edit an order 
router.get('/editOrder/:id',  ensureAuthorized('admin') ,
  async function(req, res) {
    console.log("order " , req.params);
    const result = await courseDB.getOrder(req.params.id);
    res.render('editOrdersView', 
      { order: result, user: req.user, isAdmin: true});

});

//delte an order
router.post('/deleteOrder/:id', ensureAuthorized('admin'),
async function(req, res) {
  let id = req.params.id;
  await courseDB.deleteOrder(id);

  res.redirect('/users');
});

//Show All Products
router.get('/products',  ensureAuthenticated,
  async function(req, res) {
    const isAdmin = req.user.role === "admin";
    let result = await courseDB.getProducts();

    res.render('allProducts', 
      {products: result.getProducts, user: req.user, isAdmin: isAdmin});

});

// show products based on search
router.post('/products', ensureAuthenticated,
async function(req, res) {
  let searchBy = req.body.searchBy;
  let searchFor = req.body.productSearch;
  let sortBy = req.body.sortBy;
  let result;

  if(searchBy === "Name"){
    result = await courseDB.lookupByProductName(searchFor, sortBy);
    result = result.productName;
  }
  else{
    result = await courseDB.lookupByProductDesc(searchFor, sortBy);
    result = result.productDesc;
  }

  const isAdmin = req.user.role === "admin";

  res.render('allProducts', 
    {query: {searchBy: searchBy, searchFor: searchFor}, products: result, user: req.user, isAdmin: isAdmin});
});

//see individual product page
router.get('/product/:id', ensureAuthenticated,
async function (req, res) {
  
  let id = req.params.id;
  let result = await courseDB.lookupByProduct(id);
  result = result.product;
  const isAdmin = req.user.role === "admin";
  res.format({

    'application/json': function() {
      res.json({query: id, product: result});
    },
    'text/html': function() {
      res.render('productView', 
        {query: id, product: result, user: req.user, isAdmin: isAdmin});
    }

  });
  
});

// delete a product
router.post('/delete/:id', ensureAuthorized('admin'),
async function (req, res) {

  const id = req.params.id;
  await courseDB.deleteProduct(id);
  res.redirect('/products');
  
})

//Open Add Product Form
router.get('/addProduct', ensureAuthorized('admin'),
  async function (req, res) {

  res.render('addProductForm', {user: req.user, isAdmin: true});
  
});

// add new product
router.post('/addProduct', ensureAuthorized('admin'),
  async function (req, res) {
  // type check price and qty 
  const _id = req.body._id, name = req.body.name, desc = req.body.desc;
  const price = parseFloat(req.body.price), qty = parseInt(req.body.qty, 10);
  const newProduct = 
  {_id: _id,
    name: name,
    desc: desc,
    price: price,
    qty: qty
  };
  try{
    const result = await courseDB.addProduct(newProduct);
    res.redirect('/products');
    
  }
  catch{
    res.render('error', 
      {user: req.user, message: "Something went wrong adding product. Make sure Id is not already used", isAdmin: true}
    );
  }
});

// Form to Add Product to Order
router.post('/updateOrderAdd', ensureAuthorized('admin'),
  async function (req, res) {
  let id = req.body.id;
  // get products to show on form
  const products = await courseDB.getProducts();
  res.format({

    'application/json': function() {
      res.json({order: id});
    },
    'text/html': function() {
      
      res.render('addProduct', 
        {order: id, products: products.getProducts, user: req.user, isAdmin: true});
    }
  });

});

// remove a product from order
router.post('/updateOrderDel', ensureAuthorized('admin'),
  async function (req, res) {
    const id = req.body.id;
    let result = await courseDB.updateOrderDel(req.body);

    res.format({

      'application/json': function() {
        res.json({order: result});
      },
      'text/html': function() {
        res.redirect(`/editOrder/${id}`);
      }
    });
});

//Add new Product to Order
router.post('/updateOrderAddSubmit', ensureAuthorized('admin'),
  async function (req, res) {
  let id = req.body.id;
  // hcek that update doesn't exceed qty in stock
  let product = await courseDB.lookupByProduct(req.body.product);
  if(product.product.qty >= req.body.qty){

    let result = await courseDB.updateOrderAdd(req.body);
    res.redirect(`/editOrder/${id}`);

  }else{
    res.render('error', {user: req.user, isAdmin: true, message:"The quantity you selected is more than we have in stock"})
  }

});

// Allow for updating a product's information
router.get('/updateProduct/:id', ensureAuthorized('admin'),
  async function (req, res) {
  let id = req.params.id;

  let result = await courseDB.lookupByProduct(id);
  result = result.product;
  res.format({

    'application/json': function() {
      res.json({product: result});
    },
    'text/html': function() {
      res.render('updateProduct', 
        {product: result, user: req.user, isAdmin: true});
    }
  });

});

// update a product information
router.post('/updateProduct/:id', ensureAuthorized('admin'),
  async function (req, res) {
  const _id = req.body._id, name = req.body.name, desc = req.body.desc;
  const price = parseFloat(req.body.price), qty = parseInt(req.body.qty, 10);
  const newProduct = 
  {_id: _id,
    name: name,
    desc: desc,
    price: price,
    qty: qty
  }
  try{
    const result = await courseDB.updateProduct(newProduct);
    res.redirect('/products');
    
  }
  catch(err){
    res.render('error', 
      {user: req.user, message: "Something went wrong updating product", isAdmin: true}
    )
    console.error("ERROR", err);
  }

});

// Process an order
router.post('/placeOrder', ensureAuthenticated,
  async function (req, res) {
    const user = req.user.id;
    const result = await courseDB.placeOrder(user);
    res.redirect('/orders')

});

// add product to cart
router.post('/addToCart', ensureAuthenticated,
  async function (req, res) {
  const _id = req.body._id, qty = parseInt(req.body.qty, 10), prevQty = parseInt(req.body.prevQty,10);
  const name= req.body.name, description = req.body.description, price= parseFloat(req.body.price);

  const isAdmin = req.user.role === "admin";

  try{
    const result = await courseDB.addToCart({
      user: req.user,
      product: {_id, name, description, price, qty: prevQty},
      qty: qty
    });
    res.redirect('/products');
    
  }
  catch(err){
    res.render('error', 
      {user: req.user, message: "Something went wrong adding to cart", isAdmin: isAdmin}
    )
    console.error("ERROR", err);
  }

});
  
router.get('/logout', ensureAuthenticated, 
  function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// Show cart
router.get('/cart',  ensureAuthenticated,
  async function(req, res) {
    const isAdmin = req.user.role === "admin";
    let result = await courseDB.getCart(req.user.id);

    res.render('showCart', 
      {products: result.getCart, user: req.user, isAdmin: isAdmin});

});

export {router};