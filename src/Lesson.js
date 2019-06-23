/* eslint-disable react/no-unescaped-entities */
/* eslint-disable jsx-a11y/accessible-emoji */
import React, { Component } from 'react';
import './Lesson.css';
import {
  Row, Col, Button, Divider, Icon,
} from 'antd';
import { parse } from './parser2';
import NavBar from './NavigationBar';

import HaskellJSProgram from './hsjs/ProgramComponent';

class Lesson extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      data: '',
      testValue: '',
    };
    this.updateFunctionList('sum :: [Int] -> Int\nsum [] = 0\nsum (x:xs) = x + sum xs');
  }

  handleValue = (input) => {
    this.setState({ testValue: input.target.value });
  }

  onSubmit = () => {
    const { value: inputValue, testValue: testInput } = this.state;
    fetch('/compile', {
      method: 'POST',
      body: JSON.stringify({ val: inputValue, v: testInput }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(res => res.json()).then(result => this.setState({ data: result.body }))
      .catch(error => console.log(error));
  }

  updateFunctionList = (code) => {
    const newFunctions = parse(code);
    newFunctions.forEach((func) => {
      if ([':', '+', '-'].indexOf(func.name) < 0) {
        window.functions[func.name] = func;
      }
    });
  }


  render() {
    const {
      data,
      testValue,
    } = this.state;
    return (
      <div>
        <NavBar> </NavBar>
        <div className="content">
          <h1 className="title">Getting Started with Lists </h1>
          <Divider />
          <div style={{ marginBottom: '2em', marginTop: '1em' }}>
           Lists are can be represented using two types of building blocks:
            <ul style={{ margin: 0 }}>
              <li> [] is used to build an empty list </li>
              <li> : is an infix operator which adds a new element to the front of the list. </li>
              <br />
            </ul>
            Therefore (1 : 2 : []) means [1,2].
            <br />
          </div>
          <strong style={{ fontSize: '18px', marginTop: '3em' }}>Pattern matching</strong>
          <div>
          A list is empty if we use [] and if it is not empty we represent it
          as (x:xs) for some element x and the list xs
          </div>
          <p> Let's write the sum function that calculates the sum of elemnts of a list:</p>
          <Row>
            <Col xs={24} md={12} className="code-editor">
              <div id="code" className="code-example">
                sum :: [Int] -> Int
                <br />
                sum [] = 0
                <br />
                sum (x:xs)= x + sum xs
                <br />
              </div>
              <div>
                <textarea placeholder="Enter a call to sum, such as sum [1,2,3]..." className="prelude-area" type="text" value={testValue} onChange={this.handleValue} />
                <Button type="button" onClick={this.onSubmit}> Execute </Button>
                <div style={{ marginLeft: '10px', float: 'right' }}>
                  { data && (
                  <span>
                    <span>Result: </span>
                      {data}
                  </span>
                  )}
                </div>
              </div>
            </Col>
            <Col xs={24} md={12} style={{ paddingTop: '2em' }}>
              <b style={{ marginBottom: '0.1em', fontSize: '1.3em', marginTop: '1.7em' }}> See visual representation </b>
              <Divider />
              <div style={{ paddingTop: '0.1em' }}>
                <HaskellJSProgram
                  defaultValue="sum [10, 20, 30]"
                />
              </div>
            </Col>
          </Row>
          <div style={{ margin: '20px 0' }}>
            <p>
              <strong> Here are some predefined functions over lists: </strong>
            </p>
            <strong> !! </strong>
            :: [a] -&gt; Int -&gt; a ---- The !! operator (sometimes pronounced “at”)
            performs list indexing (the head is index 0):
            <br />
            <div style={{ fontWeight: 'bold', width: '270px' }}>
              Example: Prelude &gt;&gt; [7, 9, 33] !! 1
              <br />
              &gt;&gt; 9
              <br />
            </div>
          </div>
          <strong>
            <Icon type="warning" style={{ color: 'black' }} />
               Note
          </strong>
            : The indices of Haskell lists start at 0, not 1.
          <div style={{ marginTop: '20px' }}>
            <strong> (++) </strong>
            :: [a] -&gt; [a] -&gt; [a] ---- The binary operator ++ (pronounced “concatenate”
            or “append”) joins two lists of the same type to form a new list e.g.
            <br />
          </div>
          <div style={{ fontWeight: 'bold', width: '270px' }}>
            Example: Prelude &gt;&gt; [1, 2, 3] ++ [1, 5]
            <br />
            &gt;&gt; [1, 2, 3, 1, 5]
            <br />
          </div>
          <div style={{ marginTop: '20px' }}>
            <strong> take </strong>
            :: Int -&gt; [a] -&gt; [a] ---- take n xs returns the first n elements of xs
            <br />
            <div style={{ fontWeight: 'bold', width: '270px' }}>
              Example: Prelude &gt;&gt; take 4 'granted'
              <br />
              &gt;&gt; "gran"
              <br />
            </div>
          </div>
          <div style={{ marginTop: '20px' }}>
            <strong> drop </strong>
            :: Int -&gt; [a] -&gt; [a] ---- drop n xs returns the remainder of the list after
            the first n elements have been removed
            <br />
            <div style={{ fontWeight: 'bold', width: '290px' }}>
              Example: Prelude &gt;&gt; drop 3 [1, 2, 3, 4, 5]
              <br />
              &gt;&gt; [4, 5]
              <br />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Lesson;
