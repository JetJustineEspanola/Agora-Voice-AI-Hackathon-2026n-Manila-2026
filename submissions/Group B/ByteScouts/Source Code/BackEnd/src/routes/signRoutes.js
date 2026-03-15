import { Router } from 'express'
import { getSignModel, recognizeSign, trainSignModel } from '../controllers/signController.js'

export const signRouter = Router()

signRouter.post('/recognize-sign', recognizeSign)
signRouter.get('/sign-model', getSignModel)
signRouter.post('/sign-model/train', trainSignModel)
