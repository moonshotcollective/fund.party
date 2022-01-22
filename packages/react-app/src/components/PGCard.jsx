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
  "function previewURI() view returns (string)",
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
    const previewURI = await contract.previewURI();
    console.log("previewURI", previewURI);
    //const uri = await contract.tokenURI("2");
    //const metadata = await axios.get(uri);

    setTokenDetails({ name, symbol, previewURI });
    //console.log(metadata.data.image);
  };

  useEffect(() => {
    // trigger information update here
    fetchTokenData();
  }, [token]);

  return (
    <Card className="m-0 p-0 mx-auto block" cover={<img src={tokenDetails.previewURI} style={{ height: 300 }} />}>
      <p className="font-medium text-lg">{`${pgType === "0" ? "Token" : "NFT"}: ${tokenDetails.name} ($${tokenDetails.symbol
        })`}</p>
      <div className="flex flex-row items-center mb-2 font-normal" style={{ marginTop: "-20px", marginBottom: "25px" }}>
        <span className="mr-1">Supply: </span>
        <span>{supply}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          className="flex-grow"
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          size="large"
          onClick={() => {
            window.open(`/view/${token}`, "_self");
          }}
        >
          <FolderViewOutlined /> <p className="m-0 p-0">View</p>
        </Button>
        <Button
          className="flex-grow"
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          size="large"
          onClick={() => {
            const projectInfo = {
              name: tokenDetails.name,
              address: token,
            };
            const exists = cart.some(item => item.address === token);

            if (!exists) {
              setCart([...cart, projectInfo]);
              notification.success({
                style: { marginBottom: 64 },
                message: "Added to cart!",
                placement: "bottomRight",
                description: <div style={{ fontSize: 22 }}>{token.name}</div>,
              });
            } else {
              notification.error({
                style: { marginBottom: 64 },
                message: "Project is already in the cart!",
                placement: "bottomRight",
                description: <div style={{ fontSize: 22 }}>{token.name}</div>,
              });
            }
          }}
        >
          <ShoppingCartOutlined /> <p className="m-0 p-0">Fund</p>
        </Button>
        <Button
          className="flex-grow"
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          size="large"
          onClick={() => {
            window.open(`/whale/${token}`, "_self");
          }}
        >
          <UpSquareOutlined /> <p className="m-0 p-0">RTF</p>
        </Button>
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
