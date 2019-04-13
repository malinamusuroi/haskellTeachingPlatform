import React, { Component } from 'react';
import  './Lesson.css';
import { Switch, Route, Link, BrowserRouter as Router } from 'react-router-dom'


class Lesson extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      data: '',
      testValue: ''
    };

    this.handleValue = this.handleValue.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    
  }
  //sum :: [Int] -> Int  sum xs = if null xs then 0 else head xs + sum (tail xs)
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
      <div style={{paddingTop: '10px', marginLeft: '200px', marginRight: '200px', marginBottom: '100px'}}>
        <h1 className="title" >Lists </h1>
        <p>
           At the simplest level lists are put together using two types of building blocks:
            [] is used to build an expty list
            : is an infix operator which adds a new element to the front of the list. Therefore 1: 2: [] means [1,2]
        </p>
        <b style={{fontSize: '20px'}} >How do we represent lists? </b>
        <ol>
            <li style={{fontSize: '18px'}}> Using NULL, HEAD, TAILS   </li>
            <b> null </b> :: [a] -> Bool asks whether a list is empty <br />
            <b> head </b> :: [a] -> a returns the head of a given list <br />
            <b> tail </b> :: [a] -> [a] returns the tail of a given list <br />
              <p> Let's take the function sum and express it using the above format: </p>
          <div style={{display: 'flex'}}>
            <div style={{display: 'inline'}}>
              <div className="code-example"> 
              sum :: [Int] -> Int <br />
              sum xs <br />
                  = if null xs <br />
                  then 0  <br />
                  else head xs + sum (tail xs)
               </div>
              <div style={{marginLeft: '50px'}} > 
                <textarea placeholder="Prelude >>" style={{ width: '285px', height: '90px', backgroundColor: 'rgb(232,232,232)'}} type="text" value={this.state.testValue} onChange={this.handleValue} />
             <button style={{marginLeft: '10px', borderRadius: '4px', height: '25px', backgroundColor: 'white'}} onClick={this.onSubmit}> See output</button>
                <div style={{marginLeft: '10px'}}> Result: {this.state.data} </div>
              </div> 
              </div>
               <div style={{marginLeft: '30px'}}>
               <b> How does it work?  </b><br />
                sum [20, 30] <br />
              -> if null [20, 30] then 0 else head [20, 30] + sum (tail [20, 30]) <br />
              -> head [20, 30] + sum (tail [20, 30]) <br />
              -> 20 + sum [30] <br />
              -> 20 + if null [30] then 0 else head [30] + sum (tail [30]) <br />
              -> 20 + head [30] + sum (tail [30]) <br />
              -> 20 + 30 + if null [] then 0 else ... <br />
              -> 20 + 30 + 0 <br />
              -> 50 <br />
                 </div>
            </div>
            <div style={{marginTop: '60px'}}>
             <li style={{fontSize: '18px'}} >Pattern matching</li>
              A list is empty if we use [] and if it is not empty we represent it as x:xs for some x and xs
             <p> Let's take the same function and try to express it using pattern matching: </p>
             <div style={{display: 'flex'}}>
             <div className="code-example"> 
                  sum :: [Int] -> Int <br />
                  sum [] = 0 <br />
                  sum(x:xs)= x + sum xs <br />
              </div >
              <div style={{marginLeft: '40px'}}>
              <b> How does it work?  </b><br />
              sum [10, 20, 30] <br />
                 -> 10 + sum [20, 30] <br />
                 -> 10 + (20 + sum [30]) <br />
                 -> 10 + (20 + (30 + sum [])) -> 10 + (20 + (30 + 0)) <br />
                 -> 60 <br />
                 </div>
             </div>
             </div>
        </ol>
        <p> <b> Here are some predefined functions over lists: </b> </p>
        <div style={{marginTop: '20px'}}>
        <b> !! </b> :: [a] -> Int -> a ---- The !! operator (sometimes pronounced “at”) performs list indexing (the head is index 0): <br />
        <div style={{fontWeight: 'bold', width: '270px'}} > Example: Prelude >> [7, 9, 33] !! 1  <br />
                 >> 9 <br />
        </div>
        </div>
        <div style={{backgroundColor: '#FFFACD', marginTop: '7px'}} > Note ❗️ The index of the elements in the list starts from 0
        </div>
        <div style={{marginTop: '20px'}}>
        <b> (++) </b> :: [a] -> [a] -> [a] ---- The binary operator ++ (pronounced “concatenate”
or “append”) joins two lists of the same type to form a new list e.g. <br />  
       </div>
        <div style={{fontWeight: 'bold', width: '270px'}} > Example: Prelude >> [1, 2, 3] ++ [1, 5] <br />
                 >> [1, 2, 3, 1, 5] <br />
        </div>
        <div style={{marginTop: '20px'}}>
        <b> take </b> :: Int -> [a] -> [a] ---- take n xs returns the first n elements of xs <br />
        <div style={{fontWeight: 'bold', width: '270px'}} > Example: Prelude> take 4 "granted" <br />
                 >> "gran" <br />
        </div>
        </div>
        <div style={{marginTop: '20px'}}>
        <b> drop </b> :: Int -> [a] -> [a] ---- drop n xs returns the remainder of the list after the first n elements have been removed <br />
        <div style={{fontWeight: 'bold', width: '290px'}} > Example: Prelude >> drop 3 [1, 2, 3, 4, 5] <br />
                 >> [4, 5]  <br />
        </div>
        <Link to="/exercise" style={{display: 'block', textAlign: 'center'}}>Next</Link>
        </div>
     </div>
    )
  }
}

export default Lesson;
