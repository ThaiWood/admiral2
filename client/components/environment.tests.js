import React from 'react';
import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { shallow } from 'enzyme';

import Environment from "./environment";

if (Meteor.isClient) {
  describe('Environment component', function () {
    it('should render correct icons', function () {
      const item = shallow(<Environment environment="ie|9|wide" />);
      assert(item.find('.fa.fa-internet-explorer').length, 1);
    })

    it('should render version and width', function () {
      const item = shallow(<Environment environment="ie|9|wide" />);
      assert(item.find('span').text(), '9 wide');
    })
  })
}
