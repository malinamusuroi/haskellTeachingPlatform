import React, { Component } from 'react';
import  './Lesson.css';

class Lesson extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    
  }
  
  
  render() {
    return (
      <div>
        <h1 className="title" >Lists</h1>
        <p>
          At the simplest level lists are put together using two types of building blocks:
            [] is used to build an expty list
            : is an infix operator which adds a new element to the front of the list. Therefore 1: 2: [] means [1,2]
        </p>
        <b style={{fontSize: '20px'}} >How do we represent lists?</b>
        <ol>
            <li style={{fontSize: '18px'}}>Using NILL, HEAD, TAILS</li>
            <b> nill </b> :: [a] -> Bool asks whether a list is empty <br />
            <b> head </b> :: [a] -> a returns the head of a given list <br />
            <b> tail </b> :: [a] -> [a] returns the tail of a given list <br />
              <p> Let's take the function sum and express it using the above format: </p>
              <div className="code-example"> 
              sum :: [Int] -> Int <br />
              sum xs <br />
                  = if null xs <br />
                  then 0  <br />
                  else head xs + sum (tail xs)</div>
            <div style={{marginTop: '60px'}}>
             <li style={{fontSize: '18px'}} >Pattern matching</li>
             A list is empty if we use [] and if it is not empty we represent it as x:xs for some x and xs
             <p> Let's take the same function and try to express it using pattern matching: </p>
             <div className="code-example"> 
                  sum :: [Int] -> Int <br />
                  sum [] = 0 <br />
                  sum(x:xs)= x + sum xs <br />
              </div>
              </div>
        </ol>
     </div>
    )
  }
}

export default Lesson;
