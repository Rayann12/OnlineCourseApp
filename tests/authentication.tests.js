const chai = require('chai');
const sinon = require('sinon');
const { spy, stub } = sinon;
const { authenticateMiddleware } = require('../middlewares');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
chai.use(require('sinon-chai'));
expect = chai.expect;
describe('authenticateMiddleware', () => {
    let status,
        json,
        res;
    beforeEach(() => {
        status = stub();
        json = spy();
        res = { json, status };
        status.returns(res);
    });
    it('should return 401 error if user not found', async () => {
        const req = {
            body: {
                email: 'nonexistent@example.com',
                password: 'password123'
            }
        };
        sinon.stub(User, 'findOne').resolves(null);

        await authenticateMiddleware(req, res, () => { });
        expect(res.status).to.have.been.calledWith(401);
        expect(res.json).to.have.been.calledWith({
            message: 'Invalid credentials'
        });
        User.findOne.restore();
    });

    it('should return 403 error if password is invalid', async () => {
        const req = {
            body: {
                email: 'test@example.com',
                password: 'wrongpassword'
            }
        };
        const user = {
            email: 'test@example.com',
            password: 'correctpassword'
        };
        sinon.stub(User, 'findOne').resolves(user);
        await authenticateMiddleware(req, res, () => { });
        expect(res.status).to.have.been.calledWith(403);
        expect(res.json).to.have.been.calledWith({
            message: 'Invalid credentials'
        });
        User.findOne.restore();
    });

    it('should return 401 if not instructor tries to log in as instructor', async () => {
        const req = {
            body: {
                email: 'test@example.com',
                password: 'correctpassword',
                asInstructor: true
            }
        };
        const user = {
            email: 'test@example.com',
            password: 'correctpassword',
            isInstructor: false
        };
        sinon.stub(User, 'findOne').resolves(user);
        sinon.stub(bcrypt, 'compare').resolves(true);
        await authenticateMiddleware(req, res, () => { });
        expect(res.status).to.have.been.calledWith(401);
        expect(res.json).to.have.been.calledWith({
            message: 'Only instructors can log in as instructors'
        });
        User.findOne.restore();
        bcrypt.compare.restore();
    });

    it('should call next if credentials are valid', async () => {
        const req = {
            body: {
                email: 'test@example.com',
                password: 'correctpassword'
            }
        };
        const user = {
            email: 'test@example.com',
            password: 'correctpassword',
            isInstructor: true
        };
        sinon.stub(User, 'findOne').resolves(user);
        sinon.stub(bcrypt, 'compare').resolves(true);
        const nextSpy = sinon.spy();
        await authenticateMiddleware(req, res, nextSpy);
        expect(nextSpy).to.have.been.calledOnce;
        User.findOne.restore();
        bcrypt.compare.restore();
    });

    it('should handle and return error on failure', async () => {
        const req = {
            body: {
                email: 'test@example.com',
                password: '<PASSWORD>'
            }
        };
        const user = {
            email: 'test@example.com',
            password: '<PASSWORD>',
            isInstructor: true
        };
        sinon.stub(User, 'findOne').resolves(user);
        const compareStub = sinon.stub(bcrypt, 'compare').rejects(new Error('Bcrypt failure'));
        await authenticateMiddleware(req, res, () => { });
        expect(res.status).to.have.been.calledWith(500);
        expect(res.json).to.have.been.calledWith({
            message: 'Internal Server Error'
        });
        User.findOne.restore();
        compareStub.restore();
    });
});
