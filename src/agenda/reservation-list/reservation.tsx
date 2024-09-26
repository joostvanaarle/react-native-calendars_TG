import isFunction from 'lodash/isFunction';
import PropTypes from 'prop-types';
import XDate from 'xdate';

import React, {Component} from 'react';
import {View, Text} from 'react-native';

import {isToday} from '../../dateutils';
import {getDefaultLocale} from '../../services';
import {RESERVATION_DATE} from '../../testIDs';
import styleConstructor from './style';
import {Theme, AgendaEntry} from '../../types';


export interface ReservationProps {
  date?: XDate;
  item?: AgendaEntry;
  /** Specify theme properties to override specific styles for item's parts. Default = {} */
  theme?: Theme;
  /** specify your item comparison function for increased performance */
  rowHasChanged?: (a: AgendaEntry, b: AgendaEntry) => boolean;
  /** specify how each date should be rendered. date can be undefined if the item is not first in that day */
  renderDay?: (date?: XDate, item?: AgendaEntry) => JSX.Element;
  /** specify how each item should be rendered in agenda */
  renderItem?: (reservation: AgendaEntry, isFirst: boolean) => React.Component | JSX.Element;
  /** specify how empty date content with no items should be rendered */
  renderEmptyDate?: (date?: XDate) => React.Component | JSX.Element;
}

class Reservation extends Component<ReservationProps> {
  static displayName = 'Reservation';

  static propTypes = {
    date: PropTypes.any,
    item: PropTypes.any,
    theme: PropTypes.object,
    rowHasChanged: PropTypes.func,
    renderDay: PropTypes.func,
    renderItem: PropTypes.func,
    renderEmptyDate: PropTypes.func
  };

  style;

  constructor(props: ReservationProps) {
    super(props);

    this.style = styleConstructor(props.theme);
  }

shouldComponentUpdate(nextProps) {
  const dateChanged = this.props.date?.getTime() !== nextProps.date?.getTime();
    const itemChanged = JSON.stringify(this.props.item) !== JSON.stringify(nextProps.item);   
  let changed = dateChanged || itemChanged;
  if (this.props.rowHasChanged) {
    changed = this.props.rowHasChanged(this.props.item, nextProps.item);
  }  
  return changed;
}

 renderDate() {
        const { item, date, renderDay } = this.props;
        const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

        if (isFunction(renderDay)) {
            return renderDay(date, item);
        }
        const today = date && isToday(date) ? this.style.today : undefined;
        const dayNames = getDefaultLocale().dayNamesShort;
        if (date) {
            return (<View style={this.style.day} testID={RESERVATION_DATE}>
                       <Text allowFontScaling={false} style={[this.style.dayText, today]}>
            {dayNames ? dayNames[date.getDay()] : undefined}
          </Text>

          <Text allowFontScaling={false} style={[this.style.dayNum, today]}>
            {date.getDate()}
          </Text>
          <Text 
  allowFontScaling={false} 
  style={[this.style.dayMonth, today, { marginTop: -5 }]}
>{monthNames[date.getMonth()]}</Text>
   
        </View>);
        }
        return <View style={this.style.day}/>;
    }

  render() {
    const {item, date, renderItem, renderEmptyDate} = this.props;
    
    let content;
    if (item) {
      const firstItem = date ? true : false;
      if (isFunction(renderItem)) {
        content = renderItem(item, firstItem);
      }
    } else if (isFunction(renderEmptyDate)) {
      content = renderEmptyDate(date);
    }

    return (
      <View style={this.style.container}>
        {this.renderDate()}
        <View style={this.style.innerContainer}>{content}</View>
      </View>
    );
  }
}

export default Reservation;
