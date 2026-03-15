import { classifyLandmarks } from '../services/signClassifier.js'

export async function recognizeSign(req, res, next) {
  try {
    const { landmarks } = req.body || {}
    const result = classifyLandmarks(landmarks)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

