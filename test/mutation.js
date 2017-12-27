const {expect} = require('chai');

const {start, stop, runQuery} = require('../server');

describe('Mutation', () => {
  describe('#createUser', () => {
    let server;

    before(() => {
      return start().then((instance) => {
        server = instance;
      });
    });
    
    after(() => {
      return stop(server);
    });

    it('should create a user', () => {
      return runQuery(server, `mutation {
        createUser(input: {login: "testUser"}) {
          login
        }
      }`).then(({body: {data, errors}}) => {
        expect(data).to.eql({
            createUser: {
              login: "testUser"
            }
        });
      })
    });
  });
});
