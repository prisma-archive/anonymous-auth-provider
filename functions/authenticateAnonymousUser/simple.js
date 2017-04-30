"use strict";

const Lokka = require('lokka').Lokka;
const Transport = require('lokka-transport-http').Transport;

class Simple {
  constructor(url, pat) {
    this.pat = pat;

    this.client = new Lokka({
      transport: new Transport(url, {
        headers: {Authorization: `Bearer ${pat}`},
      })
    });
  }
}

module.exports = Simple;