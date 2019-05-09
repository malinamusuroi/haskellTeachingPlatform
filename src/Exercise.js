import React, { Component } from 'react';
import { Button } from 'antd';
import './Exercise.css'
import { Switch, Route, Link, BrowserRouter as Router } from 'react-router-dom'
import { parse } from "./parser"
import { parse as expressionParse } from "./expressionParser"
import visit from "./visitor"
import visitWithExpression from "./visitWithExpression"
import MonacoEditor from 'react-monaco-editor';

class Exercise extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      data: '',
      testValue: '',
      example: '',
      exampleValue: '',
      checkValue: '',
      editor: {},
      badInput: ''
    };
  }

  handleChange = (val) => {
    this.setState({ value: val })
  }

  handleExample = (input) => {
    this.setState({ exampleValue: input.target.value })
  }

  onExampleSubmit = () => {
    if (this.state.value2 !== 'False') {
      this.setState({ example: "Wrong answer" })
    } else if (this.state.value2 !== 'True') {
      this.setState({ example: "Correct answer" })
    } else {
      this.setState({ example: " " })
    }
  }

  handleInput = (input) => {
    this.setState({ checkValue: input.target.value })
  }

  handleBadInput = (input) => {
    this.setState({ badInput: input.target.value })
  }

  handleValue = (input) => {
    this.setState({ testValue: input.target.value })
  }

  onSubmit = () => {
    var inputValue = this.state.value
    var testInput = this.state.testValue
    fetch('/compile', {
      method: 'POST',
      body: JSON.stringify({ val: inputValue, v: testInput }),
      headers: {
        "Content-Type": "application/json",
      }
    }).then(res => res.json()).then(result => this.setState({ data: result.body }))
      .catch(error => console.log(error));
  }

  onCheckIfSame = () => {
    let errors = visit(parse(this.state.value)[0], parse(this.state.checkValue)[0], [], []);
    const instructorErrors = visitWithExpression(parse(this.state.value)[0], expressionParse(this.state.badInput), [])
      .filter(error => error != null);

    errors = errors.concat(instructorErrors);
    this.setState({ compilerErrors: errors });
    const {
      editor,
      decorations: previousDecorations = []
    } = this.state;
    var decorations = editor.deltaDecorations(previousDecorations, errors.map(error => (
      {
        range: new monaco.Range(error.lineNumber, error.startPosition, error.lineNumber, error.endPosition),
        options: { inlineClassName: 'myInlineDecoration' }
      }
    )));
    this.setState({ decorations });
  }

  editorDidMount = (editor) => {
    editor.focus();
    this.setState({ editor });
  }

  renderErrors = () => {
    const formatDiagnostic = ({ lineNumber, startPosition, message }) => {
      return `${lineNumber}:${startPosition}: ${message}\n`;
    };

    return (
      <div>
        <button onClick={() => this.setState({ isShowingErrors: true })}>Show errors</button>
        {this.state.isShowingErrors &&
          <pre>{this.state.compilerErrors.map(formatDiagnostic)}</pre>
        }
      </div>
    )
  };

  render() {
    const options = {
      selectOnLineNumbers: true,
      glyphMargin: true,
      minimap: {
        enabled: false
      }
    };
    return (
      <div>
        <p className="title"> Haskell Online Teaching Platform </p>
        <p>Write a function which returns true if a list contains at least a duplicate</p>
        <b> Given the input [1, 2, 3] what is the output of your program? </b>
        <textarea className="example-area" align="top" type="text" id="name" name="name" value={this.state.exampleValue} onChange={this.handleExample} />
        <button onClick={this.onExampleSubmit}> Submit </button>
        {this.state.example}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <MonacoEditor width="500" height="400" language="haskell" theme="vs-dark" value={this.state.value} options={options} onChange={this.handleChange} editorDidMount={this.editorDidMount} ref={(r) => this.r = r} />
          <div style={{ marginRight: '800px' }}>
            <p> Test your program: </p>
            <textarea align="top" type="text" id="name" name="name" className="test-area" value={this.state.testValue} onChange={this.handleValue} />
          </div>
        </div>
        <div style={{ marginRight: '800px' }}>
          {this.renderErrors()}
          <p> Check if same as sample solution: </p>
          <textarea align="top" type="text" id="name" name="name" className="code-area" value={this.state.checkValue} onChange={this.handleInput} />
          <textarea align="top" type="text" className="code-area" value={this.state.badInput} onChange={this.handleBadInput} />
        </div>
        <div style={{ marginTop: '5px', marginLeft: '270px' }} >
          <button onClick={this.onSubmit}> Submit </button>
        </div>
        <div className="result"> Result: {this.state.data} </div>
        <button onClick={this.onCheckIfSame}> Check value </button>
        <Link to="/" style={{ display: 'block', textAlign: 'center' }}>Previous</Link>
      </div>
    )
  }
}

export default Exercise;
