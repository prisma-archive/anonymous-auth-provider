"use strict";

const Lokka = require('lokka').Lokka;
const Transport = require('lokka-transport-http').Transport;

class System {
  constructor(url, pat) {
    this.pat = pat;

    this.client = new Lokka({
      transport: new Transport(url)
    });
  }

  generateUserToken(projectId, userId, modelName) {
    return this.client.query(`
    mutation {
      generateUserToken(input:{
        pat:"${this.pat}", 
        projectId:"${projectId}", 
        userId:"${userId}", 
        modelName:"${modelName}", 
        clientMutationId:"static"
      })
      {
        token
      }
    }`).then(response => {
      return response.generateUserToken.token
    })
  }
}

module.exports = System;