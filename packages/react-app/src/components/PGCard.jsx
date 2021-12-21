import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "antd";
import { useRef } from "react";
import { ethers } from "ethers";
import { Address } from ".";

const abi = ["function name() view returns (string memory)", "function symbol() view returns (string)"];

export default function PGCard({ creator, token, supply, pgType, mainnetProvider, localProvider, ...props }) {
  const [tokenDetails, setTokenDetails] = useState({});

  const fetchTokenData = async () => {
    // instantiate contract
    const contract = new ethers.Contract(token, abi, localProvider);
    const name = await contract.name();
    const symbol = await contract.symbol();

    setTokenDetails({ name, symbol });
  };

  useEffect(() => {
    // trigger information update here
    fetchTokenData();
  }, [token]);

  return (
    <Card title={`${pgType === "0" ? "ERC20" : "ERC271"}: ${tokenDetails.name} (${tokenDetails.symbol})`}>
      <div className="flex flex-row items-center mb-2">
        <span className="mr-3">Supply: </span>
        <span>{supply}</span>
      </div>
      <div className="flex flex-row items-center mb-2">
        <Link
          to={{
            pathname: `/view/${token}`,
          }}
        >
          View NFT
        </Link>
        <span className="ml-1 mr-1">or</span>
        <Link
          to={{
            pathname: `/whale/${token}`,
          }}
        >
          Fund It 🐳
        </Link>
      </div>
      <div className="flex flex-row items-center mb-2">
        <span className="mr-3">Token Address: </span>
        <span>
          <Address address={token} size={"short"} fontSize={16} ensProvider={mainnetProvider} />
        </span>
      </div>
      <div className="flex flex-row items-center">
        <span className="mr-3">Created By: </span>
        <span>
          <Address address={creator} size={"short"} fontSize={16} ensProvider={mainnetProvider} />
        </span>
      </div>
    </Card>
  );
}
