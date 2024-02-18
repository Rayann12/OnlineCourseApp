const sinon = require('sinon');
const { expect } = require('chai');
const transporter = require('../transporter');  
const { sendMail } = require('../middlewares');

describe('sendMail', () => {

  let sendMailStub;
  let consoleSpy;

  beforeEach(() => {
    sendMailStub = sinon.stub(transporter, 'sendMail');
    sendMailStub.rejects(new Error('Test error'));

    consoleSpy = sinon.spy(console, 'error');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should handle send mail error', async () => {
    await sendMail('test@example.com', 'xyz');
    
    expect(consoleSpy.calledWith('Error sending activation email:', sinon.match.instanceOf(Error))).to.be.true;
  });

});
