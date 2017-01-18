import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';

import { createScore } from "./worst-tests";

describe('worst-tests', function () {
  it('should calculate score properly', function () {
    const result = {
      environments: {
        ie: {
          status: "pass",
          retryCount: 0
        }
      }
    };
    createScore(result);
    assert.equal(result.score, 0);
  })
})
