const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { authenticateMiddleware } = require('../middlewares');
const User = require('../models/userModel');

describe('Middleware Tests', () => {
    before(async () => {
        // Connect to the MongoDB database before running the tests
        await mongoose.connect(process.env.CONNECTION_STRING);
    });

    after(async () => {
        // Disconnect from the MongoDB database after running the tests
        await mongoose.disconnect();
    });

    describe('authenticateMiddleware', () => {
        let req, res, next;

        beforeEach(() => {
            req = { body: { email: 'test@example.com', password: 'password' } };
            res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
            next = sinon.stub();
        });

        afterEach(() => {
            sinon.restore();
        });

        it('should return 401 if email does not exist', async () => {
            sinon.stub(User, 'findOne').resolves(null);

            await authenticateMiddleware(req, res, next);

            sinon.assert.calledWith(res.status, 401);
        });

        it('should return 403 if password is incorrect', async () => {
            sinon.stub(User, 'findOne').resolves({ password: await bcrypt.hash('correctpassword', 10) });

            await authenticateMiddleware(req, res, next);

            sinon.assert.calledWith(res.status, 403);
        });

        // Add more test cases as needed
    });
});
