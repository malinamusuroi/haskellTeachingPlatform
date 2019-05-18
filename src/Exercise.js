import React, { Component } from 'react';
import './Exercise.css';
import { Link } from 'react-router-dom';
import { parse } from './parser';
import { parse as expressionParse } from './expressionParser';
import visit from './visitor';
import visitWithExpression from './visitWithExpression';
import Editor from './Editor';

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
      savedValues: '',
    };
  }

  componentDidMount = () => {
    fetch('../model.json')
      .then(response => response.json()).then((myJson) => {
        this.setState({
          correctModel: myJson.model,
          badExpressions: myJson.wrongExpression,
          badPatterns: myJson.wrongPatterns,
          problem: myJson.problem,
          tests: myJson.tests,
        });
      });
  }

  handleValue = (input) => {
    this.setState({ testValue: input.target.value });
  }

  onSubmit = () => {
    const { value: inputValue, testInput } = this.state;
    fetch('/compile', {
      method: 'POST',
      body: JSON.stringify({ val: inputValue, v: testInput }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(res => res.json()).then(result => this.setState({ data: result.body }))
      // eslint-disable-next-line no-console
      .catch(console.error);
  }

  onCodeChange = (code) => {
    this.compareWithModel(code);
    this.runTests(code);
    this.setState({ value: code });
  };

  compareWithModel = (code) => {
    let errors = [];
    this.setState({ isShowingErrors: false });

    try {
      parse(code);
      const savedValues = [];
      const { correctModel, badExpressions, badPatterns } = this.state;
      errors = visit(parse(code)[0], parse(correctModel)[0], savedValues, []);
      this.setState({ savedValues });
      badExpressions.forEach((exp) => {
        let instructorErrors = visitWithExpression(parse(code)[0], expressionParse(exp.pattern), [])
          .filter(error => error != null);

        if (instructorErrors.length !== 0) {
          instructorErrors = instructorErrors.map(err => ({
            ...err,
            message: exp.message,
          }));
        }
        errors = errors.concat(instructorErrors);
      });

      badPatterns.forEach((exp) => {
        const instructorErrors = visit(parse(code)[0], parse(exp.pattern)[0], [], []);
        if (instructorErrors.length === 0) {
          errors.push({
            name: 'Instructor error', lineNumber: exp.lineNumber, startPosition: 1, endPosition: 70, message: exp.message,
          });
        }
      });
    } catch (err) {
      if (err.toString().includes('::')) {
        errors = [{
          name: '', startPosition: 1, endPosition: 50, lineNumber: 1, message: 'Please provide a type signature',
        }];
      } else {
        errors = [{
          name: '', startPosition: 1, endPosition: 50, lineNumber: 1, message: '',
        }];
      }
    }

    if (errors.length === 0) errors.push({ lineNumber: 1, startPosition: 1, message: 'No errors to display at the moment!' });
    this.setState({ compilerErrors: errors });
    this.editor.displayErrors(errors);
  }

  runTests = (code) => {
    const { tests } = this.state;
    const { savedValues } = this.state;
    const testsToRun = tests.map((elem) => {
      const firstWord = elem.value.substr(0, elem.value.indexOf(' '));
      const second = elem.value.substr(elem.value.indexOf(' ') + 1);
      const savedValue = savedValues.find(savedVal => savedVal.dollarValue === firstWord);

      return savedValue ? ({
        ...elem,
        value: `${savedValue.correspondent} ${second}`,
      }) : elem;
    });
    const inputValue = code;
    testsToRun.forEach((elem, index) => fetch('/compile', {
      method: 'POST',
      body: JSON.stringify({ val: inputValue, v: elem.value }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(res => res.json()).then((result) => {
      if (!result.isError) {
        testsToRun[index].result = result.body.includes(elem.match);
      } else {
        testsToRun[index].result = false;
      }
      this.setState({ results: testsToRun });
    }));
  }

  renderErrors = () => {
    const formatDiagnostic = ({ lineNumber, startPosition, message }) => `${lineNumber}:${startPosition}: ${message}\n`;
    const { compilerErrors } = this.state;
    if (compilerErrors !== undefined && compilerErrors.length !== 0) {
      const { isShowingErrors } = this.state;
      return (
        <div>
          <button type="button" onClick={() => this.setState({ isShowingErrors: true })}>Show errors</button>
          {isShowingErrors
            && <pre className="error-display">{compilerErrors.map(formatDiagnostic)}</pre>
          }
        </div>
      );
    }
    return null;
  }

  renderTests = () => {
    const { results } = this.state;
    return results.map(elem => (
      <div key={elem.value} className="results">
        <pre>{elem.value}</pre>
        {elem.result !== '' && elem.value !== undefined && <span>{elem.result === true ? '✅' : '❌'}</span>}
      </div>
    ));
  }

  render() {
    const {
      problem,
      testValue,
      data,
      results,
    } = this.state;

    return (
      <div style={{ width: '980px', margin: 'auto' }}>
        <p className="problem">{problem}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <Editor
            onChange={this.onCodeChange}
            debounceTimeout={1000}
            ref={(editor) => { this.editor = editor; }}
          />
          <div style={{ marginLeft: '4em' }}>
            <p> Test your program: </p>
            <textarea type="text" id="name" className="test-area" value={testValue} onChange={this.handleValue} />
            <div className="result">
              Result:
              {data}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex' }}>
          <div>
            {this.renderErrors()}
          </div>
          <div>
            <button type="button" onClick={this.onSubmit}> Submit </button>
          </div>
        </div>
        {results.length !== 0 && (
          <div className="tests">
            {this.renderTests()}
          </div>
        )}
        <Link to="/" style={{ display: 'block', textAlign: 'center' }}>Previous</Link>
      </div>
    );
  }
}

export default Exercise;
