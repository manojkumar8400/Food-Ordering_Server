const catchAsyncErrors = require('../middleware/catchAsyncErrors')
const AddResReq = require('../models/addRestReqModel')
const Restaurent = require('../models/restaurentModel')

exports.restReq = catchAsyncErrors(async (req, res) => {
  const content = req.body

  // Check in DB before listing restaurent
  const registeredRestaurant = await Restaurent.findOne({
    name: content.name,
    location: content.location,
  })

  if (registeredRestaurant) {
    return res.status(409).json({
      statusCode: 409,
      message: 'Restaurant already registered with this name and address',
    })
  }

  const resReq = await AddResReq.create(content)

  return res.status(201).json({
    statusCode: 201,
    message: 'Your resquest generate successfully',
    data: resReq,
  })
})

exports.restReqList = catchAsyncErrors(async (req, res) => {
  const { userId, isAdmin } = req.query
  let reqrestList = []
  if (userId && isAdmin == 'false') {
    reqrestList = await AddResReq.find({ userId: userId })
  } else if (userId && isAdmin == 'true') {
    reqrestList = await AddResReq.find()
  }

  return res.status(200).json({
    statusCode: 200,
    data: reqrestList,
    message: 'Data Fetched successfully',
  })
})

exports.resReqRemove = catchAsyncErrors(async (req, res) => {
  const _id = req.query._id

  const resReq = await AddResReq.findById({ _id: _id })

  if (!resReq) {
    return res.status(404).json({
      statusCode: 404,
      message: 'Item not found in list',
    })
  }

  await resReq.deleteOne()

  res.status(200).json({
    statusCode: 200,
    message: 'Your restaurant request is removed successfully',
  })
})

exports.resReqApproove = catchAsyncErrors(async (req, res) => {
  const content = req.body
  const _id = req.params._id

  const registeredRestaurant = await Restaurent.findOne({
    name: content.name,
    location: content.location,
  })

  if (registeredRestaurant) {
    return res.status(409).json({
      statusCode: 409,
      message: 'Restaurant already registered with this name and address',
    })
  }

  await Restaurent.create(content)

  await AddResReq.findByIdAndUpdate(
    _id,
    { status: "Approoved" }
  )

  return res.status(201).json({
    statusCode: 201,
    message: 'Resquest approoved successfully',
  })
})

exports.resReqDecline = catchAsyncErrors(async (req, res) => {
  const _id = req.params._id
  const { status } = req.body

  const isIdAvailable = await AddResReq.findById({ _id: _id })

  if (!isIdAvailable) {
    res.status(404).json({
      statusCode: 404,
      message: 'Not available in database',
    })
  }

  await AddResReq.findByIdAndUpdate(
    _id,
    { status }
  )

  res.status(200).json({
    statusCode: 200,
    message: 'The request was declined successfully',
  })
})
