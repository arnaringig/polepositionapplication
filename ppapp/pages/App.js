import React, { Component } from 'react';
import request from 'superagent'
import { Form, Input, Select,TimePicker, InputNumber, DatePicker, Switch, Slider, Button } from 'antd'
import { FaPlusSquare, FaMinusSquare } from 'react-icons/fa';


const {TextArea}= Input
const Option = Select.Option
import TransferList from './TransferList'
import Header from './Header'
class App extends Component {
  constructor (props) {
    super(props)

    
    this.handleShipChange = this.handleShipChange.bind(this);
    this.handleOperatorChange = this.handleOperatorChange.bind(this);
    this.newTransferSubmitHandler = this.newTransferSubmitHandler.bind(this);
    

    // the state is React´s way of storing data
    this.state = {

      value: null,
      selectedship: null,   // this is where the selected ship is kept
      selecteddate: null,   // this is where the selected date from datepicker is kept
      shipnames: null,      // This is where  the list of ships is put when data arrives from crm
      shipoperators:null,   // This is where the list of ship operators is put when data arrives from crm
      operatorsbool: true,  //  this is to enable the select of operators when the select field has been populated with data at the right time.
      submitbool : true, // this is changed to false to enable the submit button at the right time.
      scdatebool: true,
      plusminusbool : true,
      selectedoperator: 'Select operator', // a placeholder initially but serves to keep the operators name for select 
      operatorGUID: null, //þetta og namedate eru notuð til að finna salesorderid
      salesorderGUID: null,  // this is where the unique id of the salesorder is kept so that buses can be posted to the correct location
      namedate : null, //namedate er t.d SEA ENDURANCE - 22.07.2018,  þetta og operatorGUID eru notuð til að finna salesorderid    
   
      transfers: [

     
      ]
    }
  }
 
  //This function runs automatically at the start of the application
  componentDidMount() {     
    request
    .get('/shipnames')     
    .end((err, res) => {
      this.setState({ 
        shipnames: res.body.value
      })
      //console.log(res.body.value)
    });


  }

  //This function handles the change of selected ships and sets state accordingly.
  handleShipChange(value) {
    console.log(`selectedoperator ${value}`);
    this.setState({ 
      selectedoperator : 'Select operator',
      selectedship : value,
      scdatebool : false,
      shipoperators : null,
      operatorsbool : true
    })
  }

  handleDateChange(event) {
    let date = event.format('DD.MM.YYYY')
    let namedate = this.state.selectedship +' - '+ date
    this.setState({'namedate' : namedate}) // þetta og 
    const payload = {
      'namedate': namedate
    }
    request
    .post('/blue')
    .send(payload)
    .end((err, res) => {
      this.setState({shipoperators: res.body, operatorsbool: false})  
    })
  }

  handleOperatorChange(value) {
    console.log(`selected ${value}`);
    this.setState({selectedoperator: value})
    let shipoperatorid = null
    this.state.shipoperators.map(shipoperator => {
      if(shipoperator.eg_name == value) {
        shipoperatorid = shipoperator.eg_shipoperatorid
        this.setState({operatorGUID: shipoperatorid})
        console.log(shipoperatorid)
      }
    })
    const payload = {
      shipoperatorid : shipoperatorid,
      namedate : this.state.namedate
    }
    request
    .post('/darkbrown')
    .send(payload)
    .end((err, res) => {
      this.setState({
        salesorderGUID: res.body.value[0].salesorderid,
        plusminusbool : false
      })
    })
  }


  checkifOK() {
    for(let i=0; i<this.state.transfers.length; i++) {
      if(this.state.transfers[i].departure != null && this.state.transfers[i].arrival != null && this.state.transfers[i].time != null && this.state.transfers[i].date != null) {
        this.state.transfers[i].ready = 'ok'
      }   
    }
    for(let i=0; i<this.state.transfers.length; i++) {
      if(this.state.transfers[i].ready == 'ok'){
        this.setState({submitbool: false});
      } else {
        this.setState({submitbool: true});
      } 
    }


  }



  newTransferSubmitHandler = e => {
    e.preventDefault();
    if(this.state.transfers.length < 6) {
      this.setState({ 
        transfers: [
          ...this.state.transfers,
          {
            departure: null,
            arrival: null,
            time: null,
            date: null,
            comment: null,
            ready: null
          }   
        ]
      });
    }
    this.setState({submitbool: true});
  }

  removeLastTransfer = e => {
    
    e.preventDefault();
    if(this.state.transfers.length > 0) {
      this.setState({
        transfers: [
          ...this.state.transfers.slice(0,-1),
        ]
      });
    }
    console.log('herher')
    console.log(this.state.transfers.length)
    if(this.state.transfers.length < 2) {
      this.setState({submitbool: true})
    }
    
  }

