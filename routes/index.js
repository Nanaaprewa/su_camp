var express = require('express');
var router = express.Router();
const User = require('../models/user');
const House = require('../models/house');
const debug = require('debug')('su-camp:index.js');
const { waterfall } = require('async');

/* GET home page. */

router.get('/user', (req, res) => {
  User.findById(req.query.user_id)
    .lean()
    .populate({
      path: 'house',
      select: '-occupants'
    })
    .exec((err, user) => {
      if (err) {
        debug(err);
        return res.send(err);
      }
      res.json(user);
    });
});
router.post('/user', (req, res) => {
  waterfall(
    [
      cb => {
        const newUser = new User({
          name: req.body.name,
          age: req.body.age,
          gender: req.body.gender,
          education: req.body.education,
          hobbies: req.body.hobbies
        });
        newUser.save((err, user) => {
          if (err) {
            return cb(err);
          }
          cb(null, user);
        });
      },
      (user, cb) => {
        House.findOneAndUpdate(
          {
            $and: [
              { gender: { $in: [user.gender] } },
              { $expr: { $lt: ['$max_capacity', '$occupants'] } }
            ]
          },
          {
            $addToSet: {
              occupants: {
                $each: [user._id]
              }
            }
          }
        ).exec((err, house) => {
          if (err) return cb(err);
          if (!house) return cb(new Error('Not Found'));
          debug({ house, user });
          return cb(null, { house, user });
        });
      },
      (result, cb) => {
        User.findByIdAndUpdate(result.user._id, {
          $set: { house: result.house._id }
        }).exec((err, user) => {
          if (err) return cb(err);
          user.house = result.house._id;
          return cb(user);
        });
      }
    ],
    (err, user) => {
      if (err) return res.send(err);
      res.json(user);
    }
  );
});

router.patch('/users', (req, res) => {
  let query = {};
  query[req.body.target] = req.body.content;
  User.findByIdAndUpdate(req.body._id, {
    $set: query
  })
    .lean()
    .exec((err, user) => {
      if (err) {
        debug(err);
        return res.status(500).end();
      }

      res.status(204).end();
    });
});

router.get('/house', (req, res) => {
  debug(req.query);
  House.findById(req.query.house_id)
    .lean()
    .populate({
      path: 'occupants',
      select: '-house'
    })
    .exec((err, house) => {
      if (err) return res.status(500).send(err);
      res.json(house);
    });
});

router.get('/houses', (req, res) => {
  House.find()
    .lean()
    .populate({ path: 'occupants', select: '-house' })
    .exec((err, houses) => {
      if (err) return res.status(500).send(err);
      debug(houses);
      res.json(houses);
    });
});

router.post('/house', (req, res) => {
  const newHouse = new House(req.body);
  newHouse.save((err, house) => {
    if (err) {
      res.status(500).send(err);
      return debug(err);
    }
    res.status(201).json(house);
  });
});

module.exports = router;
