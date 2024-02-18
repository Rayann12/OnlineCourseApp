const { expect } = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const { generateToken } = require('../middlewares');

describe('generateToken', () => {

    it('should generate token with userId, email, isInstructor', () => {
        const user = {
            _id: '123',
            email: 'test@example.com',
            isInstructor: true
        };
        const token = generateToken(user);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        expect(decoded).to.have.property('userId', user._id);
        expect(decoded).to.have.property('email', user.email);
        expect(decoded).to.have.property('isInstructor', user.isInstructor);
    });

    it('should set expiration if remember is false', () => {
        const token = generateToken({}, false);

        const decoded = jwt.decode(token);

        expect(decoded).to.have.property('exp');
    });

    it('should not set expiration if remember is true', () => {
        const token = generateToken({}, true);

        const decoded = jwt.decode(token);

        expect(decoded).to.not.have.property('exp');
    });
});
