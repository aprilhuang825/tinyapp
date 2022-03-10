const { assert } = require('chai');

const { getUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

let testUrlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  },
  rgtd5D: {
    longURL: "https://www.google.ca",
    userID: "kituh8"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
  });
  it('should return undefined with email not in database', function() {
    const user = getUserByEmail("user3@example.com", testUsers);
    assert.isUndefined(user);
  });
});

describe('urlsForUser', function() {
  it('should return urls for corresponding user', function() {
    const urls = urlsForUser("aJ48lW", testUrlDatabase);
    const expectedUrls = {
      b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
      },
      i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW"
      }};
    assert.deepEqual(urls, expectedUrls);
  });

  it('should return empty object for non-exist user', function() {
    const urls = urlsForUser("non-exist", testUrlDatabase);
    const expectedUrls = {};
    assert.deepEqual(urls, expectedUrls);
  });
});