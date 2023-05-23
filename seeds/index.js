const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");
//use two dots bcz this is in seeds directory and campgrounds that is in model directory
mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");
const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("database connected");
});
//cant use req res or other express app features bcz we do not add that
// const seedDB = async () => { //making function
//     await Campground.deleteMany({}) //delete everything
//     const c = new Campground({ title: 'purple field' }) //adding this
//     await c.save();
// }

// According to the sample function definition, we are returning an array element at a random index for the passed array.So the sample function itself returns element and we are using it in string template literal.
const sample = (array) => array[Math.floor(Math.random() * array.length)];
const seedDB = async () => {
  //making function
  await Campground.deleteMany({});
  for (let i = 0; i < 200; ++i) {
    const random1000 = Math.floor(Math.random() * 1000 + 1);
    const camp = new Campground({
      author: "641221106123ba87a808be3a",
      location: `${cities[random1000].city},${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      images: [
        {
          url: "https://res.cloudinary.com/dajeeygdm/image/upload/v1681240457/Yelpcamp/mhc4nnncbulokt3z0na7.jpg",
          filename: "Yelpcamp/x0vceqp1bkgvnmfokzaj",
        },
        {
          url: "https://res.cloudinary.com/dajeeygdm/image/upload/v1680164519/Yelpcamp/edqmdida4byqefyav4o3.jpg",
          filename: "Yelpcamp/edqmdida4byqefyav4o3",
        },
      ],
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatibus ipsum, illo consectetur error iusto, beatae porro, ab quibusdam repellat aperiam sequi eius nihil? Animi, vero sunt nisi rem nam laborum!",
      price: "5",
    });
    await camp.save();
  }
};
//seedDB is async so .then catch use krskte
seedDB().then(() => {
  mongoose.connection.close();
});
//automatically disconnect
