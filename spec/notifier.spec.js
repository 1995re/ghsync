'use strict';

process.env.NODE_CONFIG_DIR = require('path').resolve(__dirname + '/fixtures');
global.config = require('../src/config');

var mock = require('mock-require');
var path = require('path');

var resetMockRequire = function () {
    delete require.cache[path.resolve(__dirname, '../src/notifier.js')];
};

describe('sendmail()', function () {
    beforeEach(resetMockRequire);
    afterEach(resetMockRequire);

    it('should call sendMail() method of transporter correctly', function () {

        // to succeed.
        var mockTransporter = generateMockTransporter(true);
        var notifier = require('../src/notifier');

        spyOn(mockTransporter, 'sendMail');

        notifier.sendmail('path', 'stdout', 'stderr');

        expect(mockTransporter.sendMail).toHaveBeenCalledWith({
            from: jasmine.any(String),
            to: jasmine.any(String),
            subject: jasmine.any(String),
            text: jasmine.any(String)
        }, jasmine.any(Function));
    });

    it('should invoke callback after sendMail() succeeded', function () {

        // to succeed.
        generateMockTransporter(true);
        var notifier = require('../src/notifier');

        spyOn(console, 'log');

        notifier.sendmail('path', 'stdout', 'stderr');

        setTimeout(function () {
            expect(console.log).toHaveBeenCalledWith('email notification sent');
        }, 100);
    });

    it('should invoke callback after sendMail() caused error', function () {

        // to cause error.
        generateMockTransporter(false);
        var notifier = require('../src/notifier');

        spyOn(console, 'log');

        notifier.sendmail('path', 'stdout', 'stderr');

        setTimeout(function () {
            expect(console.log).toHaveBeenCalledWith('An error occurred');
        }, 100);
    });
});

function generateMockTransporter(toSucceed) {

    var MockTransporter = function (toSucceed) {
        this.toSucceed = toSucceed;
    };

    MockTransporter.prototype = {
        sendMail: function (options, callback) {
            callback(this.toSucceed ? null : 'An error occurred', 'res');
        }
    };

    var mockTransporter = new MockTransporter(toSucceed);

    var mockNodemailer = {
        createTransport: function (obj) {
            return mockTransporter;
        }
    };

    var mockSmtpTransport = function (obj) {
        return {};
    };

    mock('nodemailer', mockNodemailer);
    mock('smtpTransport', mockSmtpTransport);

    return mockTransporter;
}
