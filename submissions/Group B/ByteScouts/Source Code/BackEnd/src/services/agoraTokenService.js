import { RtcTokenBuilder, RtcRole } from 'agora-token'

export function buildRtcToken({ appId, appCertificate, channel, uid, role, expiresInSeconds }) {
  const now = Math.floor(Date.now() / 1000)
  const expireTs = now + (expiresInSeconds ?? 3600)

  return RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channel, uid, role, expireTs)
}

export { RtcRole }

