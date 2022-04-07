import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import styled from "styled-components";
// @import wallet connection
import Web3 from "web3";
import { EthereumContext } from "./context/EthereumContext";
import LandingPage from "../src/views/LandingPage";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
const App = () => {
  const [provider, setProvider] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [currentAcc, setCurrentAcc] = useState("");
  useEffect(() => {
    if (window.ethereum) {
      handleEthereum();
    } else {
      window.addEventListener("ethereum#initialized", handleEthereum, {
        once: true,
      });
      setTimeout(handleEthereum, 3000);
    }
  }, []);

  useEffect(() => {
    const setCurrentlyConnectedAccount = async () => {
      let accounts = await web3.eth.getAccounts();
      if (accounts && accounts.length > 0) {
        setCurrentAcc(accounts[0]);
      }
    };
    if (web3) {
      setCurrentlyConnectedAccount();
    }
  }, [web3]);

  const handleEthereum = () => {
    const { ethereum } = window;

    if (ethereum && ethereum.isMetaMask) {
      setProvider(ethereum);
      ethereum.on("accountsChanged", (accs) => {
        setAccounts(accs);
        setCurrentAcc(accs[0]);
      });

      setWeb3(new Web3(ethereum));
    } else {
      toast("Please install Metamask");
    }
  };

  return (
    <EthereumContext.Provider
      value={{
        provider,
        accounts,
        web3,
        currentAcc,
      }}
    >
      <Router>
        <MainContainer>
          <Route exact path="/" component={LandingPage} />
        </MainContainer>
      </Router>
      <ToastContainer />
    </EthereumContext.Provider>
  );
};

export default App;

export const MainContainer = styled.div``;
