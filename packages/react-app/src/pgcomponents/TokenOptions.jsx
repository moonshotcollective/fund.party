import React from "react";
import { Button } from "antd";
import classnames from "classnames";

function Choose({ onNextStep, onPreviousStep, pgType, setPgType, ...props }) {
  return (
    <div>
      <div className="text-center">
        <h1 className="text-2xl font-medium">What type of public goods token do you want to create?</h1>
        <div className="my-2">Some more description of what public goods are and how to better contribute.</div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center mt-16">
        <div
          className={classnames("p-2 flex flex-col w-3/4 ring-gray-300 rounded my-2 cursor-pointer ring-2 border-0", {
            "ring-blue-500 ring-2": pgType === 1,
          })}
          onClick={() => setPgType(1)}
        >
          <h2>ERC-20 Tokens</h2>
          <div>Some details on what erc-20 tokens are and how they work.</div>
        </div>
        <div
          className={classnames("p-2 flex flex-col w-3/4 ring-gray-300 rounded my-2 cursor-pointer ring-2 border-0", {
            "ring-blue-500 ring-2": pgType === 2,
          })}
          onClick={() => setPgType(2)}
        >
          <h2>ERC-721 Tokens (NFT)</h2>
          <div>Some details on what erc-721 tokens are and how they work.</div>
        </div>
      </div>

      <div className="mt-20 flex flex-1 items-center justify-center flex-row">
        <Button size="large" onClick={onPreviousStep}>
          Go Back
        </Button>
        <div className="w-4" />
        <Button type="primary" disabled={pgType === 0} size="large" onClick={onNextStep}>
          Continue
        </Button>
      </div>
    </div>
  );
}

export default Choose;
