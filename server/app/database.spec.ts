import * as chai from 'chai';
import { afterEach, beforeEach, describe, it } from 'mocha';
import mongoose from 'mongoose';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { Database } from './database';

chai.use(sinonChai);
describe('Database', () => {
    let connectStub: sinon.SinonStub;

    beforeEach(() => {
        connectStub = sinon.stub(mongoose, 'connect').resolves();
    });

    afterEach(() => {
        connectStub.restore();
    });

    it('should connect to MongoDB', () => {
        Database.connect();

        chai.expect(connectStub).to.have.been.calledWith(Database.mongoURL);
    });

    it('should log a success message when connected', async () => {
        const consoleLogStub = sinon.stub(console, 'log');

        await Database.connect();

        chai.expect(consoleLogStub).to.have.been.calledWith('MongoDB connected');
    });
});
