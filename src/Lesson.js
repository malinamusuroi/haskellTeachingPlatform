/* eslint-disable react/no-unescaped-entities */
/* eslint-disable jsx-a11y/accessible-emoji */
import React, { Component } from 'react';
import './Lesson.css';
import { Row, Col } from 'antd';
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

  render() {
    const {
      data,
      testValue,
    } = this.state;
    return (
      <div>
        <NavBar> </NavBar>
        <div className="content">
          <h1 className="title">Lists </h1>
          <p>
            At the simplest level lists are put together using two types of building blocks:
             [] is used to build an expty list
             : is an infix operator which adds a new element to the front of the list.
            Therefore 1: 2: [] means [1,2]
          </p>
          <b style={{ fontSize: '20px' }}>How do we represent lists? </b>
          <p style={{ fontSize: '18px' }}>Pattern matching</p>
          A list is empty if we use [] and if it is not empty we represent it
          as x:xs for some x and xs
          <p> Let's take the same function and try to express it using pattern matching: </p>
          <Row>
            <Col xs={24} md={12} className="code-editor">
              <div className="code-example">
                sum :: [Int] -> Int
                <br />
                sum [] = 0
                <br />
                sum(x:xs)= x + sum xs
                <br />
              </div>
              <div>
                <textarea placeholder="Prelude >>" style={{ width: '100%', height: '90px', backgroundColor: 'rgb(232,232,232)' }} type="text" value={testValue} onChange={this.handleValue} />
                <button type="button" onClick={this.onSubmit}> See output</button>
                <div style={{ marginLeft: '10px' }}>
                  Result:
                  {data}
                </div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <b> How does it work?  </b>
              <br />
              sum [10, 20, 30]
              <br />
              -> 10 + sum [20, 30]
              <br />
              -> 10 + (20 + sum [30])
              <br />
              -> 10 + (20 + (30 + sum [])) -> 10 + (20 + (30 + 0))
              <br />
              -> 60
              <br />
              <HaskellJSProgram
                defaultValue="addOne 4"
              />
            </Col>
          </Row>
          <p>
            <strong> Here are some predefined functions over lists: </strong>
          </p>
          <div style={{ marginTop: '20px' }}>
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
          <div style={{ backgroundColor: '#FFFACD', marginTop: '7px' }}>
            Note ❗️ The index of the elements in the list starts from 0
          </div>
          <div style={{ marginTop: '20px' }}>
            <strong> (++) </strong>
            :: [a] --&gt; [a] --&gt; [a] ---- The binary operator ++ (pronounced “concatenate”
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
            :: Int --&gt; [a] --&gt; [a] ---- drop n xs returns the remainder of the list after
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
