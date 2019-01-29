import React, { Component } from 'react';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      data: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }
  
  handleChange(e) {
    console.log("Input value: " + e.target.value)
    this.setState({ value: e.target.value })
  }

  onSubmit = () => {
    var inputValue = this.state.value
    fetch('/compile', {
      method: 'POST',
      body: JSON.stringify({ val: inputValue }),
      headers: {
        "Content-Type": "application/json",
      }
    }).then(res => res.json()).then(result => this.setState({ data: result.body }))
      .catch(error => console.log(error));
  }

  render() {
    return (
      <div>
        <p style={{ fontSize: '20px', fontWeight: 'bold' }}> Haskell Online Teaching Platform </p>
        <textarea align="top" type="text" id="name" name="name" style={{ width: '300px', height: '400px', fontWeight: 'bold', fontSize: '12px' }} value={this.state.value} onChange={this.handleChange} />
        <div style={{ marginTop: '5px', marginLeft: '250px' }} >
          <button onClick={this.onSubmit}> Submit </button>
        </div>
        <div style={{ marginTop: '33px', fontSize: '20px', fontWeight: 'bold' }}> Result: {this.state.data} </div>
      </div>
    )
  }
}

export default App;
