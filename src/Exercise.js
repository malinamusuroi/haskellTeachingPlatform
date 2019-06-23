import React, { Component } from 'react';
import './Exercise.css';
import {
  Row, Col, Input, Button, Divider, Icon,
} from 'antd';
import { parse } from './parser2';
import { parse as expressionParse } from './parser';
import visitWithExpression from './visitWithExpression';
import Editor from './Editor';
import NavBar from './NavigationBar';
import visit from './visitor';
import HaskellJSProgram from './hsjs/ProgramComponent';

class Exercise extends Component {
  initialState = {
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
    compilerErrors: [],
    isShowingErrors: null,
    displayedSolution: null,
  };

  constructor(props) {
    super(props);
    this.state = this.initialState;
  }

  updateProblem = () => {
    const { match: { params } } = this.props;
    const { exercise: previousExercise } = this.state;
    if (params.exercise === previousExercise) {
      return;
    }
    const { exercise } = params;
    this.setState({ exercise });
    fetch(`../${exercise}.json`)
      .then(response => response.json())
      .then((myJson) => {
        this.setState({
          ...this.initialState,
          correctModel: myJson.model,
          badExpressions: myJson.wrongExpression,
          badPatterns: myJson.wrongPatterns,
          problem: myJson.problem,
          tests: myJson.tests,
          examples: myJson.examples,
        });
      })
      // eslint-disable-next-line no-console
      .catch(console.error);
    this.editor.clear();
  }

  componentDidMount = () => {
    this.updateProblem();
  }

  componentDidUpdate = () => {
    this.updateProblem();
  };

  handleValue = (input) => {
    this.setState({ testValue: input.target.value });
  }

  onDebug = () => {
    const { value } = this.state;
    this.updateFunctionList(value);
    const { testValue } = this.state;

    this.setState({
      debuggerComponent: (
        <div>
          <HaskellJSProgram
            key={testValue}
            defaultValue={testValue}
          />
        </div>
      ),
    });
  }

  onCodeChange = (code) => {
    this.compareWithModel(code);
    this.runTests(code);
    this.setState({ value: code });
  };

  updateFunctionList = (code) => {
    const newFunctions = parse(code);
    newFunctions.forEach((func) => {
      if ([':', '+', '-'].indexOf(func.name) < 0) {
        window.functions[func.name] = func;
      }
    });
  }

