import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useExternalContractLoader } from "../hooks";
import { Button, Input } from "antd";
import { formatEther, parseEther } from "@ethersproject/units";
import { NFTABI } from "../contracts/nftabi.js";
import { usePoller } from "eth-hooks";

const WhalesUI = ({ readContracts, address, writeContracts, tx, userSigner, localProvider }) => {
  const [q, setQ] = useState("");
  const [floor, setFloor] = useState("0.0");
  const [name, setName] = useState();

  let { nft } = useParams();

  const NFT = useExternalContractLoader(localProvider, nft, NFTABI);

  const getData = async () => {
    const floorPrice = await NFT.floor();
    setFloor(formatEther(floorPrice));
    const contractName = await NFT.name();
    setName(contractName);
  };

  usePoller(async () => {
    if (NFT && address) {
      const floorPrice = await NFT.floor();
      setFloor(formatEther(floorPrice));
    }
  }, 1500);

  const increaseFloor = async () => {
    tx(
      userSigner.sendTransaction({
        to: NFT.address,
        value: parseEther(q),
      }),
    );
  };

  useEffect(() => {
    if (NFT) getData();
  }, [address, NFT, NFT]);

  return (
    <div style={{ maxWidth: 300, margin: "20px auto" }}>
      <h2 style={{ marginBottom: "20px" }}>Increasing floor of {name}</h2>
      <div style={{ display: "flex", alignItems: "center", maxWidth: 300, margin: "0 auto", marginBottom: "10px" }}>
        <label htmlFor="quantity" style={{ marginRight: 20, flexGrow: 1, flex: 1, textAlign: "left" }}>
          Quantity:
        </label>
        <Input
          type="number"
          placeholder="1 ETH"
          id="quantity"
          style={{ flex: 2 }}
          value={q}
          onChange={e => setQ(e.target.value)}
        />
      </div>
      <p style={{ textAlign: "left", marginTop: 15 }}>Current floor price = {floor.substr(0, 6)} ETH</p>
      <Button disabled={q === ""} onClick={increaseFloor}>
        Deposit
      </Button>
    </div>
  );
};

export default WhalesUI;
