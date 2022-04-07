import React from "react";
import { CryptoLabelView, Input, InputDiv, InputFieldDiv } from "./StyledInput";
import noxImg from "../../assets/Nox_Transp.png";
const InputField = ({ value, placeholder, onChange, name }) => {
  return (
    <InputFieldDiv>
      <InputDiv>
        <Input
          type="number"
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          name={name}
          disabled
        />
      </InputDiv>

      <CryptoLabelView>
        <img src={noxImg} alt="nox token" width="25px" height="25px" />
      </CryptoLabelView>
    </InputFieldDiv>
  );
};

export default InputField;