  compareWithModel = (code) => {
    let errors = [];
    this.setState({ isShowingErrors: false });

    try {
      parse(code);
      const savedValues = [];
      const { correctModel, badExpressions, badPatterns } = this.state;
      const parse1 = parse(code)[0];
      const parse2 = parse(correctModel)[0];

      errors = visit(parse1, parse2, savedValues, []);

      errors = Array.from(new Set(errors));

      this.setState({ savedValues });
      badExpressions.forEach((exp) => {
        const parse3 = parse(code)[0];
        const parse4 = expressionParse(exp.pattern);

        let instructorErrors = visitWithExpression(parse3, parse4, [])
          .filter(error => error != null);

        if (instructorErrors.length !== 0) {
          instructorErrors = instructorErrors.map(err => ({
            ...err,
            message: exp.message,
          }));
          const locations = instructorErrors.map(({ lineNumber, startPosition, endPosition }) => ({
            lineNumber, startPosition, endPosition,
          }));
          errors = errors.filter(({ lineNumber, startPosition, endPosition }) => (
            !locations.find(location => Math.abs(location.lineNumber - lineNumber) < 2
                                        && Math.abs(location.startPosition - startPosition) < 2
                                        && Math.abs(location.endPosition - endPosition < 2))
          ));
        }
        errors = instructorErrors.concat(errors);
      });

      badPatterns.forEach((exp) => {
        const instructorErrors = visit(parse(code)[0], parse(exp.pattern)[0], [], []);
        if (instructorErrors.length === 0) {
          errors.unshift({
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
          name: '', startPosition: err.location.start.column, endPosition: err.location.end.column, lineNumber: err.location.start.line, message: `Parser error: ${err}`,
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

      if (savedValue && savedValue.correspondent) {
        return {
          ...elem,
          value: `${savedValue.correspondent} ${second}`,
        };
      }

      if (firstWord.length === 0 || firstWord[0] === '$') {
        return {
          ...elem,
          value: `test ${second}`,
        };
      }
      return {
        ...elem,
        value: `${firstWord} ${second}`,
      };
    });
    const inputValue = code;
    testsToRun.forEach((elem, index) => fetch('/compile', {
      method: 'POST',
      body: JSON.stringify({ val: inputValue, v: elem.value }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(res => res.json()).then((result) => {
      if (result.isRuntimeError) {
        testsToRun[index].result = false;
        testsToRun[index].stderr = result.body;
      } else if (!result.isError) {
        testsToRun[index].result = result.body.includes(elem.match);
      } else {
        testsToRun[index].result = 'compiler error';
        testsToRun[index].stderr = result.body;
      }
      this.setState({ results: testsToRun });
    }));
  }

  renderErrors = () => {
    const formatDiagnostic = ({ lineNumber, startPosition, message }) => `${lineNumber}:${startPosition}: ${message}\n`;
    const { compilerErrors, isShowingErrors, displayedSolution } = this.state;

    if (compilerErrors !== undefined && compilerErrors.length !== 0) {
      return (
        <div>
          {isShowingErrors
            && (
              <div className="hint-solution">
                {compilerErrors.map(error => (
                  <div key={error.message} style={{ paddingBottom: '10px' }}>
                    <p className="error-display">{formatDiagnostic(error)}</p>
                    { error.solution && (
                      <div>
                        <Button className="solution-button" onClick={() => this.setState({ displayedSolution: error })}>See solution</Button>
                        {error.solution && displayedSolution == error && (
                          <div className="solution">
                            <span>Expected: </span>
                            <pre>{error.solution}</pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
                }
              </div>
            )
          }
        </div>
      );
    }
    return (
      isShowingErrors ? (
        <div>
          <p>No hints to show.</p>
        </div>
      ) : null
    );
  }

  renderTests = () => {
    const { results } = this.state;

    if (results.length === 0) {
      return <p>Write some code to execute tests.</p>;
    }

    return results.map((elem) => {
      let testIcon;
      if (elem.result === true) {
        testIcon = <Icon type="check" style={{ color: 'green' }} />;
      } else if (elem.result === false) {
        testIcon = <Icon type="close" style={{ color: 'red' }} />;
      } else {
        testIcon = (
          <span>
            <Icon type="warning" theme="filled" style={{ color: 'rgb(236, 205, 18)' }} />
            Compiler Error
          </span>
        );
      }
      return (
        <div key={elem.value} className="results">
          <pre>{elem.value}</pre>
          {elem.result !== '' && elem.value !== undefined && <span title={elem.stderr}>{testIcon}</span>}
        </div>
      );
    });
  }

  render() {
    const {
      problem,
      testValue,
      examples,
      debuggerComponent,
      compilerErrors,
      isShowingErrors,
    } = this.state;

    return (
      <div className="exercise">
        <NavBar> </NavBar>
        <div className="content">
          <Row className="top-row">
            <Col xs={24} className="text">
              <div>
                <h1 className="problem">{problem}</h1>
                <Divider />
              </div>
              <h3 className="examples-title">Examples</h3>
              <pre className="examples">{examples}</pre>
            </Col>
          </Row>
          <Row className="code-row">
            <Col xs={24} md={12}>
              <Editor
                onChange={this.onCodeChange}
                debounceTimeout={500}
                ref={(editor) => { this.editor = editor; }}
              />
            </Col>
            <Col xs={24} md={12}>
              <div style={{ height: 'calc(100% - 25px)' }}>
                <div style={{ display: 'flex', height: '28px' }}>
                  <Button
                    className="hints-button"
                    disabled={!compilerErrors || compilerErrors.length === 0}
                    onClick={() => this.setState({ isShowingErrors: !isShowingErrors })}
                  >
                    Show Hints
                  </Button>
                  <h3 className="code-review">Code review</h3>
                </div>
                <Divider />
                <div className="errors">
                  {this.renderErrors()}
                </div>
              </div>
            </Col>
          </Row>
          <Row className="test-row">
            <Col xs={24} md={12}>
              <h3 className="tests-title">Tests</h3>
              <Divider />
              <div className="tests">
                {this.renderTests()}
              </div>
            </Col>
            <Col xs={24} md={12}>
              <h3 className="tests-title">Debug</h3>
              <Divider />
              <div style={{ width: '100%', display: 'flex' }}>
                <Input type="text" id="name" className="test-area" placeholder="Function call..." value={testValue} onChange={this.handleValue} />
                <Button type="button" className="test-button" onClick={this.onDebug}> Debug </Button>
              </div>
              <div className="debugger">
                {debuggerComponent}
              </div>
            </Col>
          </Row>
          <div style={{ height: '20vh', width: '100%' }} />
        </div>
      </div>
    );
  }
}

export default Exercise;
