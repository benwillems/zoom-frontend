import fs from 'fs';
import path from 'path';
import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';

export default withApiAuthRequired(async function handler(
  req,
  res
) {
  // 1. Extract the OAuth2 “code” from the query parameters:
  const { code } = req.query;
  if (!code || Array.isArray(code)) {
    return res.status(400).json({ error: 'No authorization code provided' });
  }

  try {
    const redirectUri = "https://nutrizoom.myvetassist.com/api/auth/callback/azure-ad"
    const clientId = 'c66a1f57-23fd-4fa6-be9d-946ef93b9040'
    const clientSecret = 'ebi8Q~w6jhpkDwx0NXeWlb0BkGG_vQdsDbZk8cyP'
    const tenantId = '8491fcf5-dbbb-471c-bdee-90beb53dfc6a'

       // Exchange authorization code for access token
    const tokenResponse = await fetch(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange error:', errorData);
      return res.status(400).json({ error: 'Failed to exchange code for token' });
    }

    const tokenData = await tokenResponse.json();
    // tokenData has: { access_token, refresh_token, expires_in, token_type, scope, id_token, session_state, ... }

    // 3. Use that new Microsoft Graph access_token to fetch the user’s profile:
    const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    if (!userResponse.ok) {
      console.error('Failed to fetch user profile from Graph');
      return res.status(400).json({ error: 'Failed to fetch user profile' });
    }
    const userData = await userResponse.json();
    // userData has fields like { id, displayName, mail, userPrincipalName, … }

    // 4. Persist Azure tokens & user info as HTTP-only cookies (so your frontend can read “ms_connected” for UI logic):
    const cookieOptions = [
      `ms_access_token=${tokenData.access_token}; HttpOnly; Path=/; Max-Age=${tokenData.expires_in}; SameSite=Lax`,
      `ms_refresh_token=${tokenData.refresh_token}; HttpOnly; Path=/; Max-Age=${90 * 24 * 60 * 60}; SameSite=Lax`, // 90 days
      `ms_user_name=${encodeURIComponent(userData.displayName || '')}; Path=/; Max-Age=${tokenData.expires_in}; SameSite=Lax`,
      `ms_user_email=${encodeURIComponent(
        userData.mail || userData.userPrincipalName || ''
      )}; Path=/; Max-Age=${tokenData.expires_in}; SameSite=Lax`,
      `ms_connected=true; Path=/; Max-Age=${tokenData.expires_in}; SameSite=Lax`,
    ];
    res.setHeader('Set-Cookie', cookieOptions);

    // 5. Save a copy of the Microsoft‐OAuth data to a JSON file (optional):
    const microsoftData = {
      userId: userData.id,
      name: userData.displayName,
      email: userData.mail || userData.userPrincipalName,
      type: 'oauth',
      provider: 'azure-ad',
      providerAccountId: userData.id,
      refresh_token: tokenData.refresh_token,
      access_token: tokenData.access_token,
      expires_at: Math.floor(Date.now() / 1000) + tokenData.expires_in,
      token_type: tokenData.token_type,
      scope: tokenData.scope,
      id_token: tokenData.id_token,
      session_state: tokenData.session_state,
    };
    // const filePath = path.join(process.cwd(), 'microsoft.json');
    // fs.writeFileSync(filePath, JSON.stringify(microsoftData, null, 2));
    // console.log(`Microsoft OAuth data saved to ${filePath}`);

    // 6. NOW—this is where we SHOW the correct usage of getSession(req, res):
    // Because this API route is wrapped by `withApiAuthRequired`, we know the user is authenticated with Auth0.
    // We can call getSession(req, res) to retrieve their Auth0 session, which includes an Auth0-issued accessToken.
    const session = await getSession(req, res);
    if (!session || !session.accessToken) {
      // This should never happen, because `withApiAuthRequired` already guaranteed a session.
      console.error('No Auth0 session or no Auth0 accessToken available.');
      return res
        .status(401)
        .json({ error: 'Auth0 session missing or no accessToken present' });
    }

    // Here is the Auth0 accessToken. You can forward it to your BE.
    const auth0AccessToken = session.accessToken;

    // 7. Prepare the payload you want to send to your backend:
    const backendPayload = {
      userId: userData.id,
      name: userData.displayName,
      email: userData.mail || userData.userPrincipalName,
      scope: tokenData.scope, // or any other data your BE expects
    };

    // 8. Call your backend, passing the Auth0 accessToken as Bearer:
    const backendUrl = process.env.BE_URL;
    const backendResponse = await fetch(
      `${backendUrl}/apii/calender/microsoft`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth0AccessToken}`,
        },
        body: JSON.stringify(backendPayload),
      }
    );

    if (!backendResponse.ok) {
      const text = await backendResponse.text();
      console.error(
        'Failed to send Microsoft data to backend:',
        backendResponse.status,
        text
      );
      // (Optionally) return an error here or continue
        } else {
      console.log('Microsoft data successfully sent to backend');
        }
          // 9. Instead of redirecting, send a success response with JavaScript to show alert and close window:
        const successScript = `
      <script>
        window.onload = function() {
          alert('Microsoft authentication successful! Your calendar is now linked.');
          // Dispatch an event to notify the opener window about successful authentication
          if (window.opener) {
            window.opener.dispatchEvent(new CustomEvent('microsoft-auth-success'));
            // Also send through postMessage for compatibility
            window.opener.postMessage('microsoft-auth-success', '*');
          }
          window.close();
        }
      </script>
        `;
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(successScript);
  } catch (error) {
    console.error('Error handling Microsoft OAuth callback:', error);
    return res
      .status(500)
      .json({ error: 'Internal server error during authentication' });
  }
});
