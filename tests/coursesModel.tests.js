const Course = require('../models/coursesModel');
const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { authenticateMiddleware } = require('../middlewares');
const User = require('../models/userModel');
describe('Course model', () => {

    it('should validate a valid course', () => {
        const course = new Course({
            title: 'Test Course',
            description: 'This is a test course',
            sections: [{
                title: 'Section 1',
                content: 'Hello World'
            }],
            instructor: '1234abc',
            cost: 49.99
        });

        const validationResult = course.validateSync();
        expect(validationResult).to.be.undefined;
    });

    it('should invalidate a course without required fields', () => {
        const course = new Course({
            title: 'Test Course'
        });

        const validationResult = course.validateSync();
        expect(validationResult.errors.description).to.not.be.undefined;
        expect(validationResult.errors.cost).to.not.be.undefined;
    });

});
