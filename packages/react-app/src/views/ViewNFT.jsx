import React, { useState, useEffect } from "react";
import { Button } from "antd";
import { ethers } from "ethers";
import axios from "axios";
import { Balance } from "../components/";

import { formatEther } from "@ethersproject/units";
import { usePoller } from "eth-hooks";
import { FLOOR_ABI } from "../contracts/floor_abi";

//import { useBalance } from "eth-hooks";
import { useExternalContractLoader } from "../hooks";
import { useParams } from "react-router-dom";

const ViewNFT = ({ loadWeb3Modal, tx, localProvider, price, userSigner, address, yourLocalBalance, ...props }) => {
  const [collection, setCollection] = useState({
    loading: true,
    items: [],
  });
  const [floor, setFloor] = useState("0.0");
  const [supply, setSupply] = useState();
  const [limit, setLimit] = useState();
  const [mintButton, setPrice] = useState();
  const [mintPrice, setMintPrice] = useState();

  let { nft } = useParams();
  console.log(nft);

  //const [customAddresses, setCustomAddresses] = useState({});

  const NFT = useExternalContractLoader(localProvider, nft, FLOOR_ABI);

  // Load in your local 📝 contract and read a value from it:
  //const readContracts = useContractLoader(localProvider, contractConfig);

  // If you want to make 🔐 write transactions to your contracts, use the userSigner:

  //const mintButton = useContractReader(NFT, nft, "price");

  //let newContract = NFT.attach(contractConfig);

  usePoller(async () => {
    if (NFT && address) {
      const floorPrice = await NFT.floor();
      const supply = await NFT.currentToken();
      const limit = await NFT.limit();
      const price = await NFT.price();
      console.log(formatEther(price));
      setSupply(formatEther(supply));
      setLimit(formatEther(limit));
      setFloor(formatEther(floorPrice));
      setPrice(formatEther(price));
    }
  }, 1500);

  const getTokenURI = async (ownerAddress, index) => {
    const id = await NFT.tokenOfOwnerByIndex(ownerAddress, index);
    const tokenURI = await NFT.tokenURI(id);
    const metadata = await axios.get(tokenURI);
    const approved = await NFT.getApproved(id);
    return { ...metadata.data, id, tokenURI, approved: approved === NFT.address };
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

  /* useEffect(() => {
    let newCustomAddresses = { NFT: nft };
    setCustomAddresses(newCustomAddresses);
    if (newCustomAddresses) loadCollection();
  }, [address, readContracts, writeContracts]); */

  /* useEffect(() => {
    let newCustomAddresses = { NFT: nft };
    if (merklerMetadata) newCustomAddresses.ERC20 = merklerMetadata.args._tokenAddress;
    setCustomAddresses(newCustomAddresses);
  }, [merklerMetadata]); */

  return (
    <div style={{ maxWidth: 768, margin: "20px auto" }}>
      <Balance address={address} provider={localProvider} price={price} />
      {address ? (
        <>
          <div style={{ display: "grid", margin: "0 auto" }}>
            <h3 style={{ marginBottom: 25 }}>My collection: </h3>
            {collection.items.length === 0 && <p>Your collection is empty</p>}
            {collection.items.length > 0 &&
              collection.items.map(item => (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                  <img
                    style={{ maxWidth: "150px", display: "block", margin: "0 auto", marginBottom: "20px" }}
                    src={item.image}
                    alt="Your NFT"
                  />
                  <div style={{ marginLeft: "20px" }}>
                    <Button style={{ width: "100%", minWidth: 100 }} onClick={() => redeem(item.id)}>
                      Redeem
                    </Button>
                  </div>
                </div>
              ))}
          </div>
          <p style={{ textAlign: "center", marginTop: 15 }}>Current floor price = {floor.substr(0, 6)} ETH</p>
          <Button
            style={{ marginTop: 15 }}
            type="primary"
            disabled={supply >= limit}
            onClick={async () => {
              const mintPrice = await NFT.price();
              setMintPrice(formatEther(mintPrice));
              console.log(ethers.utils.formatEther(mintPrice));
              try {
                const txCur = await tx(NFT.mintItem(address, { value: mintPrice }));
                await txCur.wait();
              } catch (e) {
                console.log("mint failed", e);
              }

              loadCollection();
            }}
          >
            MINT for Ξ{mintButton && mintButton}
          </Button>
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
