const oauthCallback = process.env.REDIRECT_AUTH_URL
console.log("oauthCallback: ", oauthCallback)
const oauth = require('../services/oauth-promise')(oauthCallback)
const COOKIE_NAME = 'oauth_token'

let tokens = {}

async function getRequestToken(req, res, next) {
  try {
    const { oauth_token, oauth_token_secret } = await oauth.getOAuthRequestToken()
    res.cookie(COOKIE_NAME, oauth_token, {
      maxAge: 15 * 60 * 1000, // 15 minutes
      secure: true,
      httpOnly: true,
      sameSite: true,
    })
  
    tokens[oauth_token] = { oauth_token_secret }
    res.json({ oauth_token })
  } catch (e) {
    console.log('Exception: ', e)
  }

  
}

async function getOAuthToken(req, res, next) {
  try {
    const { oauth_token: req_oauth_token, oauth_verifier } = req.body
    const oauth_token = req.cookies[COOKIE_NAME]
    const oauth_token_secret = tokens[oauth_token].oauth_token_secret

    if (oauth_token !== req_oauth_token) {
      res.status(403).json({ message: 'Request tokens do not match' })
      return
    }

    const {
      oauth_access_token,
      oauth_access_token_secret,
    } = await oauth.getOAuthAccessToken(oauth_token, oauth_token_secret, oauth_verifier)
    tokens[oauth_token] = {
      ...tokens[oauth_token],
      oauth_access_token,
      oauth_access_token_secret,
    }
    res.json({ success: true })
  } catch (error) {
    res.status(403).json({ message: 'Missing access token' })
  }
}

module.exports = {
  getRequestToken,
  getOAuthToken,
}
