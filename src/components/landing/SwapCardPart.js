import React, { useState } from "react";
import { useEthContext } from "../../context/EthereumContext";
import { travelABI, usdtABI, busdABI } from "../../contract/abi";
import styled, { css } from "styled-components";
import coinbaseIcon from "../../assets/coinbase.png";
import {
  contract_address,
  usdt_address,
  busd_address,
} from "../../contract/address";

import InputField from "../../components/custom/InputField";
import CryptoSelect from "../../components/custom/CryptoSelect";
import $ from "jquery";

import {
  BuyBtn,
  FormGroup,
  SwapCardPartDiv,
  CardTitle,
  MainText,
} from "./StyledLanding";

import { toast } from "react-toastify";
// import { useWallet } from "use-wallet";
import { useWallet } from "@binance-chain/bsc-use-wallet";
import { useEffect } from "react";
import * as Web3 from "web3";

const SwapCardPart = () => {
  const [cntBNB, setCntBNB] = useState(0);
  const [travelBNB, setTravlBNB] = useState(0);
  const [crypto, setCrypto] = useState("bnb");
  const wallet = useWallet();

  const { currentAcc, provider, setCurrentAcc } = useEthContext();
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
        const web3 = new Web3(window.ethereum);
        if (crypto === "bnb") {
          console.log(travelABI, contract_address);
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
      const web3 = new Web3(window.ethereum);
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
    console.log("wallet.account", wallet.status);
    if (wallet.status === "connected") {
      setCurrentAcc(wallet.account);
    }
  }, [wallet.status]);
  // $("#myModal").modal({ backdrop: "static", keyboard: false });
  return (
    <>
      <div
        className="modal fade"
        id="exampleModal"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
        data-backdrop="static"
        data-keyboard="false"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Connect to a wallet
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <Block>
                <Button onClick={() => wallet.connect()}>
                  Metamask Connect
                </Button>
                <svg
                  viewBox="0 0 96 96"
                  width="32px"
                  color="text"
                  xmlns="http://www.w3.org/2000/svg"
                  className="sc-bdnxRM IFgii"
                >
                  <circle cx="48" cy="48" r="48" fill="white"></circle>
                  <path
                    d="M77.7602 16.9155L51.9419 36.0497L56.7382 24.7733L77.7602 16.9155Z"
                    fill="#E17726"
                  ></path>
                  <path
                    d="M18.2656 16.9155L43.8288 36.2283L39.2622 24.7733L18.2656 16.9155Z"
                    fill="#E27625"
                  ></path>
                  <path
                    d="M68.4736 61.2808L61.6108 71.7918L76.3059 75.8482L80.4899 61.5104L68.4736 61.2808Z"
                    fill="#E27625"
                  ></path>
                  <path
                    d="M15.5356 61.5104L19.6941 75.8482L34.3892 71.7918L27.5519 61.2808L15.5356 61.5104Z"
                    fill="#E27625"
                  ></path>
                  <path
                    d="M33.5984 43.5251L29.491 49.699L44.0584 50.3624L43.5482 34.6724L33.5984 43.5251Z"
                    fill="#E27625"
                  ></path>
                  <path
                    d="M62.4274 43.525L52.2991 34.4937L51.9419 50.3622L66.5094 49.6989L62.4274 43.525Z"
                    fill="#E27625"
                  ></path>
                  <path
                    d="M34.3892 71.7922L43.1654 67.5316L35.6137 61.6128L34.3892 71.7922Z"
                    fill="#E27625"
                  ></path>
                  <path
                    d="M52.8345 67.5316L61.6107 71.7922L60.3861 61.6128L52.8345 67.5316Z"
                    fill="#E27625"
                  ></path>
                  <path
                    d="M61.6107 71.7923L52.8345 67.5317L53.5233 73.2465L53.4468 75.6446L61.6107 71.7923Z"
                    fill="#D5BFB2"
                  ></path>
                  <path
                    d="M34.3892 71.7923L42.5531 75.6446L42.502 73.2465L43.1654 67.5317L34.3892 71.7923Z"
                    fill="#D5BFB2"
                  ></path>
                  <path
                    d="M42.7062 57.8369L35.4097 55.6939L40.5631 53.3213L42.7062 57.8369Z"
                    fill="#233447"
                  ></path>
                  <path
                    d="M53.2937 57.8369L55.4367 53.3213L60.6412 55.6939L53.2937 57.8369Z"
                    fill="#233447"
                  ></path>
                  <path
                    d="M34.3893 71.7918L35.6649 61.2808L27.552 61.5104L34.3893 71.7918Z"
                    fill="#CC6228"
                  ></path>
                  <path
                    d="M60.3352 61.2808L61.6108 71.7918L68.4736 61.5104L60.3352 61.2808Z"
                    fill="#CC6228"
                  ></path>
                  <path
                    d="M66.5094 49.6987L51.9419 50.362L53.294 57.8371L55.4371 53.3215L60.6416 55.6941L66.5094 49.6987Z"
                    fill="#CC6228"
                  ></path>
                  <path
                    d="M35.4098 55.6941L40.5633 53.3215L42.7063 57.8371L44.0584 50.362L29.491 49.6987L35.4098 55.6941Z"
                    fill="#CC6228"
                  ></path>
                  <path
                    d="M29.491 49.6987L35.6139 61.6129L35.4098 55.6941L29.491 49.6987Z"
                    fill="#E27525"
                  ></path>
                  <path
                    d="M60.6414 55.6941L60.3862 61.6129L66.5092 49.6987L60.6414 55.6941Z"
                    fill="#E27525"
                  ></path>
                  <path
                    d="M44.0584 50.3618L42.7063 57.8369L44.4156 66.6641L44.7728 55.0305L44.0584 50.3618Z"
                    fill="#E27525"
                  ></path>
                  <path
                    d="M51.9415 50.3618L51.2527 55.005L51.5843 66.6641L53.2937 57.8369L51.9415 50.3618Z"
                    fill="#E27525"
                  ></path>
                  <path
                    d="M53.2938 57.8374L51.5845 66.6646L52.8346 67.532L60.3862 61.6132L60.6413 55.6943L53.2938 57.8374Z"
                    fill="#F5841F"
                  ></path>
                  <path
                    d="M35.4097 55.6943L35.6138 61.6132L43.1654 67.532L44.4155 66.6646L42.7062 57.8374L35.4097 55.6943Z"
                    fill="#F5841F"
                  ></path>
                  <path
                    d="M53.4468 75.6443L53.5233 73.2462L52.8855 72.6849H43.1143L42.502 73.2462L42.5531 75.6443L34.3892 71.792L37.2465 74.1391L43.0378 78.1445H52.962L58.7533 74.1391L61.6107 71.792L53.4468 75.6443Z"
                    fill="#C0AC9D"
                  ></path>
                  <path
                    d="M52.8346 67.5315L51.5845 66.6641H44.4156L43.1655 67.5315L42.5022 73.2462L43.1145 72.6849H52.8857L53.5235 73.2462L52.8346 67.5315Z"
                    fill="#161616"
                  ></path>
                  <path
                    d="M78.8314 37.2998L80.9999 26.7377L77.7599 16.9155L52.8345 35.4119L62.4271 43.5247L75.9485 47.4791L78.9335 43.984L77.6323 43.04L79.7243 41.1521L78.1426 39.902L80.2091 38.3458L78.8314 37.2998Z"
                    fill="#763E1A"
                  ></path>
                  <path
                    d="M15 26.7377L17.194 37.2998L15.7909 38.3458L17.8574 39.902L16.2756 41.1521L18.3676 43.04L17.0665 43.984L20.0514 47.4791L33.5984 43.5247L43.1655 35.4119L18.2656 16.9155L15 26.7377Z"
                    fill="#763E1A"
                  ></path>
                  <path
                    d="M75.9487 47.4793L62.4272 43.5249L66.5092 49.6989L60.3862 61.613L68.4736 61.511H80.4898L75.9487 47.4793Z"
                    fill="#F5841F"
                  ></path>
                  <path
                    d="M33.5983 43.5249L20.0513 47.4793L15.5356 61.511H27.5519L35.6137 61.613L29.4908 49.6989L33.5983 43.5249Z"
                    fill="#F5841F"
                  ></path>
                  <path
                    d="M51.9415 50.3617L52.8344 35.4115L56.7378 24.7729H39.262L43.1653 35.4115L44.0583 50.3617L44.3899 55.0559L44.4154 66.664H51.5843L51.6099 55.0559L51.9415 50.3617Z"
                    fill="#F5841F"
                  ></path>
                </svg>
              </Block>
              <Block>
                <Button onClick={() => wallet.connect("walletlink")}>
                  CoinBase Connect
                </Button>
                <img
                  src={coinbaseIcon}
                  style={{ width: 35, height: 35, marginLeft: -2 }}
                ></img>
              </Block>
              <Block>
                <Button onClick={() => wallet.connect("bsc")}>
                  Binance Connect
                </Button>
                <svg
                  viewBox="0 0 32 32"
                  width="32px"
                  color="text"
                  xmlns="http://www.w3.org/2000/svg"
                  className="sc-bdnxRM IFgii"
                >
                  <path
                    d="M24 0H8C3.58172 0 0 3.58172 0 8V24C0 28.4183 3.58172 32 8 32H24C28.4183 32 32 28.4183 32 24V8C32 3.58172 28.4183 0 24 0Z"
                    fill="#1E2026"
                  ></path>
                  <path
                    d="M16.2857 4L9.97035 7.6761L12.2922 9.03415L16.2857 6.7161L20.2792 9.03415L22.6011 7.6761L16.2857 4Z"
                    fill="#F0B90B"
                  ></path>
                  <path
                    d="M20.2792 10.9541L22.6011 12.3122V15.0283L18.6075 17.3463V21.9824L16.2857 23.3405L13.9639 21.9824V17.3463L9.97035 15.0283V12.3122L12.2922 10.9541L16.2857 13.2722L20.2792 10.9541Z"
                    fill="#F0B90B"
                  ></path>
                  <path
                    d="M22.6011 16.9483V19.6644L20.2792 21.0224V18.3063L22.6011 16.9483Z"
                    fill="#F0B90B"
                  ></path>
                  <path
                    d="M20.2561 22.9424L24.2496 20.6244V15.9883L26.5714 14.6302V21.9824L20.2561 25.6585V22.9424Z"
                    fill="#F0B90B"
                  ></path>
                  <path
                    d="M24.2496 11.3522L21.9278 9.99414L24.2496 8.63609L26.5714 9.99414V12.7102L24.2496 14.0683V11.3522Z"
                    fill="#F0B90B"
                  ></path>
                  <path
                    d="M13.9639 26.642V23.9259L16.2857 25.2839L18.6075 23.9259V26.642L16.2857 28L13.9639 26.642Z"
                    fill="#F0B90B"
                  ></path>
                  <path
                    d="M12.2922 21.0224L9.97035 19.6644V16.9483L12.2922 18.3063V21.0224Z"
                    fill="#F0B90B"
                  ></path>
                  <path
                    d="M16.2857 11.3522L13.9639 9.99414L16.2857 8.63609L18.6075 9.99414L16.2857 11.3522Z"
                    fill="#F0B90B"
                  ></path>
                  <path
                    d="M10.6437 9.99414L8.32183 11.3522V14.0683L6 12.7102V9.99414L8.32183 8.63609L10.6437 9.99414Z"
                    fill="#F0B90B"
                  ></path>
                  <path
                    d="M6 14.6302L8.32183 15.9883V20.6244L12.3154 22.9424V25.6585L6 21.9824V14.6302Z"
                    fill="#F0B90B"
                  ></path>
                </svg>
              </Block>
              <Block>
                <Button onClick={() => wallet.connect("walletconnect")}>
                  Walletconnect Connect
                </Button>
                <svg
                  viewBox="0 0 96 96"
                  width="32px"
                  color="text"
                  xmlns="http://www.w3.org/2000/svg"
                  className="sc-bdnxRM IFgii"
                >
                  <path
                    d="M96 48C96 21.4903 74.5097 0 48 0C21.4903 0 0 21.4903 0 48C0 74.5097 21.4903 96 48 96C74.5097 96 96 74.5097 96 48Z"
                    fill="#3389FB"
                  ></path>
                  <path
                    d="M29.6927 35.4245C39.8036 25.5252 56.1965 25.5252 66.3074 35.4245L67.5242 36.6159C68.0298 37.1109 68.0298 37.9134 67.5242 38.4084L63.3616 42.4839C63.1088 42.7314 62.699 42.7314 62.4462 42.4839L60.7717 40.8444C53.7181 33.9384 42.282 33.9384 35.2284 40.8444L33.4351 42.6002C33.1823 42.8477 32.7725 42.8477 32.5197 42.6002L28.3571 38.5247C27.8515 38.0297 27.8515 37.2272 28.3571 36.7322L29.6927 35.4245ZM74.9161 43.8532L78.6208 47.4805C79.1264 47.9755 79.1264 48.778 78.6208 49.2729L61.9159 65.6288C61.4103 66.1237 60.5907 66.1237 60.0851 65.6288C60.0851 65.6288 60.0851 65.6288 60.0851 65.6288L48.229 54.0206C48.1026 53.8968 47.8977 53.8968 47.7713 54.0206C47.7713 54.0206 47.7713 54.0206 47.7713 54.0206L35.9153 65.6288C35.4098 66.1237 34.5902 66.1237 34.0846 65.6288C34.0846 65.6288 34.0846 65.6288 34.0846 65.6288L17.3792 49.2727C16.8736 48.7778 16.8736 47.9753 17.3792 47.4803L21.0839 43.853C21.5895 43.3581 22.4091 43.3581 22.9146 43.853L34.771 55.4614C34.8974 55.5851 35.1023 55.5851 35.2287 55.4614C35.2287 55.4614 35.2287 55.4614 35.2287 55.4614L47.0844 43.853C47.59 43.358 48.4096 43.358 48.9152 43.853C48.9152 43.853 48.9152 43.853 48.9152 43.853L60.7715 55.4614C60.8979 55.5851 61.1028 55.5851 61.2292 55.4614L73.0854 43.8532C73.5909 43.3583 74.4105 43.3583 74.9161 43.8532Z"
                    fill="white"
                  ></path>
                </svg>
              </Block>
            </div>
          </div>
        </div>
      </div>
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
          // <BuyBtn
          //   data-bs-toggle="modal"
          //   href="#exampleModalToggle"
          //   role="button"
          //   onClick={() => wallet.connect("injected")}
          // >
          //   Connect Wallet
          // </BuyBtn>
          <button
            type="button"
            className="btn btn-primary w-100"
            data-bs-toggle="modal"
            data-bs-target="#exampleModal"
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
