import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';

import { enviornmentIcon, enviornmentVersion } from "./environments";

if (Meteor.isClient) {
  describe('environment', function () {
    it('should report correct icons', function () {
      assert.equal(enviornmentIcon("ie||"), 'fa-internet-explorer');
      assert.equal(enviornmentIcon("chrome"), 'fa-chrome');
      assert.equal(enviornmentIcon("chrome|"), 'fa-chrome');
      assert.equal(enviornmentIcon("chrome|9|"), 'fa-chrome');
      assert.equal(enviornmentIcon("safari||"), 'fa-safari');
      assert.equal(enviornmentIcon("iOS||"), 'fa-apple');
      assert.equal(enviornmentIcon("phantomjs||"), 'fa-space-shuttle');
      assert.equal(enviornmentIcon("foo||"), 'fa-fire');
    })

    it('should report correct versions', function () {
      assert.equal(enviornmentVersion("ie||"), '');
      assert.equal(enviornmentVersion("ie|9|"), '9');
    })
  })
}
