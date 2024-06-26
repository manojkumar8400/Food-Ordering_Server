const catchAsyncErrors = require('../middleware/catchAsyncErrors')
const User = require('../models/userModel')
const jwt = require('jsonwebtoken')

exports.registerUser = catchAsyncErrors(async (req, res) => {
  const content = req.body
  
  // Check in DB before creating new user
  let user = await User.findOne({ email: content.email })
  let userId = Date.now();

  if (user) {
    return res.status(409).json({
      statusCode: 409,
      message: 'You are already registered with this email address',
    })
  }
  user = await User.create({
    ...content, userId: userId
  })
  const { email, password, _id } = user

  // Create jwt token
  const token = jwt.sign({ email, password, _id }, process.env.secretKey, {
    expiresIn: '30d',
  })

  user.token = token
  await user.save()

  return res.status(201).json({
    statusCode: 201,
    message: 'Register successfully!',
    token,
  })
})

exports.userLogin = catchAsyncErrors(async (req, res) => {

  let user = await User.findOne({ email: req.body.email }).select('+password') // Password select was set false in schema so I used select method here
  if (user && req.body.password == user.password && user.token) {
    const { token } = user;
    try {
      // Verify the token
      jwt.verify(user.token, process.env.secretKey)
      return res.status(200).json({
        statusCode: 200,
        token,
        message: 'Login successfully',
      })
    } catch (error) {
      // If the token is invalid then create a new one
      const token = jwt.sign({ email: user.email, password: user.password, _id:user._id }, process.env.secretKey, {
        expiresIn: '30d',
      })

      user.token = token
      await user.save();

      return res.status(201).json({
        statusCode: 201,
        token,
        message: 'token created successfully',
      })
    }
  } else {
    return res.status(404).json({
      statusCode: 404,
      message: 'User not found',
    })
  }
})

exports.userInfo = catchAsyncErrors( async (req, res) => {

  const token = req.query.token
  const userInfo = await User.findOne({ token: token}).select('-token');

  return res.status(200).json({
    statusCode: 200,
    message: 'User data fetched successfully!',
    data:userInfo
  })
})
