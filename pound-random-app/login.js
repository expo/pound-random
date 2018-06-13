import Api from './Api';

export async function loginAsync(session) {
  let {userId, token} = session;
  await Api.setSessionAsync(session);
  return session;
}