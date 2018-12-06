import React, { Component } from 'react';
import PropTypes from "prop-types";
import { createGlobalStyle } from "styled-components";
import reset from "styled-reset";
import axios from "axios";
import typography from "../../typography";
import { MASTER_NODE, SELF_NODE, SELF_P2P_NODE } from "../../constants";
import AppPresenter from "./AppPresenter";

const baseStyles = () => createGlobalStyle`
    ${reset};
    ${typography}
    h1,h2,h3,h4{
     margin-bottom:0!important;
   }
`;


class AppContainer extends Component {
  state = {
    isLoading: true,
    isMining: false,
    toAddress: "",
    amount: 0
  };
  static propTypes = {
    sharedPort: PropTypes.number.isRequired
  };
  componentDidMount = () => {
    const { sharedPort } = this.props;
    this._registerOnMaster(sharedPort);
    this._getAddress(sharedPort);
    this._getBalance(sharedPort);
    setInterval(() => this._getBalance(sharedPort), 1000);
  };
  render() {
    console.log("?");
    baseStyles();
    return (
      <AppPresenter
        {...this.state}
        mineBlock={this._mineBlock}
        handleInput={this._handleInput}
        handleSubmit={this._handleSubmit}
      />
    );
  }
  _registerOnMaster = async port => {
    const requst = await axios.post(`${MASTER_NODE}/peers`, {
      peer: SELF_P2P_NODE(port)
    });
  };
  _getAddress = async port => {
    const requst = await axios.get(`${SELF_NODE(port)}/me/address`);
    this.setState({
      address: requst.data,
      isLoading: false
    });
  };
  _getBalance = async port => {
    const requst = await axios.get(`${SELF_NODE(port)}/me/balance`);
    const { balance } = requst.data;
    this.setState({
      balance
    });
  };
  _mineBlock = async () => {
    const { sharedPort } = this.props;
    this.setState({
      isMining: true
    });
    const requst = await axios.post(`${SELF_NODE(sharedPort)}/blocks`);
    this.setState({
      isMining: false
    });
  };
  _handleInput = e => {
    const { target: { name, value }} = e;
    this.setState({
      [name]: value
    });
  };
  _handleSubmit = async e => {
    e.preventDefault();
    const { sharedPort } = this.props;
    const { amount, toAddress } = this.state;
    const requst = await axios.post(`${SELF_NODE(sharedPort)}/transitions`, {
      amount: Number(amount),
      address: toAddress
    });
    this.setState({
      amount: "",
      toAddress: ""
    });
  };
}

export default AppContainer;