import React, { Component } from 'react';
import Transfer from './Transfer';
import { Menu, Dropdown, Icon } from 'antd';
import request from 'superagent'




class Header extends Component {
  constructor (props) {
    super(props)

    this.state = {
      user: null
    }
  }

  componentDidMount() {
      request
      .get('/getuser')
      .end((err, res) => {
        console.log(res.body)
        this.setState({
          user: res.body
        })
      })
  }

  render() {
    let user = null;
    if(this.state.user) {
      user = this.props.user
    } 
      return ( 
      <div>
        <ul className='header headerlist'>
          <li className='headeritem'><a href="#">Transfers</a></li>
          <li className='headeritem'><a href="http://www.arnaringi.is">About author</a></li>
          <li className='headeritem user'>{this.state.user}</li>
          <li className='headeritem logout'><a href='/logout'>Log out</a></li>
        </ul>
	    </div>

      )
  }
}


export default Header;