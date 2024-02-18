const { verifyTokenMiddleware } = require('../middlewares');
const jwt = require('jsonwebtoken');
const sinon = require('sinon');
const { spy, stub } = sinon;
const chai = require('chai');
chai.use(require('sinon-chai'));
expect = chai.expect;
describe('verifyTokenMiddleware', () => {
    let status,
        json,
        res,
        next;
    beforeEach(() => {
        status = stub();
        json = spy();
        res = { json, status };
        status.returns(res);
        next = spy();
    });
    it('should return 401 if no token is provided', () => {
        const req = { cookies: {} };

        verifyTokenMiddleware(req, res);

        expect(res.status).to.have.been.calledWith(401)
        expect(res.json).to.have.been.calledWith({ message: 'Incorrect Credentials' });
    });

    it('should return 403 if invalid token is provided', () => {
        const req = { cookies: { access_token: 'invalidtoken' } };
        const jwtVerifyStub = sinon.stub(jwt, 'verify');
        jwtVerifyStub.callsFake((token, secret, callback) => {
            callback(true, 1); // simulate invalid token
        });
        verifyTokenMiddleware(req, res);

        expect(res.status).to.have.been.calledWith(403);
        expect(res.json).to.have.been.calledWith({ message: 'Forbidden' });

        jwt.verify.restore();
    });

    it('should call next if valid token is provided', () => {
        const req = { cookies: { access_token: 'validtoken' } };

        const jwtVerifyStub = sinon.stub(jwt, 'verify');
        jwtVerifyStub.callsFake((token, secret, callback) => {
            callback(false, 1); // simulate invalid token
        });
        verifyTokenMiddleware(req, res, next);
        expect(next.callCount).to.equal(1);
        jwt.verify.restore();
    });

});
