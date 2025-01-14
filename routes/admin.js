var express = require('express');
var router = express.Router();
var objectId=require('mongodb').ObjectId

var producthelpers=require('../helpers/product-helpers')


/* GET users listing. */
router.get('/', function(req, res, next) {

  producthelpers.getAllProducts().then((products)=>{
    console.log(products)
    res.render('admin/view-product',{admin:true,products})
  })

 
});

router.get('/add-product', function(req, res, next) {
    
  
    
  res.render('admin/add-product');
});

router.post('/add-product', function(req, res, next) {
    
  console.log(req.body);
  console.log(req.files.image);
  producthelpers.addProduct(req.body, (id) => {
      let image = req.files.image; // Corrected typo
      image.mv('./public/images/' + id + '.jpg', (err, done) => {
          if (!err) {
              res.render("admin/add-product");
          } else {
              console.log(err);
          }
      });
  });

});

router.get('/delete-product/:id', function(req, res, next) {
    
  let proId=req.params.id
  producthelpers.deleteProduct(proId).then((response)=>{
        res.redirect('/admin/')
  })
    
});



router.get('/edit-product/:id',async(req, res)=> {
         let product=await producthelpers.getProductDetails(req.params.id)
          res.render('admin/edit-product',{product})
         
        

    
});



router.post('/edit-product/:id', (req, res)=> {
  let id=req.params.id
 producthelpers.updateProduct(req.params.id,req.body).then(()=>{
  
  if(req.files&&req.files.image){
    let image = req.files.image;
    image.mv('./public/images/' + id + '.jpg')

  }res.redirect('/admin/')
 })
 


});








module.exports = router;
