  
const express = require('express')
const path = require('path')
const ReviewsService = require('./Reviews-service')
const { requireAuth } = require('../middleware/jwt-auth')

const ReviewsRouter = express.Router()
const jsonBodyParser = express.json()

ReviewsRouter
  .route('/')
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const { thing_id, rating, text } = req.body
    const newReview = { thing_id, rating, text }

    for (const [key, value] of Object.entries(newReview))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        })

    newReview.user_id = req.user.id

    ReviewsService.insertReview(
      req.app.get('db'),
      newReview
    )
      .then(Review => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${Review.id}`))
          .json(ReviewsService.serializeReview(Review))
      })
      .catch(next)
    })

module.exports = ReviewsRouter