const Files = require('../enums/Files');
const { insert, destroy } = require('../utils/data');
const { extractBody } = require('../utils/request');
const { generateToken } = require('../utils/token');
const { getUserByEmail } = require('./user');

async function login(req) {
  const { email, password } = await extractBody(req);
  if (!email || !password) {
    return {
      status: 422,
      data: { message: 'invalid parameters' },
    };
  }

  const user = await getUserByEmail(email);
  if (!user || user.password !== password) {
    return {
      status: 401,
      data: { message: 'email or password invalid' },
    };
  }

  const token = generateToken();
  await insert(Files.Token, { token }, Buffer.from(token).toString('base64'));

  return {
    status: 200,
    data: { token },
  };
}

async function logout(req) {
  const token = (req.headers['authorization'] || '').replace('Bearer ', '');
  if (!token) {
    return {
      status: 422,
      data: { message: 'already logged out' },
    };
  }

  await destroy(Files.Token, Buffer.from(token).toString('base64'));

  return {
    status: 204,
  };
}

module.exports = { login, logout };