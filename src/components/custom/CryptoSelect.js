import React, { useState } from "react";
import Icon from "react-crypto-icons";
import { MaxBtn, MaxBtnView } from "../landing/StyledLanding";
import {
  Input,
  InputDiv,
  InputFieldDiv,
  CryptoView,
  CryptoLabelView,
  CryptoSelectView,
  CryptoSelectLabelView,
} from "./StyledInput";

const CryptoSelect = ({
  value,
  placeholder,
  onCryptoChange,
  onChange,
  name,
  crypto,
  onMaxBalance,
}) => {
  const [visible, setVisible] = useState(false);
  const data = [
    {
      name: "bnb",
      label: "BNB",
    },
    {
      name: "usdt",
      label: "USDT",
    },
    {
      name: "busd",
      label: "BUSD",
    },
  ];
  return (
    <InputFieldDiv>
      <InputDiv>
        <Input
          type="number"
          value={value}
          placeholder={placeholder}
          onChange={onCryptoChange}
          name={name}
          min="0"
        />
      </InputDiv>
      <MaxBtnView>
        <MaxBtn disabled onClick={onMaxBalance}>
          Max
        </MaxBtn>
      </MaxBtnView>
      <CryptoView>
        {data.map((item, key) => {
          if (item.name === crypto) {
            return (
              <CryptoLabelView
                key={key + 1}
                onClick={() => setVisible(!visible)}
              >
                <Icon name={item.name} size={25} />
              </CryptoLabelView>
            );
          }
        })}

        <CryptoSelectView visible={visible}>
          {data.map((item, key) => {
            return (
              <CryptoSelectLabelView
                key={key + 1}
                onClick={() => {
                  onChange(item.name);
                  setVisible(!visible);
                }}
              >
                <Icon name={item.name} size={25} />
              </CryptoSelectLabelView>
            );
          })}
        </CryptoSelectView>
      </CryptoView>
    </InputFieldDiv>
  );
};

export default CryptoSelect;
