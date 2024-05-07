var express = require("express");
var router = express.Router();
var producthelpers = require("../helpers/product-helpers");
var userHelpers = require("../helpers/user-helpers");

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};
router.get("/", async function (req, res, next) {
  let user = req.session.user;
  let cartCount = null;
  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id);
  }

  producthelpers.getAllProducts().then((products) => {
    console.log(products);
    res.render("user/view-products", { products, user, cartCount });
  });
});

router.get("/login", function (req, res, next) {
  if (req.session.loggedIn) {
    res.redirect("/");
  } else {
    res.render("user/login");
  }
});

router.get("/signup", function (req, res, next) {
  res.render("user/signup");
});

router.post("/signup", function (req, res, next) {
  userHelpers.doSignup(req.body).then((response) => {
    console.log(response);
    req.session.loggedIn = true;
    req.session.user = response;
    res.redirect("/");
  });
});

router.post("/login", function (req, res, next) {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true;
      req.session.user = response.user;
      req.session.loginErr = false;

      res.redirect("/");
    } else {
      req.session.loginErr = true;
      res.render("user/login", { loginErr: req.session.loginErr });
    }
  });
});

router.get("/logout", function (req, res, next) {
  req.session.destroy();
  res.redirect("/");
});

router.get("/cart", async (req, res) => {
  //  let products=await userHelpers.getCartProducts(req.session.user._id)
  //  let totalValue=await userHelpers.getTotalAmount(req.session.user._id)
  res.render("user/cart");
});

router.get("/add-to-cart/:id", verifyLogin, (req, res) => {
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    res.redirect("/");
    res.json({ status: true });
  });
});
router.post("/change-product-quantity", (req, res, next) => {
  // Parse quantity as integer
  let quantity = parseInt(req.body.quantity);
  if (isNaN(quantity)) {
    // If quantity is not a number, return an error response
    return res.json({ error: "Invalid quantity" });
  }

  userHelpers
    .changeProductQuantity(req.body)
    .then((response) => {
      // If successful, return the response
      res.json(response);
    })
    .catch((error) => {
      // If there's an error, return an error response
      console.error("Error changing product quantity:", error);
      res.status(500).json({ error: "Error changing product quantity" });
    });
});

// router.get('/place-order',verifyLogin,async(req,res)=>{
//         let total=await userHelpers.getTotalAmount(req.session.user._id)
//         res.render('user/place-order',{total});
//   })

module.exports = router;
