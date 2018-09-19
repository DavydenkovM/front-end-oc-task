import 'js-polyfills/html';

import React from 'react';
import ReactDOM from 'react-dom';
import Calendar from './Calendar';

import Enzyme, { mount  } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

beforeAll(() => {
  Enzyme.configure({ adapter: new Adapter()  });
});

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Calendar />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it('renders correctly', () => {
  const wrapper = mount(<Calendar />);

  expect(wrapper.render()).toMatchSnapshot();
});

it('allows to click on arrows to change selected month', () => {
  const wrapper = mount(<Calendar />);

  const leftArrow = wrapper.find('.calendar-left-arrow');
  const rightArrow = wrapper.find('.calendar-right-arrow');
  const calendarHeader = wrapper.find('.calendar-header-date').find('span');

  leftArrow.simulate('click');
  expect(calendarHeader.html()).toBe('<span>August<br>2018</span>')

  rightArrow.simulate('click');

  expect(calendarHeader.html()).toBe('<span>September<br>2018</span>')
  expect(wrapper.render()).toMatchSnapshot(null, `renders correctly 1`);
});

it('allows to toggle grid', () => {
  const wrapper = mount(<Calendar />);

  const toggleGridLink = wrapper.find('.toggle-grid-link');
  toggleGridLink.simulate('click');

  const calendarCell = wrapper.find('.calendar-cell').first();
  expect(calendarCell.hasClass('calendar-cell--with-grid')).toBe(true);

  toggleGridLink.simulate('click');
  expect(calendarCell.hasClass('calendar-cell--with-grid')).toBe(false);
});
