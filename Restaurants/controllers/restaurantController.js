const Restaurant = require("../models/Restaurant");

const addRestaurant = async (req, res) => {
  const data = req.body;
  try {
    let restaurant = new Restaurant(data);
    await restaurant.save();
    return res.json({
      err: false,
      message: "Successfully added",
      data: restaurant,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: true, message: "Something went Wrong" });
  }
};

const addPhoto = async (req, res) => {
  const restaurant = await Restaurant.findOne({ id: req.body["res_id"] });
  if (restaurant) {
    try {
      let photos = req.body.photos;
      restaurant.photos = [...restaurant.photos, ...photos];
      await restaurant.save();
      return res.json({ err: false, message: "Photos added successfully" });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ err: true, message: "Something went wrong" });
    }
  } else {
    return res
      .status(404)
      .json({ err: true, message: "No restaurant found with this id" });
  }
};

const addMenu = async (req, res) => {
  const restaurant = await Restaurant.findOne({ id: req.body["res_id"] });
  if (restaurant) {
    try {
      let { menu } = req.body;
      restaurant.menu = [...restaurant.menu, ...menu];
      await restaurant.save();
      return res.json({ err: false, message: "Menu  added successfully" });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ err: true, message: "Something went wrong" });
    }
  } else {
    return res
      .status(404)
      .json({ err: true, message: "No restaurant found with this id" });
  }
};

const getRestaurant = async (req, res) => {
  const restaurant = await Restaurant.findOne({ id: req.params["id"] });
  if (restaurant) {
    return res.json({ err: false, message: "Success", restaurant: restaurant });
  } else {
    return res
      .status(404)
      .json({ err: true, message: "No restaurant found with this id" });
  }
};

const getAllRestaurant = async (req, res) => {
  try {
    const resturants = await Restaurant.find({
      "location.city_id": parseInt(req.query["city_id"]),
    });
    if (resturants) {
      return res.json({ err: false, message: "Success", resturants });
    } else {
      return res
        .status(404)
        .json({ err: true, message: "Fail No resturant found" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: true, message: "Something went wrong" });
  }
};

const fillterdRestaurant = async (req, res) => {
    let { filters, sort } = req.body;

    let cus = {}, other = {}, query = {}, srt = {};

    console.log(sort)
    for (let key in filters) {
        if (key == "cuisines") {
            if (filters[key].length !== 0)
                cus = { cuisines : { $in  : [...filters[key]] }}
        }
        else {
            other = Object.assign(other, { [key] : filters[key] })
        }
    }

    if (Object.keys(cus).length !== 0)
        query = Object.assign(cus, other)
    else query = other;

    if (sort === 'popularity')
        srt = { 'user_rating.votes': -1  };
    else if (sort === 'rating_desc')
        srt = { 'user_rating.aggregate_rating': -1  };
    else if (sort === 'delivery')
        srt = { 'delivery_time': 1  };
    else if (sort === 'cost_asc')
        srt = { 'average_cost_for_two': 1  };
    else if (sort === 'cost_asc')
        srt = { 'average_cost_for_two': -1};

    console.log(srt)
    console.log(query)    
    try {
        const restaurant = await Restaurant.find(query).sort(srt);
        return res.json({ err: false, message: "Success", restaurant: restaurant });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ err: true, message: "Something went wrong" });
    }
};

module.exports = {
  addRestaurant,
  addPhoto,
  addMenu,
  getRestaurant,
  getAllRestaurant,
  fillterdRestaurant,
};
