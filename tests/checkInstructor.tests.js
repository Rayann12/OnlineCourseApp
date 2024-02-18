const sinon = require('sinon');
const jwt = require('jsonwebtoken');

const { checkInstructor } = require('../middlewares');

describe('checkInstructor middleware', () => {

    let req, res, next;

    beforeEach(() => {
        req = {
            token: 'testToken'
        };

        res = {
            render: sinon.stub()
        };

        next = sinon.spy();
    });

    it('should call next if user is instructor', () => {
        sinon.stub(jwt, 'verify').returns({ isInstructor: true });

        checkInstructor(req, res, next);

        expect(next.calledOnce).to.be.true;
    });

    it('should render error if user is not instructor', () => {
        sinon.stub(jwt, 'verify').returns({ isInstructor: false });

        checkInstructor(req, res, next);

        expect(res.render.calledWith('error')).to.be.true;
        expect(next.called).to.be.false;
    });

    afterEach(() => {
        sinon.restore();
    });})
