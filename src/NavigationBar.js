/* eslint-disable jsx-a11y/accessible-emoji */
/* eslint-disable react/jsx-wrap-multilines */
import React, { Component } from 'react';
import { Menu, Icon } from 'antd';
import { Link } from 'react-router-dom';
import './NavigationBar.css';

const { SubMenu } = Menu;

export default class NavBar extends Component {
  state = {
    current: 'mail',
  };

  handleClick = (e) => {
    // eslint-disable-next-line no-console
    console.log('click ', e);
    this.setState({
      current: e.key,
    });
  };

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
          <Menu.Item key="setting:1">
            <Link to="/exercise" />
            Problem 1
          </Menu.Item>
          <Menu.Item key="setting:2">
            <Link to="/exercise" />
            Problem 2
          </Menu.Item>
        </SubMenu>
      </Menu>
    );
  }
}
