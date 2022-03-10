const generateRandomString = function() {
  let result = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  while (result.length < 6) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;
};

// check if email entered already existed in the database
const getUserByEmail = function(email, database) {
  for (const userId in database) {
    const user = database[userId];
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
};

const urlsForUser = function(id, database) {
  let Urls = {};
  for (const shortURL in database) {
    if(database[shortURL].userID === id) {
      Urls[shortURL] = database[shortURL];
    }
  }
  return Urls;
};

module.exports = {getUserByEmail, generateRandomString, urlsForUser};