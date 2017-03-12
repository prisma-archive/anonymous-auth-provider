"use strict";

require('es6-promise').polyfill();
require('isomorphic-fetch');

class Facebook {
  constructor(token) {
    this.token = token;
  }

  me() {
    return fetch(
      `https://graph.facebook.com/v2.8/me?fields=id%2Cemail&access_token=${this.token}`)
    .then(response => {
      return response.json()
    })
  }
}

module.exports = Facebook;