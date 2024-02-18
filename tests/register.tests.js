const sinon = require('sinon');
const { expect } = require('chai');
const sandbox = sinon.createSandbox();


const { registerMiddleware } = require('../middlewares');
const User = require('../models/userModel');
const Activation = require('../models/activationModel');

describe('registerMiddleware', () => {

    let req, res, next;

    beforeEach(() => {
        req = {
            body: {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            }
        };

        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.spy()
        };

        next = sinon.spy();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should return error if email already exists', async () => {
        sinon.stub(User, 'findOne').resolves({ email: 'test@example.com' });

        await registerMiddleware(req, res, next);

        expect(res.status.calledWith(400)).to.be.true;
    });

    it('should create and save activation token', async () => {
        sinon.stub(User, 'findOne').resolves(null);
        sinon.stub(Activation.prototype, 'save').resolves();

        await registerMiddleware(req, res, next);

        expect(Activation.prototype.save.calledOnce).to.be.true;
    });

    it('should handle error saving activation token', async () => {
        sinon.stub(User, 'findOne').resolves(null);
        sinon.stub(Activation.prototype,'save').rejects(new Error('Error saving activation token'));
        await registerMiddleware(req, res, next);
        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWith({ message: 'Registration failed. Please try again.' })).to.be.true;
    });

});
