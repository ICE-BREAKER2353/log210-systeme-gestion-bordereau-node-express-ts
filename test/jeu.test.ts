import * as mocha from 'mocha';
import * as chai from 'chai';
import chaiHttp = require('chai-http');

import app from '../src/App';

chai.use(chaiHttp);
const expect = chai.expect;

let testNom1 = 'Jean-Marc';
let testNom2 = 'Pierre';

describe('GET /api/v1/jeu/demarrerJeu/:id', () => {

  it('responds with successful first call for player ' + testNom1, () => {
    return chai.request(app).get('/api/v1/jeu/demarrerJeu/' + testNom1)
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res).to.be.json;
        expect(res.body.nom).to.equal(testNom1);
      });
  });

  it('duplicate call for player '  + testNom1 + ' responds with bad request', () => {
    return chai.request(app).get('/api/v1/jeu/demarrerJeu/' + testNom1)
      .then(
        () => expect.fail(null, null, 'Should not succeed.'),
        ({ response }) => {
          expect(response).to.have.status(400);
          expect(response).to.be.json;
          expect(response.body.error).to.include('existe déjà');
        }
      )
  });

});

describe('GET /api/v1/jeu/jouer/:id', () => {

  // plusieurs appels à jouer (pour valider la somme aléatoire)
  for(let i=0; i < 20; i++) {
    it('responds with successful call for initialized player ' + testNom1, () => {
      return chai.request(app).get('/api/v1/jeu/jouer/' + testNom1)
        .then(res => {
          expect(res.status).to.equal(200);
          expect(res).to.be.json;
          expect(res.body.résultat.lancers).to.equal(i+1);
          expect(res.body.résultat.v1).to.be.above(0).and.below(7);
          expect(res.body.résultat.v2).to.be.above(0).and.below(7);
          expect(res.body.résultat.somme).to.equal(res.body.résultat.v1 + res.body.résultat.v2);
          expect(res.body.résultat.nom).to.equal(testNom1);
        });
    });  
  }

  it('Call responds with bad request when player is not intialized ' + testNom2, () => {
    return chai.request(app).get('/api/v1/jeu/jouer/' + testNom2)
      .then(        // https://github.com/chaijs/chai-http/issues/75#issuecomment-292338762
        () => expect.fail(null, null, 'Should not succeed.'),
        ({ response }) => {
          expect(response).to.have.status(404);
          expect(response).to.be.json;
          expect(response.body.error).to.include("n'existe pas");
          expect(response.body.error).to.include(testNom2);
        }
      )
  });

});

describe('GET /api/v1/jeu/terminerJeu/:id', () => {
  it('responds with successful call for player ' + testNom1, () => {
    return chai.request(app).get('/api/v1/jeu/terminerJeu/' + testNom1)
      .then(res => {
        expect(res.status).to.equal(200);
        expect(res).to.be.json;
        expect(res.body.résultat.nom).to.equal(testNom1);
      });
  }); 

  it('Call responds with bad request when player does not exist ' + testNom1, () => {
    return chai.request(app).get('/api/v1/jeu/jouer/' + testNom1)
      .then(
        () => expect.fail(null, null, 'Should not succeed.'),
        ({ response }) => {
          expect(response).to.have.status(404);
          expect(response).to.be.json;
          expect(response.body.error).to.include("n'existe pas");
          expect(response.body.error).to.include(testNom1);
        }
      )
  });


});