  setDateAt = (thedate, indexToChange) => {
    //console.log(thedate.format('DD.MM.YYYY'))

    this.setState({
      transfers: this.state.transfers.map((transfer, index) => {
        if (index === indexToChange) {
          transfer.date=thedate.format('DD.MM.YYYY')
        }
        return transfer;
      })
    });
    this.checkifOK();
  }

  setTimeAt = (thetime, indexToChange) => {
    console.log(thetime.format('HH:mm'))

    this.setState({
      transfers: this.state.transfers.map((transfer, index) => {
        if (index === indexToChange) {
          transfer.time=thetime.format('HH:mm')
        }
        return transfer;
      })
    });
    this.checkifOK();
  }

  setDepartureAt = (departure, indexToChange) => {
    
    this.setState({
      transfers: this.state.transfers.map((transfer, index) => {
        if (index === indexToChange) {
          return {
            ...transfer,
            departure
          };
        }
        return transfer;
      })
    });
    this.checkifOK();
  }


  setCommentAt = (comment, indexToChange) => {
   
    this.setState({
      transfers: this.state.transfers.map((transfer, index) => {
        if (index === indexToChange) {
          transfer.comment=comment
          return transfer;
        }
        return transfer;
      })
    });
  }

  setArrivalAt = (arrival, indexToChange) => {
    this.setState({
      transfers: this.state.transfers.map((transfer, index) => {
        if (index === indexToChange) {
          return {
            ...transfer,
            arrival
          };
        }
        return transfer;
      })
    });
    this.checkifOK();
  }



  handleSubmitCREATEBUSINSYSTEM(event) {
    //console.log('MASTER ARM OFF')
    if(this.state.salesorderGUID) {
      request
        .post('/green')
        .send({ 'salesorderid@odata.bind': 'https://polepositionlogistics.api.crm4.dynamics.com/api/data/v8.2/salesorders('+ this.state.salesorderGUID +')', // sales orderid 
                'productid@odata.bind': 'https://polepositionlogistics.api.crm4.dynamics.com/api/data/v8.2/products(989420ef-7e05-e711-80da-3863bb35ff48)', //the bus
                'uomid@odata.bind': 'https://polepositionlogistics.api.crm4.dynamics.com/api/data/v8.2/uoms(d19dbd62-1dd7-e611-80d2-3863bb35ff48)',  // STK
                'quantity': parseInt(3), // meaningless quantity
                'isproductoverridden': 'false',
                'eg_productlinedescription' : 'hallo'
         })
        .set('accept', 'json')
        .end((err, res) => {
          if(err){
            console.log(err)
          } else {
            console.log(res) 
          }
        });
    }
    event.preventDefault();
  }


  handleSubmitPRUFA(event) {
    //console.log('MASTER ARM OFF')
    if(this.state.salesorderGUID) {
      for(let i=0;i<this.state.transfers.length;i++) {
        if(this.state.transfers[i].ready != null) {
          request
            .post('/green')
            .send({ 'salesorderid@odata.bind': 'https://polepositionlogistics.api.crm4.dynamics.com/api/data/v8.2/salesorders('+ this.state.salesorderGUID +')', // sales orderid 
                    'productid@odata.bind': 'https://polepositionlogistics.api.crm4.dynamics.com/api/data/v8.2/products(989420ef-7e05-e711-80da-3863bb35ff48)', //the bus
                    'uomid@odata.bind': 'https://polepositionlogistics.api.crm4.dynamics.com/api/data/v8.2/uoms(d19dbd62-1dd7-e611-80d2-3863bb35ff48)',  // STK
                    'quantity': parseInt(1), // meaningless quantity
                    'isproductoverridden': 'false',
                    'eg_productlinedescription' : this.state.transfers[i].time + ' ' + this.state.transfers[i].departure + ' - ' + this.state.transfers[i].arrival
             })
            .set('accept', 'json')
            .end((err, res) => {
              if(err){
                console.log(err)
              } else {
                console.log(res) 
              }
            });
        }
      }
    }

    this.setState({

      value: null,
      selectedship: null,   // this is where the selected ship is kept
      selecteddate: null,   // this is where the selected date from datepicker is kept
      shipnames: null,      // This is where  the list of ships is put when data arrives from crm
      shipoperators:null,   // This is where the list of ship operators is put when data arrives from crm
      operatorsbool: true,  //  this is to enable the select of operators when the select field has been populated with data at the right time.
      submitbool : true, // this is changed to false to enable the submit button at the right time.
      scdatebool: true,
      plusminusbool : true,
      selectedoperator: 'Select operator', // a placeholder initially but serves to keep the operators name for select 
      operatorGUID: null, //þetta og namedate eru notuð til að finna salesorderid
      salesorderGUID: null,  // this is where the unique id of the salesorder is kept so that buses can be posted to the correct location
      namedate : null, //namedate er t.d SEA ENDURANCE - 22.07.2018,  þetta og operatorGUID eru notuð til að finna salesorderid    
   
      transfers: [

     
      ]


    })
    alert("Buses submitted to system");
    event.preventDefault();
  }

