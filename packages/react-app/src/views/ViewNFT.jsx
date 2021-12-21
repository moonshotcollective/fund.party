import React, { useState, useEffect } from "react";
import { Button } from "antd";
import { ethers } from "ethers";
import axios from "axios";

import { formatEther } from "@ethersproject/units";
import { usePoller } from "eth-hooks";
import { NFTABI } from "../contracts/nftabi.js";
import { useExternalContractLoader } from "../hooks";
import { useParams, Link } from "react-router-dom";

const ViewNFT = ({
  loadWeb3Modal,
  tx,
  signer,
  yourLocalBalance,
  localProvider,
  provider,
  userSigner,
  localChainId,
  address,
  ...props
}) => {
  const [collection, setCollection] = useState({
    loading: true,
    items: [],
  });
  const [floor, setFloor] = useState("0.0");
  const [supply, setSupply] = useState();
  const [limit, setLimit] = useState();
  const [nftPrice, setNFTPrice] = useState();

  let { nft } = useParams();

  const NFT = useExternalContractLoader(localProvider, nft, NFTABI);

  usePoller(async () => {
    if (NFT && address) {
      const nftNowPrice = await NFT.price();
      const floorPrice = await NFT.floor();
      const supply = await NFT.currentToken();
      const limit = await NFT.limit();
      setSupply(formatEther(supply));
      setLimit(formatEther(limit));
      setFloor(formatEther(floorPrice));
      setNFTPrice(nftNowPrice);
    }
  }, 1500);

  const getTokenURI = async (ownerAddress, index) => {
    const id = await NFT.tokenOfOwnerByIndex(ownerAddress, index);
    const tokenURI = await NFT.tokenURI(id);
    const metadata = await axios.get(tokenURI);
    const approved = await NFT.getApproved(id);
    const contractName = await NFT.name();
    return { ...metadata.data, id, tokenURI, approved: approved === NFT.address, contractName };
  };

  const loadCollection = async () => {
    if (!address || !NFT) return;
    setCollection({
      loading: true,
      items: [],
    });
    const balance = (await NFT.balanceOf(address)).toNumber();
    const tokensPromises = [];
    for (let i = 0; i < balance; i += 1) {
      tokensPromises.push(getTokenURI(address, i));
    }
    const tokens = await Promise.all(tokensPromises);
    setCollection({
      loading: false,
      items: tokens,
    });
  };

  const redeem = async id => {
    try {
      const redeemTx = await tx(NFT.redeem(id));
      await redeemTx.wait();
    } catch (e) {
      console.log("redeem tx error:", e);
    }
    loadCollection();
  };

  const approveForBurn = async id => {
    try {
      const approveTx = await tx(NFT.approve(NFT.address, id));
      await approveTx.wait();
    } catch (e) {
      console.log("Approve tx error:", e);
    }
    loadCollection();
  };

  useEffect(() => {
    if (NFT) loadCollection();
  }, [address, NFT, NFT]);

  return (
    <div style={{ maxWidth: 768, margin: "20px auto" }}>
      {address ? (
        <>
          <div style={{ display: "row", margin: "0 auto" }}>
            <div style={{ marginLeft: "20px" }}>
              <Button
                style={{ marginTop: 15 }}
                type="primary"
                disabled={supply >= limit}
                onClick={async () => {
                  const priceRightNow = await NFT.price();
                  setNFTPrice(priceRightNow);
                  try {
                    const txCur = await tx(NFT.mintItem(address, { value: nftPrice }));
                    await txCur.wait();
                  } catch (e) {
                    console.log("mint failed", e);
                  }
                  loadCollection();
                }}
              >
                MINT for Ξ{nftPrice && (+ethers.utils.formatEther(nftPrice)).toFixed(4)}
              </Button>
              <span className="ml-1 mr-1">or</span>
              <Link
                to={{
                  pathname: `/whale/${nft}`,
                }}
              >
                Fund It 🐳
              </Link>
            </div>
            {collection.items.length === 0 && <p>Your collection is empty</p>}
            {collection.items.length > 0 &&
              collection.items.map(item => (
                <div
                  style={{
                    border: "1px solid #cccccc",
                    padding: 16,
                    width: 380,
                    margin: "auto",
                    marginTop: 20,
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <img
                    style={{ maxWidth: "150px", display: "block", margin: "0 auto", marginBottom: "10px" }}
                    src={item.image}
                    alt="Your NFT"
                  />
                  <div style={{ marginLeft: "20px" }}>
                    <p style={{ textAlign: "center", marginTop: 15 }}>Contract: {item.contractName}</p>
                    <Button style={{ width: "100%", minWidth: 100 }} onClick={() => redeem(item.id)}>
                      Redeem for {floor.substr(0, 6)}
                    </Button>
                    <p style={{ textAlign: "center", marginTop: 15 }}>{item.name}</p>
                  </div>
                </div>
              ))}
          </div>
          <p style={{ textAlign: "center", marginTop: 15 }}>Current floor price = {floor.substr(0, 6)} ETH</p>
        </>
      ) : (
        <Button key="loginbutton" type="primary" onClick={loadWeb3Modal}>
          Connect to mint
        </Button>
      )}
    </div>
  );
};

export default ViewNFT;
