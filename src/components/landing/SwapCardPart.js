import React, { useState } from "react";
import { useEthContext } from "../../context/EthereumContext";
import { travelABI, usdtABI, busdABI } from "../../contract/abi";
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
import { useWallet } from "use-wallet";
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

          console.log(travelABI, contract_address)
          const contract = new web3.eth.Contract(travelABI, contract_address);
          const value = web3.utils.toHex(web3.utils.toWei(cntBNB.toString(), "ether"))

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
      console.log('onBuy', error)
    }
  };

  const handleConnectWallet = async () => {
    await provider.request({ method: `eth_requestAccounts` });
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

  /** Custom Functions */
  const handleCoinbase = () => {
    wallet.connect("walletlink");
  };

  useEffect(() => {
    if (wallet.status === "connected") {
      setCurrentAcc(wallet.account);
    }
  }, [wallet.status]);

  useEffect(() => {
    console.log("accounts1", currentAcc);
  }, [currentAcc]);

  return (
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
        <BuyBtn
          onClick={() => {
            handleConnectWallet();
          }}
        >
          Connect Wallet
        </BuyBtn>
      )}
      <MainText>*IF YOU CLICK SWITCH, YOU AGREE TO THE TERMS OF USE</MainText>
      <button onClick={handleCoinbase}>CoinBase Connect</button>
    </SwapCardPartDiv>
  );
};

export default SwapCardPart;
