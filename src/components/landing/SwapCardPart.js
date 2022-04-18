import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { useEthContext } from "../../context/EthereumContext";
import { travelABI, usdtABI, busdABI } from "../../contract/abi";
import styled from "styled-components";
import coinbaseIcon from "../../assets/coinbase.png";
import metamaskIcon from "../../assets/matamask.png";
import walletconnectIcon from "../../assets/walletconnect.png";
import coin98Icon from "../../assets/coin98.png";
import FortmaticIcon from "../../assets/fortmatic.png";
import MathwalletIcon from "../../assets/mathwallet.png";

import binanceIcon from "../../assets/binance.png";
import {
  contract_address,
  usdt_address,
  busd_address,
} from "../../contract/address";

import InputField from "../../components/custom/InputField";
import CryptoSelect from "../../components/custom/CryptoSelect";

import {
  BuyBtn,
  FormGroup,
  SwapCardPartDiv,
  CardTitle,
  MainText,
} from "./StyledLanding";

import { toast } from "react-toastify";
import { useWallet } from "@binance-chain/bsc-use-wallet";
import { useEffect } from "react";
import * as Web3 from "web3";

const SwapCardPart = () => {
  const [cntBNB, setCntBNB] = useState(0);
  const [travelBNB, setTravlBNB] = useState(0);
  const [crypto, setCrypto] = useState("bnb");
  const [modalShow, setModalShow] = useState(false);
  const wallet = useWallet();

  const { currentAcc, provider, setCurrentAcc } = useEthContext();

  const MyVerticallyCenteredModal = (props) => {
    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Connect to a wallet
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Block>
            <Button
              onClick={() => {
                setModalShow(false);
                wallet.connect();
              }}
            >
              Metamask Connect
            </Button>
            <img src={metamaskIcon} style={{ width: 35, height: 35 }}></img>
          </Block>

          <Block>
            <Button
              onClick={() => {
                setModalShow(false);
                wallet.connect("bsc");
              }}
            >
              Binance Connect
            </Button>
            <img src={binanceIcon} style={{ width: 35, height: 35 }}></img>
          </Block>
          <Block>
            <Button
              onClick={() => {
                setModalShow(false);
                wallet.connect("walletconnect");
              }}
            >
              Walletconnect Connect
            </Button>
            <img
              src={walletconnectIcon}
              style={{ width: 35, height: 35 }}
            ></img>
          </Block>

          <Block>
            <Button
              onClick={() => {
                setModalShow(false);
                wallet.connect("walletlink");
              }}
            >
              Coinbase Connect
            </Button>
            <img src={coinbaseIcon} style={{ width: 35, height: 35 }}></img>
          </Block>

          <Block>
            <Button
              onClick={() => {
                setModalShow(false);
                wallet.connect("fortmatic");
              }}
            >
              Fortmatic Connect
            </Button>
            <img src={FortmaticIcon} style={{ width: 35, height: 35 }}></img>
          </Block>

          <Block>
            <Button
              onClick={() => {
                setModalShow(false);
                wallet.connect();
              }}
            >
              Coin98Wallet Connect
            </Button>
            <img src={coin98Icon} style={{ width: 35, height: 35 }}></img>
          </Block>

          <Block>
            <Button
              onClick={() => {
                setModalShow(false);
                wallet.connect();
              }}
            >
              MathWallet Connect
            </Button>
            <img src={MathwalletIcon} style={{ width: 35, height: 35 }}></img>
          </Block>
        </Modal.Body>
      </Modal>
    );
  };

  const handleChange = (e) => {
    if (e.target.value >= 0 && !isNaN(cntBNB)) {
      if (e.target.name === "from") {
        if (crypto === "bnb") {
          setCntBNB(e.target.value);
          setTravlBNB(e.target.value * 7692);
        } else {
          setCntBNB(e.target.value);
          setTravlBNB(((e.target.value * 0.08).toFixed(2) * 100) / 100);
        }
      } else if (e.target.name === "to") {
        setTravlBNB(e.target.value);
        setCntBNB(((e.target.value * 0.00013).toFixed(5) * 100000) / 100000);
      }
    } else {
      setCntBNB(0);
      setTravlBNB(0);
    }
  };

  const onBuy = async () => {
    try {
      if (cntBNB <= 0 || isNaN(cntBNB)) {
        toast("Please check BNB Balance!");
      } else {
        const web3 = new Web3(wallet.ethereum);
        if (crypto === "bnb") {
          console.log(travelABI, currentAcc);
          const contract = new web3.eth.Contract(travelABI, contract_address);
          const value = web3.utils.toHex(
            web3.utils.toWei(cntBNB.toString(), "ether")
          );

          await contract.methods
            .buyTokens()
            .send({
              from: currentAcc,
              value,
            })
            .on("receipt", function (receipt) {
              setCntBNB(0);
              setTravlBNB(0);
              toast("Success!");
            })
            .on("error", function (error) {
              toast(error);
            });
        } else if (crypto === "usdt") {
          const usdtContract = new web3.eth.Contract(usdtABI, usdt_address);
          await usdtContract.methods
            .approve(contract_address, cntBNB)
            .send({
              from: currentAcc,
            })
            .on("receipt", function (receipt) {
              console.log("success");
            })
            .on("error", function (error) {
              toast(error);
            });
        } else if (crypto === "busd") {
          const busdContract = new web3.eth.Contract(busdABI, busd_address);
          await busdContract.methods
            .approve(contract_address, cntBNB)
            .send({
              from: currentAcc,
            })
            .on("receipt", function (receipt) {
              console.log("success");
            })
            .on("error", function (error) {
              toast(error);
            });
        }
      }
    } catch (error) {
      console.log("onBuy", error);
    }
  };

  const onMaxBalance = async () => {
    if (Web3) {
      // const web3 = new Web3(window.ethereum);
      const provider = new Web3.providers.HttpProvider(
        "https://data-seed-prebsc-1-s1.binance.org:8545/"
      );

      const web3 = new Web3(provider);

      const accountBalance = await web3.eth.getBalance(currentAcc);
      if (accountBalance > 0) {
        if (crypto === "bnb") {
          const gasPrice = await web3.eth.getGasPrice();
          const contract = new web3.eth.Contract(travelABI, contract_address);
          const resGasMethod = await contract.methods
            .buyTokens()
            .estimateGas({ from: currentAcc, value: accountBalance });
          const maxBalance =
            accountBalance - resGasMethod * gasPrice * 2 - gasPrice * 30000;

          setCntBNB(maxBalance / 10 ** 18);
          setTravlBNB((maxBalance / 10 ** 18) * 7692);
        } else if (crypto === "usdt") {
          const contract = new web3.eth.Contract(usdtABI, usdt_address);

          await contract.methods
            .balanceOf(currentAcc)
            .call()
            .then((res) => {
              setCntBNB(Number(res / 10 ** 18));
              setTravlBNB(
                ((Number(res / 10 ** 18) * 0.08).toFixed(2) * 100) / 100
              );
            })
            .catch((err) => {
              toast.error(err, { theme: "dark" });
            });
        } else if (crypto === "busd") {
          const contract = new web3.eth.Contract(usdtABI, usdt_address);

          await contract.methods
            .balanceOf(currentAcc)
            .call()
            .then((res) => {
              setCntBNB(Number(res / 10 ** 18));
              setTravlBNB(
                ((Number(res / 10 ** 18) * 0.08).toFixed(2) * 100) / 100
              );
            })
            .catch((err) => {
              toast.error(err, { theme: "dark" });
            });
        }
      } else {
        setCntBNB(0);
        setTravlBNB(0);
      }
    } else {
      await provider.request({ method: `eth_requestAccounts` });
    }
  };
  const onCryptoChange = (data) => {
    setCrypto(data);
    setCntBNB(0);
    setTravlBNB(0);
  };

  useEffect(() => {
    console.log("wallet.status", wallet.status);
    if (wallet.status === "connected") {
      setCurrentAcc(wallet.account);
    }
  }, [wallet.status]);
  return (
    <>
      <MyVerticallyCenteredModal
        show={modalShow}
        onHide={() => setModalShow(false)}
      />
      <SwapCardPartDiv>
        <CardTitle>BUY NOX</CardTitle>
        <FormGroup>
          <CryptoSelect
            value={cntBNB.toString()}
            onChange={onCryptoChange}
            onCryptoChange={handleChange}
            onMaxBalance={onMaxBalance}
            crypto={crypto}
            name="from"
            label="From"
            btn="BNB"
            placeholder="From"
          />

          <InputField
            value={travelBNB.toString()}
            onChange={handleChange}
            label="To"
            name="to"
            btn="NITROX"
            placeholder="Enter token balance."
          />
        </FormGroup>
        {currentAcc && currentAcc ? (
          <BuyBtn
            onClick={() => {
              onBuy();
            }}
          >
            BUY NITROX
          </BuyBtn>
        ) : (
          <button
            type="button"
            className="btn btn-primary w-100"
            onClick={() => setModalShow(true)}
          >
            Wallet connect
          </button>
        )}
        <MainText>*IF YOU CLICK SWITCH, YOU AGREE TO THE TERMS OF USE</MainText>
      </SwapCardPartDiv>
    </>
  );
};
const Button = styled.div`
  /* Adapt the colors based on primary prop */
  color: ${(props) => (props.primary ? "white" : "##0000003b")};
  background-color: transparent;
  width: 80%;

  margin-block: 10px;
  font-size: 1em;
  padding: 0.25em 1em;
  border: none;
  color: white;
`;

const Block = styled.button`
  /* Adapt the colors based on primary prop */
  width: 100%;
  height: 60px;
  align-items: center;
  font-size: 1em;
  display: flex;
  background: black;
  border: 2px solid #00000045;
  border-radius: 10px;
  margin-block: 10px;
`;

export default SwapCardPart;
