const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));


// mongoose


mongoose.connect("mongodb://127.0.0.1:27017/fruitDB")
.then(() => {
    console.log("Mongo Connection Complete");
}) 
.catch((err) => {
    console.log(err);
})

const fruitSchema = mongoose.Schema({
    name: String,
    value: {
        type: Number,
        min: 1,
        max: 10,
    },
    review: String,
});

const Fruit = new mongoose.model("Fruit", fruitSchema);


app.get("/", (req,res) => {
    Fruit.find()
        .then((fruits) => {
            res.render("index", {fruits});
        })
        .catch((err) => {
            console.log(err);
        })
});

app.get("/newfruit", (req, res) => {
    const fruitUrl = "";
    res.render("newfruit",{fruit: fruitUrl});
});

app.get("/newfruit/:id", (req,res) => {
    const fruitId = req.params.id;
    Fruit.findById(fruitId)
        .then((fruit) => {
            res.render("newfruit", {fruit})
        })
        .catch((err) => {
            console.log(err);
            res.redirect("/")
        })
})

app.post("/newfruit/:id", async (req, res) => {
    const fruitId = req.params.id;
    const name = req.body.fruitName;
    const value = req.body.fruitValue;
    const review = req.body.review;
    console.log(fruitId);
    await Fruit.findByIdAndUpdate(fruitId, { name, value, review })
      .then((fruit) => {
        console.log("Successfully changed fruit");
        res.redirect("/");
      })
      .catch((err) => {
        console.log(err);
        res.redirect("/");
      });
  });
  
  
app.post("/", (req,res) => {
    const removeBtn = req.body.removeBtn;
    const removeCheck = req.body.checkFruit;
     
    Promise.all([
        Fruit.findOneAndRemove({_id: removeBtn}),
        Fruit.deleteMany({_id: {$in: removeCheck}}),
    ])
        .then(([removedFruit, deletedFruits]) => {
          if (removedFruit) {
            console.log(`${removedFruit.name} removed successfully`);
          } else {
            console.log(`Fruit with _id ${removeBtn} not found`);
          }
          console.log(`${deletedFruits.deletedCount} fruits removed successfully`);
          res.redirect("/");
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/");
        });
});

app.post("/addFruit", (req,res) => {
    const name = req.body.fruitName;
    const value = req.body.fruitValue;
    const review = req.body.review;

    const newFruit = new Fruit({name, value, review})

    newFruit.save()    
        .then(() => {
            console.log("Fruit Saved successfully")
            res.redirect("/");
        })
        .catch((err) => {
            console.log("There is some issue here is your error " + err);
            res.redirect("/");
        });
})

app.listen(port, () => {
    console.log("The server is running on port " + port);
})
