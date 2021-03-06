/* eslint-disable jsx-a11y/accessible-emoji */
/* eslint-disable react/jsx-wrap-multilines */
import React, { Component } from 'react';
import { Menu, Icon } from 'antd';
import { Link } from 'react-router-dom';
import './NavigationBar.css';

const { SubMenu } = Menu;

const PROBLEMS = [
  'sum',
  'twoSame',
  'pos',
  'precedes',
  'rev',
];

export default class NavBar extends Component {
  state = {
    current: 'mail',
  };

  handleClick = (e) => {
    this.setState({
      current: e.key,
    });
  };

  renderProblemLinks = () => PROBLEMS.map((problemName, index) => (
    <Menu.Item key={`setting:${problemName}`}>
      <Link to={`/exercise/${problemName}`} />
      {`Problem ${index + 1}: ${problemName}`}
    </Menu.Item>
  ))

  render() {
    const { current } = this.state;
    return (
      <Menu onClick={this.handleClick} selectedKeys={[current]} mode="horizontal">
        <Menu.Item className="nav-title">
          HASKTUTOR
        </Menu.Item>
        <Menu.Item>
          <Link to="/" />
          ☰ LIST
        </Menu.Item>
        <SubMenu
          title={
            <span className="submenu-title-wrapper">
              <Icon type="setting" />
              List Problems
            </span>
          }
        >
          { this.renderProblemLinks() }
        </SubMenu>
      </Menu>
    );
  }
}
