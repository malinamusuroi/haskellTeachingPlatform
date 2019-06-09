import React, { Component } from 'react';
import './Exercise.css';
import { parse } from './parser2';
import { parse as expressionParse } from './parser';
import visitWithExpression from './visitWithExpression';
import Editor from './Editor';
import NavBar from './NavigationBar';
import visit from './visitor';
import HaskellJSProgram from './hsjs/ProgramComponent';

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
      examples: '',
      correctModel: '',
      badPatterns: '',
      savedValues: '',
      val: '',
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
          examples: myJson.examples,
        });
      });
  }

  handleValue = (input) => {
    this.setState({ testValue: input.target.value });
  }

  onSubmit = () => {
    this.updateFunctionList(this.state.value);
    const { value: inputValue, testValue } = this.state;
    fetch('/compile', {
      method: 'POST',
      body: JSON.stringify({ val: inputValue, v: testValue }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(res => res.json()).then(result => {
      this.setState({ data: result.body })
      this.setState({val: (<div>
      <HaskellJSProgram
        defaultValue={this.state.testValue}
      />
    </div>) })
    })
      // eslint-disable-next-line no-console
      .catch(console.error);
  }

  onCodeChange = (code) => {
    this.compareWithModel(code);
    this.runTests(code);
    this.setState({ value: code });
  };

  updateFunctionList = (code) => {
    var newFunctions = parse(code)
      //+ "\n\n", { startRule: 'functionDefinitionList' });
    newFunctions.forEach(function (func) {
      if ([':', '+', '-'].indexOf(func.name) < 0) {
        window.functions[func.name] = func;
      }
    });
  }
  
  compareWithModel = (code) => {
    let errors = [];
    this.setState({ isShowingErrors: false });

    try {
      console.time('parse');
      parse(code);
      console.timeEnd('parse');
      const savedValues = [];
      const { correctModel, badExpressions, badPatterns } = this.state;
      const parse1 = parse(code)[0];
      const parse2 = parse(correctModel)[0];

      console.time('visit');
      errors = visit(parse1, parse2, savedValues, []);
      console.timeEnd('visit');

      this.setState({ savedValues });
      badExpressions.forEach((exp) => {
        const parse3 = parse(code)[0];
        const parse4 = expressionParse(exp.pattern);

        console.time('visitWithExpression');
        let instructorErrors = visitWithExpression(parse3, parse4, [])
          .filter(error => error != null);
        console.timeEnd('visitWithExpression');

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
          name: '', startPosition: 0, endPosition: 50, lineNumber: 0, message: `Parser error: ${err}`,
        }];
      }
    }

    this.setState({ compilerErrors: errors });
    this.editor.displayErrors(errors);
  }

  runTests = (code) => {
    const { tests } = this.state;
    const { savedValues } = this.state;
    const testsToRun = tests.map((elem) => {
      const firstWord = elem.value.substr(0, elem.value.indexOf(' '));
      const second = elem.value.substr(elem.value.indexOf(' ') + 1);
      let savedValue;
      if (savedValues.length !== 0) {
        savedValue = savedValues.find(savedVal => savedVal.dollarValue === firstWord);
      } else {
        savedValue = null;
      }

      return savedValue && savedValue.correspondent ? ({
        ...elem,
        value: `${savedValue.correspondent} ${second}`,
      }) : ({
        ...elem,
        value: ` test ${second}`,
      });
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
        testsToRun[index].result = 'compiler error';
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
        <div style={{ marginLeft: '9px'}}>
          <button type="button" onClick={() => this.setState({ isShowingErrors: true })}>Get hints</button>
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
    return results.map(elem => {
      let val;
      if (elem.result === true) {
        val = '✅'
      } else if (elem.result === false) {
        val = '❌'
      } else {
        val = '⚠️ Compiler Error: The tests cannot be run'
      }
      return <div key={elem.value} className="results">
        <pre>{elem.value}</pre>
        {elem.result !== '' && elem.value !== undefined && <span>{val}</span>}
      </div>
    });
  }

  render() {
    const {
      problem,
      testValue,
      data,
      results,
      examples,
      val,
    } = this.state;


    return (
      <div>
        <NavBar> </NavBar>
        <div style={{ width: '980px', margin: '50px', marginBottom: '90px' }}>
          <p className="problem">{problem}</p>
          <pre className="examples">{examples}</pre>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', width: '800px' }}>
            <Editor
              onChange={this.onCodeChange}
              debounceTimeout={500}
              ref={(editor) => { this.editor = editor; }}
            />
            <div style={{ marginLeft: '2em' }}>
              <p> Test your program: </p>
              <textarea type="text" id="name" className="test-area" value={testValue} onChange={this.handleValue} />
              <div className="result">
                Result:
                {data}
              </div>
            </div>
          </div>
          {val}
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
        </div>
      </div>
    );
  }
}

export default Exercise;
