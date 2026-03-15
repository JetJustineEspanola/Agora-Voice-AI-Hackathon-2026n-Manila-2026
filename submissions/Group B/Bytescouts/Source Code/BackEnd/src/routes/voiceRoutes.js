import { Router } from 'express'
import { startVoiceSession, speakVoiceSession } from '../controllers/voiceController.js'

export const voiceRouter = Router()

voiceRouter.post('/voice/session/start', startVoiceSession)
voiceRouter.post('/voice/session/speak', speakVoiceSession)

