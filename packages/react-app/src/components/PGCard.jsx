import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, Col, Button, Row, notification, Image } from "antd";
import { ExperimentOutlined, FolderViewOutlined, UpSquareOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import axios from "axios";
import { useRef } from "react";
import { ethers } from "ethers";
import { Address } from ".";
import { AlignJustify } from "react-feather";

const abi = [
  "function name() view returns (string memory)",
  "function symbol() view returns (string)",
  "function tokenURI(uint256 tokenId) view returns (string)",
];

export default function PGCard({
  creator,
  token,
  supply,
  pgType,
  mainnetProvider,
  localProvider,
  setCart,
  cart,
  ...props
}) {
  const [tokenDetails, setTokenDetails] = useState({});

  const fetchTokenData = async () => {
    // instantiate contract
    const contract = new ethers.Contract(token, abi, localProvider);
    const name = await contract.name();
    const symbol = await contract.symbol();
    const uri = await contract.tokenURI("2");
    const metadata = await axios.get(uri);

    setTokenDetails({ name, symbol, metadata });
    console.log(metadata.data.image);
  };

  useEffect(() => {
    // trigger information update here
    fetchTokenData();
  }, [token]);

  return (
    <Card title={`${pgType === "0" ? "Token" : "NFT"}: ${tokenDetails.name} ($${tokenDetails.symbol})`}>
      <div className="flex flex-row items-center mb-2">
        {tokenDetails.metadata && <Image preview={false} width={80} src={tokenDetails.metadata.data.image} />}
        <span className="ml-3 mr-1">Supply: </span>
        <span>{supply}</span>
      </div>
      <div className="flex flex-row items-center mb-2">
        <Button
          size="large"
          onClick={() => {
            window.open(`/view/${token}`, "_self");
          }}
        >
          <FolderViewOutlined /> View
        </Button>
        {/* <span className="ml-1 mr-1 ">or</span>
        <Link
          to={{
            pathname: `/whale/${token}`,
          }}
        >
          Fund It 🐳
        </Link> */}
        <div className="flex flex-row items-center ml-2">
          <Row>
            <Col span={12}>
              <Button
                size="large"
                onClick={() => {
                  //window.open(item.branch)
                  let copy = {};
                  copy.name = tokenDetails.name;
                  copy.address = token;
                  console.log(copy);
                  setCart([...cart, copy]);
                  notification.success({
                    style: { marginBottom: 64 },
                    message: "Added to cart!",
                    placement: "bottomRight",
                    description: <div style={{ fontSize: 22 }}>{token.name}</div>,
                  });
                }}
              >
                <ShoppingCartOutlined /> Fund
              </Button>
            </Col>
          </Row>
        </div>
        <div className="flex flex-row items-center ml-2">
          <Button
            size="large"
            onClick={() => {
              window.open(`/whale/${token}`, "_self");
            }}
          >
            <UpSquareOutlined /> RTF
          </Button>
        </div>
      </div>
      {/* <div className="flex flex-row items-center mb-2">
        <span className="mr-3">Token Address: </span>
        <span>
          <Address address={token} size={"short"} fontSize={16} ensProvider={mainnetProvider} />
        </span>
      </div> */}
      {/* <div className="flex flex-row items-center">
        <span className="mr-3">Created By: </span>
        <span>
          <Address address={creator} size={"short"} fontSize={16} ensProvider={mainnetProvider} />
        </span>
      </div> */}
    </Card>
  );
}
