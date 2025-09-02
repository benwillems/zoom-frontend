import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0'

export default withApiAuthRequired(async function logout(req, res) {
  try {
    const session = await getSession(req, res)
   // if (session) {
      res.setHeader(
        'Set-Cookie',
        'appSession=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax'
      )
   // }
    res.status(200).json({ success: true })
  } catch (error) {
    console.error(error)
    res.status(error.status || 500).json({
      code: error.code,
      error: error.message,
    })
  }
})
