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
      results: [],
      tests: [],
      value: '',
      problem: '',
      data: '',
      testValue: '',
      correctModel: '',
      badPatterns: '',
      example: '',
      exampleValue: '',
      checkValue: '',
      editor: {},
      badInput: ''
    };
  }

  startTimer = () => {
    this.timer = setTimeout(() => {
      this.onCheckIfSame();
      this.runTests();
    }, 2000);
  }

  stopTimer = () => {
    clearTimeout(this.timer);
  }

  handleChange = (val) => {
    this.setState({ value: val })
    this.stopTimer();
    this.startTimer();
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

  componentDidMount = () => {
    fetch("../model.json")
      .then((response) => {
        return response.json();
      }).then((myJson) => {
        this.setState({ correctModel: myJson.model })
        this.setState({ badExpressions: myJson.wrongExpression })
        this.setState({ badPatterns: myJson.wrongPatterns })
        this.setState({ problem: myJson.problem })
        this.setState({ tests: myJson.tests })
      })
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
    let errors = []
    this.setState({ isShowingErrors: false });

    try {
      parse(this.state.value)
      var correctModel = this.state.correctModel;
      var badExpressions = this.state.badExpressions;
      var badPatterns = this.state.badPatterns;
      errors = visit(parse(this.state.value)[0], parse(correctModel)[0], [], []);
      badExpressions.forEach(exp => {
        const instructorErrors = visitWithExpression(parse(this.state.value)[0], expressionParse(exp.pattern), [])
          .filter(error => error != null)

        if (instructorErrors.length !== 0) {
          instructorErrors.map(err => err["message"] = exp.message);
        }
        errors = errors.concat(instructorErrors);
      })

      badPatterns.forEach(exp => {
        let instructorErrors = visit(parse(this.state.value)[0], parse(exp.pattern)[0], [], [])
        if (instructorErrors.length == 0) {
          errors.push({ name: "Instructor error", lineNumber: exp.lineNumber, startPosition: 1, endPosition: 70, message: exp.message })
        }
      })
    } catch (err) {
      if (err.toString().includes("::")) errors = [{ name: "", startPosition: 1, endPosition: 50, lineNumber: 1, message: "Please provide a type signature" }]
      else err = [{ name: "", startPosition: 1, endPosition: 50, lineNumber: 1, message: "" }]
    }

    if (errors.length === 0) { errors.push({ lineNumber: 1, startPosition: 1, message: "No errors to display at the moment!" }) }
    this.setState({ compilerErrors: errors });
    if (errors.length !== 0 && this.state.compilerErrors.length !== 0) {
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
  }

  runTests = () => {
    let map = this.state.tests;
    map.map(elem => {
      if (elem.value[0] === '$') {
        var rest = elem.value.substring(2, elem.value.length)
        elem.value = "twoSame" + rest;
      }
    })
    var inputValue = this.state.value;
    map.map(elem => fetch('/compile', {
      method: 'POST',
      body: JSON.stringify({ val: inputValue, v: elem.value }),
      headers: {
        "Content-Type": "application/json",
      }
    }).then(res => res.json()).then(result => {
      if (!result.isError) {
        elem.result = result.body.includes(elem.match)
      } else {
        elem.result = false;
      }
      this.setState({ results: map })
    }));
  }

  editorDidMount = (editor) => {
    editor.focus();
    this.setState({ editor });
  }

  renderErrors = () => {
    const formatDiagnostic = ({ lineNumber, startPosition, message }) => {
      return `${lineNumber}:${startPosition}: ${message}\n`;
    };
    if (this.state.compilerErrors !== undefined && this.state.compilerErrors.length !== 0) {
      return (
        <div>
          <button onClick={() => this.setState({ isShowingErrors: true })}>Show errors</button>
          {this.state.isShowingErrors &&
            <pre className="error-display">{this.state.compilerErrors.map(formatDiagnostic)}</pre>
          }
        </div>
      )
    }
  }

  renderTests = () => {
    const results = this.state.results;
    return results.map(elem => {

      return (
        <div key={elem.value} className="results">
          <pre>{elem.value}</pre>
          {elem.result !== "" && elem.value !== undefined && <span>{elem.result === true ? '✅' : '❌'}</span>}
        </div>
      )
    });
  }

  render() {
    const options = {
      selectOnLineNumbers: true,
      glyphMargin: true,
      minimap: {
        enabled: false
      }
    };

    return (
      <div style={{ width: '980px', margin: 'auto' }}>
        <p className="problem">{this.state.problem}</p>
        <b> Given the input [1, 2, 3] what is the output of your program? </b>
        <textarea className="example-area" align="top" type="text" id="name" name="name" value={this.state.exampleValue} onChange={this.handleExample} />
        <button onClick={this.onExampleSubmit}> Submit </button>
        {this.state.example}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <MonacoEditor
            height="400"
            language="haskell"
            theme="vs-dark"
            value={this.state.value}
            options={options}
            onChange={this.handleChange}
            editorDidMount={this.editorDidMount}
            ref={(monacoEditor) => this.monacoEditor = monacoEditor}
          />
          <div style={{ marginLeft: '4em' }}>
            <p> Test your program: </p>
            <textarea align="top" type="text" id="name" name="name" className="test-area" value={this.state.testValue} onChange={this.handleValue} />
            <div className="result"> Result: {this.state.data} </div>
          </div>
        </div>
        <div style={{ display: 'flex' }}>
          <div>
            {this.renderErrors()}
          </div>
          <div>
            <button onClick={this.onSubmit}> Submit </button>
          </div>
        </div>
        <div className="tests" > {this.renderTests()} </div>
        <Link to="/" style={{ display: 'block', textAlign: 'center' }}>Previous</Link>
      </div>
    )
  }
}

export default Exercise;
