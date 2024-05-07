var db = require("../confiq/connection");
var collection = require("../confiq/collections");
const bcrypt = require("bcrypt");
const { ObjectId } = require('mongodb');
const { response } = require("express");

module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      userData.Password = await bcrypt.hash(userData.Password, 10);
      db.get()
        .collection(collection.USER_COLLECTIONS)
        .insertOne(userData)
        .then((Data) => {
          resolve(Data.insertedId);
        });
    });
  },
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginstatus = false;
      let response = {};
      let user = await db
        .get()
        .collection(collection.USER_COLLECTIONS)
        .findOne({ email: userData.email });
      if (user) {
        bcrypt.compare(userData.Password, user.Password).then((status) => {
          if (status) {
            console.log("success login");
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("login failed");
            resolve({ status: false });
          }
        });
      } else {
        console.log("login failed");
        resolve({ status: false });
      }
    });
  },
  
  // addToCart:(proId, userId) => {
  //   let proObj = {
  //           item: new ObjectId(proId),
  //           quantity: 1,
  //   };
  //   return new Promise(async(resolve, reject) => {
      
  //       let userCart =await db.get().collection(collection.CART_COLLECTIONS).findOne({ user: new ObjectId(userId) });
  //        if (userCart) {
  //         let proExit=userCart.products.findIndex(product=> product.item==proId)

  //         if(proExit!=-1){
  //           db.get().collection(collection.CART_COLLECTIONS).updateOne({'product.item':new ObjectId(proId)},{
  //             $inc:{'products.$.quantity':1}
  //           }).then(()=>{
  //             resolve()
  //           })
  //         }else{
  //         db.get().collection(collection.CART_COLLECTIONS).findOne({ user: new ObjectId(userId) },
  //            {
  //               $push:{products:new ObjectId(proId)}
  //            }).then(()=>{
  //               resolve(resolve)
  //             })}
  //       } else {

  //         let cartObj = {
  //           user: new ObjectId(userId),
  //           products:[proObj]
  //         };
        
  //       db.get().collection(collection.CART_COLLECTIONS).insertOne(cartObj).then((response)=>{
  //             resolve()
  //       })
  //     }
  //   })
  // },

  
  addToCart: async (proId, userId) => {
    let proObj = {
        item: new ObjectId(proId),
        quantity: 1,
    };

    try {
        let userCart = await db.get().collection(collection.CART_COLLECTIONS).findOne({ user: new ObjectId(userId) });

        if (userCart) {
            let productIndex = userCart.products.findIndex(product => product.item.equals(proObj.item));

            if (productIndex !== -1) {
                await db.get().collection(collection.CART_COLLECTIONS).updateOne(
                    { 'products.item': proObj.item },
                    { $inc: { 'products.$.quantity': 1 } }
                );
            } else {
                await db.get().collection(collection.CART_COLLECTIONS).updateOne(
                    { user: new ObjectId(userId) },
                    { $push: { products: proObj } }
                );
            }
        } else {
            let cartObj = {
                user: new ObjectId(userId),
                products: [proObj]
            };
            await db.get().collection(collection.CART_COLLECTIONS).insertOne(cartObj);
        }

        return Promise.resolve();
    } catch (error) {
        return Promise.reject(error);
    }
}
,
  
  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db.get().collection(collection.CART_COLLECTIONS)
        .aggregate([
          {
            $match: { user: new ObjectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity"
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTIONS,
              localField: "item",
              foreignField: "_id",
              as: "product",
            }
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] }
            },
          },
        ])
        .toArray();
      resolve(cartItems[0].cartItems);
    });
  },

  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await db.get()
        .collection(collection.CART_COLLECTIONS)
        .findOne({ user: new ObjectId(userId) });
      if (cart) {
        count = cart.products.length;
      }
      resolve(count);
    });
  },

  changeProductQuantity: (details) => {
    details.count = parseInt(details.count);
    quantity =parseInt(details.quantity);

    return new Promise((resolve, reject) => {
        if (details.count == -1 && details.quantity == 1) {
            // If quantity is 1 and count is -1, remove the product
            db.get().collection(collection.CART_COLLECTIONS)
                .updateOne(
                    { _id: new ObjectId(details.cart) },
                    {
                        $pull: { products: { item: new ObjectId(details.product) } },
                    }
                )
                .then((response) => {
                    resolve({ removeProduct: true });
                });
        } else {
            // Otherwise, update the quantity
            db.get().collection(collection.CART_COLLECTIONS)
                .updateOne(
                    {
                        _id: new ObjectId(details.cart),
                        "products.item": new ObjectId(details.product),
                    },
                    {
                        $inc: { "products.$.quantity": details.count },
                    }
                )
                .then((response) => {
                    resolve( true );
                });
        }
    });
}
,
 

//   getTotalAmount: (userId) => {
//     return new Promise(async (resolve, reject) => {
//         let total = await db.get()
//             .collection(collection.CART_COLLECTIONS)
//             .aggregate([
//                 { $match: { user: new ObjectId(userId) } },
//                 { $unwind: "$products" },
//                 {
//                     $project: {
//                         item: "$products.item",
//                         quantity: "$products.quantity",
//                     },
//                 },
//                 {
//                     $lookup: {
//                         from: collection.PRODUCT_COLLECTIONS,
//                         localField: "item",
//                         foreignField: "_id",
//                         as: "product",
//                     },
//                 },
//                 {
//                     $project: {
//                         item: 1,
//                         quantity: 1,
//                         product: { $arrayElemAt: ["$product", 0] },
//                     },
//                 },
//                 {
//                     $group: {
//                         _id: null,
//                         total: { $sum: { $multiply: ['$quantity', { $toDouble: "$product.price" }] } }
//                     }
//                 }
//             ])
//             .toArray();
//         resolve(total[0].total);
//     });
// }

};