  render() {
    console.log(this.state.transfers.length)

    let shipnames = ['loading'];
    let operators = ['loading'];
    //console.log(this.state.transfers[0].comment)

    this.state.transfers.map(transfer => {
      console.log(transfer.departure)
    })

    let mailmessage = [];

    if(this.state.transfers){
      this.state.transfers.map((transfer,i) => {
        let temp = (transfer.date ? transfer.date + '     ' : '') +
                   (transfer.time ? transfer.time + '     ' : '') + 
                   (transfer.departure ? transfer.departure  + ' - ' : '') + 
                   (transfer.arrival ? transfer.arrival : '') + 
                   (transfer.comment ? '     '+transfer.comment : '');

        mailmessage.push((i==0 ? '' : '\n' )+temp);
      })

    }

    let minusbutton;
    let plusbutton;
  

    if (!this.state.plusminusbool) {
      minusbutton = <FaMinusSquare size={70}/>;
    } else {
      minusbutton = <FaMinusSquare className='notready' size={70}/>
    }
    if (!this.state.plusminusbool) {
      plusbutton = <FaPlusSquare size={70}/>;
    } else {
      plusbutton = <FaPlusSquare className='notready' size={70}/>
    }



    if(this.state.shipnames){
      for(let i=0;i<this.state.shipnames.length;i++) {
        shipnames[i] = this.state.shipnames[i].eg_name
      }
    }
  
    if(this.state.shipoperators){
      for(let i=0;i<this.state.shipoperators.length;i++) {
        operators[i] = this.state.shipoperators[i].eg_name
      }
    }
  
    console.log(this.state.shipoperators)
    
    return (

    <div> 
      <div>
        <Header/>
      </div>
    <div className='appcontainer'>
      <div className='message'>
        <TextArea className='message' value={mailmessage} rows={4} />
      </div>

      <div className='logiccontainer'>

        <div className='leftmenu'>
         <div className='leftmenuframe'>

          <div className='leftmenuitem'>
            <Select
              showSearch
              style={{ width: 200 }}
              placeholder="Select a ship"
              optionFilterProp="children"
              onChange={this.handleShipChange}
              filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
                {shipnames.map((shipname,i) => {
                  return(<Option key={i} value={shipname}>{shipname}</Option>)
                })}
            </Select>
          </div>
          <div className='leftmenuitem'>
            <DatePicker style={{ width: 200 }} disabled={this.state.scdatebool} name='startDate'  onChange={this.handleDateChange.bind(this)}/>
          </div>

          <div className='leftmenuitem'>
            <Select
              disabled = {this.state.operatorsbool}
              showSearch
              value = {this.state.selectedoperator}
              style={{ width: 200 }}
              optionFilterProp="children"
              onChange={this.handleOperatorChange}
              filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              {
                operators.map((operator,i) => {
                  return(<Option key={i} value={operator}>{operator}</Option>)
                })
              }
            </Select>
          </div>
          <div className='leftmenuitem'>
            <button disabled={this.state.plusminusbool}  onClick={this.removeLastTransfer}>
              {minusbutton}
            </button>
            <button disabled={this.state.plusminusbool}  onClick={this.newTransferSubmitHandler}>
              {plusbutton}
            </button>
          </div>
          <div className='leftmenuitem test'>
            <Button type='primary submitbutton' style={{ width: 200 }} disabled={this.state.submitbool} /*type="submit"*/ value="Submit" onClick={this.handleSubmitPRUFA.bind(this)}>Submit buses</Button>
          </div>
         </div>
        </div>
        <div>
          <TransferList
            transfers={this.state.transfers}
            setDepartureAt={this.setDepartureAt}
            setArrivalAt={this.setArrivalAt}
            setDateAt={this.setDateAt}
            setTimeAt={this.setTimeAt}
            setCommentAt={this.setCommentAt}
          />
        </div>
      </div>
    </div>


    </div>
    );
  }
}

export default App;
