import { classifyLandmarks, getCentroidModel, trainNearestCentroidModel } from '../services/signClassifier.js'

export async function recognizeSign(req, res, next) {
  try {
    const { landmarks } = req.body || {}
    const result = classifyLandmarks(landmarks)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function getSignModel(req, res, next) {
  try {
    const model = getCentroidModel()
    res.json({ model })
  } catch (err) {
    next(err)
  }
}

export async function trainSignModel(req, res, next) {
  try {
    const { dataset } = req.body || {}
    const model = trainNearestCentroidModel(dataset)
    res.json({ model })
  } catch (err) {
    next(err)
  }
}
