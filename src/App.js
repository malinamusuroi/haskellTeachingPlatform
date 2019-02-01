import React, { Component } from 'react';
import  './App.css'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      data: '',
      testValue: '',
      example: '',
      exampleValue: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleExample = this.handleExample.bind(this);
    this.handleValue = this.handleValue.bind(this);
    this.handleExample = this.handleExample.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }
  
  handleChange(input) {
    console.log("Input value: " + input.target.value)
    this.setState({ value: input.target.value })
  }

  handleExample(input) {
    this.setState({ exampleValue: input.target.value })
  }

  onExampleSubmit = () =>  {
      if(this.state.value2 !== 'False') {
        this.setState({ example: "Wrong answer" })
      } else if(this.state.value2 !== 'True')  {
        this.setState({ example: "Correct answer" })
      } else {
        this.setState({ example: " " })
      }
  }

  handleValue(input) {
    console.log("Input value: " + input.target.value)
    this.setState({ testValue: input.target.value })
  }

  onSubmit = () => {
    var inputValue = this.state.value
    var testInput = this.state.testValue
    fetch('/compile', {
      method: 'POST',
      body: JSON.stringify({ val: inputValue, v: testInput}),
      headers: {
        "Content-Type": "application/json",
      }
    }).then(res => res.json()).then(result => this.setState({ data: result.body }))
      .catch(error => console.log(error));
  }

  render() {
    return (
      <div>
        <p className="title"> Haskell Online Teaching Platform </p>
        <p>Write a function which returns true if a list contains at least a duplicate</p>
        <b> Given the input [1, 2, 3] what is the output of your program? </b>
        <textarea className="example-area" align="top" type="text" id="name" name="name" value={this.state.exampleValue} onChange={this.handleExample} />
        <button  onClick={this.onExampleSubmit}> Submit </button>
         {this.state.example}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px'}}>
         <textarea align="top" type="text" id="name" name="name" className="code-area" value={this.state.value} onChange={this.handleChange} />
          <div style={{marginRight: '800px'}}>
            <p> Test your program: </p>
            <textarea align="top" type="text" id="name" name="name" className="test-area" value={this.state.testValue} onChange={this.handleValue} />
           </div>
         </div>
        <div style={{ marginTop: '5px', marginLeft: '270px' }} >
          <button onClick={this.onSubmit}> Submit </button>
        </div>
        <div className="result"> Result: {this.state.data} </div>
      </div>
    )
  }
}

export default App;
