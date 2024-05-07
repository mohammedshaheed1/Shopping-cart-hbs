var db=require('../confiq/connection')
var collection=require('../confiq/collections');
const { ObjectId } = require('mongodb');
const { Promise } = require('mongoose');

module.exports={

    addProduct:(product,callback)=>{
        console.log(product)
        db.get().collection('product').insertOne(product).then((data)=>{
            console.log(data);

              callback(data.insertedId.toString());
        });
    },
    getAllProducts: async () => {
        try {
            let products = await db.get().collection(collection.PRODUCT_COLLECTIONS).find().toArray();
            return products;
        } catch (error) {
            throw error;
        }
    },
    

    
    deleteProduct: async (prodId) => {
        try {
            const response = await db.get().collection(collection.PRODUCT_COLLECTIONS).deleteOne({ _id: new ObjectId(prodId) });
            return response;
        } catch (error) {
            throw error;
        }
    },
    
    getProductDetails: async (prodId) => {
        try {
            let products = await db.get().collection(collection.PRODUCT_COLLECTIONS).findOne({_id: new ObjectId(prodId)});
            return products;
        } catch (error) {
            throw error;
        }
    },

    
    updateProduct:async(prodId,proDetails)=>{
        try{
       let product=await db.get().collection(collection.PRODUCT_COLLECTIONS).updateOne({_id:new ObjectId(prodId)},
          {
            $set:{
                name:proDetails.name,
                price:proDetails.price,
                discription:proDetails.discription,
                category:proDetails.category
               }
           })
          return product
          
        
    }catch (error) {
        throw error;
    }
}
    
    
    
    
    
}

