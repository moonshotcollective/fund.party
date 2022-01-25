import React, { useState, useEffect, useMemo } from "react";
import { Input, Spin, Button, Card } from "antd";
import { Contract, ethers, utils } from "ethers";
import axios from "axios";
import { useHistory } from "react-router-dom";

import { formatEther, parseEther } from "@ethersproject/units";
import { usePoller } from "eth-hooks";
import { NFTABI } from "../contracts/nftabi.js";
import { useExternalContractLoader } from "../hooks";
import { useParams, Link } from "react-router-dom";
import classNames from "classnames";

const ViewNFT = ({
  loadWeb3Modal,
  tx,
  yourLocalBalance,
  localProvider,
  provider,
  userSigner,
  localChainId,
  address,
  userProvider,
  injectedProvider,
}) => {
  const history = useHistory();
  let { nft: nftAddress } = useParams();
  const [nftInfo, setNftInfo] = useState(null);
  const [collection, setCollection] = useState({ loading: true, items: null });
  const [q, setQ] = useState("");

  const nftContract = useMemo(() => {
    if (!nftAddress || !userSigner) return null;
    return new Contract(nftAddress, NFTABI, userSigner);
  }, [nftAddress, userSigner]);

  const fetchNFTInfo = async () => {
    if (!address || !nftContract) return;
    const requests = [
      nftContract.price(),
      nftContract.floor(),
      nftContract.currentToken(),
      nftContract.limit(),
      nftContract.name(),
      nftContract.previewURI(),
    ];
    const responses = await Promise.all(requests);

    setNftInfo({
      price: formatEther(responses[0]),
      floor: formatEther(responses[1]),
      supply: responses[2].toNumber(),
      limit: responses[3].toNumber(),
      name: responses[4],
      preview: responses[5],
    });
  };

  const getTokenURI = async (address, index) => {
    const id = await nftContract.tokenOfOwnerByIndex(address, index);
    const tokenURI = await nftContract.tokenURI(id);
    const metadata = await axios.get(tokenURI);
    const approved = await nftContract.getApproved(id);
    const contractName = await nftContract.name();
    return { ...metadata.data, id, tokenURI, approved: approved === nftContract.address, contractName };
  };

  const loadCollection = async () => {
    if (!address || !nftContract) return;

    setCollection({
      loading: true,
      items: null,
    });
    const balance = (await nftContract.balanceOf(address)).toNumber();
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
      const redeemTx = await tx(nftContract.redeem(id));
      await redeemTx.wait();
    } catch (e) {
      console.log("redeem tx error:", e);
    }
    fetchNFTInfo();
    loadCollection();
  };

  const mintItem = async () => {
    try {
      const txCur = await tx(
        nftContract.mintItem({
          value: parseEther(nftInfo.price),
        }),
      );
      const txInfo = await txCur.wait();
      console.log("txInfo", txInfo);
      fetchNFTInfo();
      loadCollection();
    } catch (e) {
      console.log("mint failed", e);
    }
  };

  const increaseFloor = async () => {
    const txCur = await tx(
      userSigner.sendTransaction({
        to: nftAddress,
        value: parseEther(q),
      }),
    );
    await txCur.wait();
    fetchNFTInfo();
  };

  const haveFunding = nftInfo && nftInfo.floor && parseEther(nftInfo.floor).gt(0);

  useEffect(() => {
    fetchNFTInfo();
    loadCollection();
  }, [nftContract, address]);

  return (
    <div className="max-w-xl mx-auto mt-6 px-4 lg:px-0 pb-10">
      {!nftInfo && (
        <div className="text-center">
          <Spin />
        </div>
      )}
      {nftInfo && (
        <div>
          <div className="mb-6">
            <img src={nftInfo.preview} className="object-cover h-48 w-full" />
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-medium m-0">{nftInfo.name}</p>
              <p className="m-0">Total supply: {nftInfo.limit}</p>
              <p className="m-0">Minted: {nftInfo.supply}</p>
            </div>
            <div className="text-right">
              <Button onClick={() => (window.location.href = "https://opensea.io")}>OpenSea</Button>
            </div>
          </div>
          <p className="text-xl font-medium mt-10">My collection</p>
          {collection.loading && <Spin />}
          {!collection.loading && collection.items && collection.items.length === 0 && (
            <p className="m-0 p-0 -mt-4">Your collection is empty</p>
          )}
          {!collection.loading && collection.items && collection.items.length > 0 && (
            <>
              <div className="grid lg:grid-cols-3 gap-6 md:grid-cols-2 grid-cols-1">
                {collection.items.map(item => (
                  <div>
                    <div
                      className={classNames(
                        "hover:opacity-80 transition-opacity cursor-pointer",
                        !haveFunding && "cursor-not-allowed hover:opacity-100",
                      )}
                      onClick={haveFunding ? () => redeem(item.id) : null}
                    >
                      <img src={item.image} />
                    </div>
                  </div>
                ))}
              </div>
              {!haveFunding ? (
                <div className="pt-4 pb-1">
                  <p className="m-0">Current floor price is 0.0 because there was no funding yet.</p>
                  <p className="m-0">You will be able to redeem your NFTs after initial funding.</p>
                </div>
              ) : (
                <p className="m-0 pt-4 pb-1">
                  Click on any of your NFTs to burn it for <b>{nftInfo.floor.substr(0, 6)}ETH</b>
                </p>
              )}
            </>
          )}
          {!collection.loading && (
            <Button type="primary" className="mt-2" disabled={nftInfo.supply === nftInfo.limit} onClick={mintItem}>
              Mint for Ξ{nftInfo.price.substr(0, 5)}
            </Button>
          )}
          <p className="text-xl font-medium mt-10 p-0 mb-0">Fund the project</p>
          <p className="m-0">
            Current floor price: <b>{nftInfo.floor.substr(0, 6)}ETH</b>
          </p>
          <p className="m-0">You can support the project by donating some ETH to increase the floor price</p>
          <div className="flex mt-4 max-w-sm">
            <Input
              type="number"
              placeholder="1 ETH"
              id="quantity"
              style={{ flex: 2 }}
              value={q}
              onChange={e => setQ(e.target.value)}
            />
            <Button className="ml-3" disabled={!q} onClick={increaseFloor}>
              Donate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewNFT;
