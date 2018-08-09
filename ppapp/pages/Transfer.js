import React, { Component } from 'react';
import { Form, Select, InputNumber, DatePicker, TimePicker, Switch, Slider, Button, Input } from 'antd'
import { FaBus, FaCalendarAlt,FaClock, FaSignInAlt, FaSignOutAlt, FaCircle, FaPencilAlt } from 'react-icons/fa';
const Option = Select.Option
class Transfer extends Component {
  constructor (props) {
    super(props)
    this.state = {}

    this.handleChange = this.handleChange.bind(this);
  } 

  componentDidMount() {

  }

  handleChange(e) {

    this.props.setCommentAt(e.target.value)

  }

  render() {
  
  let ready = <FaCircle className='notready' size={28}/>;

  if (this.props.transfer.ready == 'ok') {
    ready = <FaCircle className='ready' size={28} />;
  }



    return (
    <li>
      <div className='cont'>
        <div className='formgridhigh top'>
          <div className='formgriditem'>
            <FaBus className='icon' size={28} />
          </div>
          <div className='formgriditem'>
            <FaCalendarAlt className='icon' size={28} />
          </div>
          <div className='formgriditem widthlimit'>
            <DatePicker format='DD.MM.YYYY' onChange={this.props.setDateAt} name='startDate' />
          </div>
          <div className='formgriditem'>
            <FaSignOutAlt className='icon' size={28} />
          </div>
          <div className='formgriditem'>
            <Select onChange={this.props.setDepartureAt} defaultValue='departure' style={{ width: 120 }} name='select'>
              <Option value='APT'>Airport</Option>
              <Option value='VSL'>Vessel</Option>
              <Option value='HTL'>Hotel</Option>
            </Select>
          </div>
          <div className='formgriditem'>
            <FaSignInAlt className='icon' size={28} />
          </div>
          <div className='formgriditem'>
            <Select onChange={this.props.setArrivalAt} defaultValue='arrival' style={{ width: 120 }} name='select'>
              <Option value='APT'>Airport</Option>
              <Option value='VSL'>Vessel</Option>
              <Option value='HTL'>Hotel</Option>
            </Select>
          </div>
          <div className='formgriditem'>
            {ready}
          </div>
        </div>

        <div className='formgridlow'>
          <div className='formgriditem'>   
          </div>
          <div className='formgriditem'>
            <FaClock className='icon' size={28} />
          </div>
          <div className='formgriditem'>
            <TimePicker onChange={this.props.setTimeAt} style={{width:120}} minuteStep={10} name='startDate' format = 'HH:mm'/>
          </div>
          <div className='formgriditem'>
            <FaPencilAlt className='icon' size={28} />
          </div>
          <div className='formgriditem widthlimit2 limitright'>
            <Input onChange={this.handleChange.bind(this)}/*onChange={this.props.setCommentAt.bind(this)}*/ placeholder="Comment" />
          </div>
          <div className='formgriditem'>      
          </div>
        </div>
      </div>
    </li>
    );
  }
}

export default Transfer;
