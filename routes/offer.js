const express = require("express");
const router = express.Router();

//const formidable = require("express-formidable");
const Offer = require("../models/Offer");
const savePicture = require("../middleware/savePicture");
const deletePicture = require("../middleware/deletePicture");
const isAuthenticated = require("../middleware/isAuthenticated");


//post an offer
router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    const newOffer = await new Offer({
      product_name: req.fields.title,
      product_description: req.fields.description,
      product_price: req.fields.price,
      product_details: [
        { brand: req.fields.brand },
        { size: req.fields.size },
        { condition: req.fields.condition },
        { color: req.fields.color },
        { city: req.fields.city },
      ],
      owner: req.user,
    });
    await newOffer.save();

    if (req.files.picture) {
      newOffer.product_image = await savePicture(
        req.files.picture.path,
        newOffer.id,
        "/vinted/offers"
      );
    }

    res.status(200).json({
      product_name: newOffer.product_name,
      product_description: newOffer.product_description,
      product_price: newOffer.product_price,
      product_details: newOffer.product_details,
      owner: {
        account: newOffer.owner.account,
        _id: newOffer.owner.id,
      },
      product_image: newOffer.product_image,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//modify an offer

router.put("/offer/modify/:id", isAuthenticated, async (req, res) => {
  try {
    const offerToModify = await Offer.findOne({ id: req.params.id }).populate(
      "owner"
    ); // retrieve offer
    if (req.user.id === offerToModify.owner.id) {
      //check if authenticated user is the owner of the offer;
      const keys = Object.keys(req.fields);
      const modifications = [];
      for (let i = 0; i < keys.length; i++) {
        if (
          keys[i] !== "product_name" ||
          keys[i] !== "product_description" ||
          keys[i] !== "product_price"
        ) {
          offerToModify.product_details[i] = { [keys[i]]: req.fields[keys[i]] };
        } else {
          offerToModify[keys[i]] = req.fields[keys[i]];
        }
        modifications.push(
          keys[i] + " has been updated to " + req.fields[keys[i]]
        );
      }
      if (req.files.picture) {
        offerToModify.product_image = await savePicture(
          req.files.picture.path,
          offerToModify.id,
          "/vinted/offers"
        );
        modifications.push("Your picture has been updated");
      }

      await offerToModify.save();
      res.status(200).json(modifications);
    } else {
      res.status(400).json({ message: "Token not valid for this offer" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//Delete an offer
router.delete("/offer/delete/:id", isAuthenticated, async (req, res) => {
  try {
    const offerToDelete = await Offer.findOne({ id: req.params.id }).populate(
      "owner"
    );
    if (req.user.id === offerToDelete.owner.id) {
      await deletePicture("vinted/offers/" + req.params.id);
      await Offer.findOneAndDelete({ id: req.params.id });
      res.status(200).json({ message: "Your offer has now been deleted" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const offerToSearch = await Offer.findById(req.params.id).populate(
      "owner",
      "account"
    );
    res.status(200).json(offerToSearch);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//Search offers

router.get("/offers", async (req, res) => {
  try {
    const offers = Offer.find().populate("owner", "account");
    offers.getFilter();

    if (req.query.title) {
      offers.find({ product_name: new RegExp(req.query.title, "i") });
      offers.getFilter();
    }
    if (req.query.priceMin && !req.query.priceMax) {
      offers.find({ product_price: { $gte: req.query.priceMin } });
      offers.getFilter();
    }

    if (req.query.priceMax && !req.query.priceMin) {
      offers.find({ product_price: { $lte: req.query.priceMax } });
      offers.getFilter();
    }
    if (req.query.priceMax && req.query.priceMin) {
      offers.find({
        product_price: {
          $gte: req.query.priceMin,
          $lte: req.query.priceMax,
        },
      });
      offers.getFilter();
    }

    if (req.query.sort) {
      let sortValue = "";
      if (req.query.sort === "price-asc") {
        sortValue = "asc";
      } else {
        sortValue = "desc";
      }

      offers.find().sort({ product_price: sortValue });
      offers.getFilter();
    }
    let limit = 5;
    if (req.query.limit) {
      limit = req.query.limit;
    }

    if (req.query.page) {
      const skip = limit * (Number(req.query.page) - 1);
      offers.find().limit(limit).skip(skip);
      offers.getFilter();
    }

    //specify fields to return

    const returnValue = await offers.exec();

    const count = returnValue.length;

    res.status(200).json({ count: count, offer: returnValue });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
module.exports = router;
