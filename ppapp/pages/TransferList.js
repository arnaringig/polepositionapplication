import React, { Component } from 'react';
import Transfer from './Transfer';

class TransferList extends Component {
  render() {
      return ( 
      <div>
		<ul>      
		    {this.props.transfers.map((transfer, index) => 
	          <Transfer
	            transfer = {transfer}
	            key={index}
	            setDepartureAt={text => this.props.setDepartureAt(text, index)}
	            setArrivalAt={text => this.props.setArrivalAt(text, index)}
	            //indx={index}
	  			setDateAt={text => this.props.setDateAt(text, index)} 
	  			setTimeAt={text => this.props.setTimeAt(text, index)} 
	  			setCommentAt={text => {
	  				//console.log(text)
	  				this.props.setCommentAt(text, index)
	  			} 
	  			}
	          /> 
	        
		    )}
		</ul>
	  </div>

      )
  }
}


export default TransferList;