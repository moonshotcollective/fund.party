import React, { useState } from "react";
import { Button } from "antd";
import { formatEther, parseEther } from "@ethersproject/units";

function Details({
  tx,
  reset,
  pgType,
  pgData,
  address,
  isDeploying,
  writeContracts,
  onPreviousStep,
  setIsDeploying,
  uCID,
  files,
  fetchEvents,
}) {
  console.log(pgData);

  const handleDeployment = async () => {
    setIsDeploying(true);
    console.log(pgData);

    /* uint256 _basePrice,
    uint256 _curve,
    string memory base,
    string[] memory _uris */

    try {
      let method = "deployERC20";
      const { name, symbol, totalSupply, decimal } = pgData;
      console.log("pgData", pgData);
      let extradata = [decimal];
      let calldata = [address, name, symbol, totalSupply];

      if (pgType === 2) {
        method = "deployERC721";
        extradata = [
          parseEther(pgData.startPrice.toString()),
          1000 + pgData.inflation * 10,
          pgData.baseURI,
          pgData.userURIs,
          pgData.preview,
        ];
      }

      calldata = [...calldata, ...extradata];

      const result = tx(writeContracts.PGDeployer[method](...calldata), update => {
        console.log("📡 Transaction Update:", update);
        if (update && (update.status === "confirmed" || update.status === 1)) {
          reset();
          fetchEvents();
          console.log(" 🍾 Transaction " + update.hash + " finished!");
          console.log(
            " ⛽️ " +
            update.gasUsed +
            "/" +
            (update.gasLimit || update.gas) +
            " @ " +
            parseFloat(update.gasPrice) / 1000000000 +
            " gwei",
          );
        }
      });
      console.log("awaiting metamask/web3 confirm result...", result);
      console.log(await result);
    } catch (error) {
      console.log(error);
      setIsDeploying(false);
      // reset();
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-medium">Deploy variables</h1>
      <div className="mt-6 max-w-lg mx-auto">
        {pgData.name && (
          <p className="p-0 mb-1">
            Project Name: {pgData.name} ({pgData.symbol})
          </p>
        )}
        {pgData.name && <p className="p-0 mb-1">Total Supply: {pgData.totalSupply}</p>}
        {pgData.decimal && <p className="p-0 mb-1">Token Decimal: {pgData.decimal}</p>}
        {pgData.inflation && <p className="p-0 mb-1">Token Inflation Rate: {pgData.inflation}%</p>}
        {pgData.baseURI && (
          <p className="p-0 m-0">
            Token BaseURI:{" "}
            <a href={pgData.baseURI} target="_blank">
              Click
            </a>
          </p>
        )}
        {/* {pgData.baseURI && (
          <div className="flex flex-1 flex-row mb-2">
            <div className="mr-2 flex flex-nowrap">Token BaseURI:</div>
            <div className="truncate max-w-sm">
              <a href={pgData.baseURI} target="_blank">
                Click
              </a>
            </div>
          </div>
        )} */}
      </div>
      <div className="mt-12 flex flex-1 items-center justify-center flex-row">
        {!isDeploying && (
          <>
            <Button size="large" onClick={onPreviousStep}>
              Go Back
            </Button>
            <div className="w-4" />
          </>
        )}
        <Button type="primary" size="large" disabled={isDeploying} loading={isDeploying} onClick={handleDeployment}>
          {isDeploying ? "Deploying..." : "Deploy"}
        </Button>
      </div>
    </div>
  );
}

export default Details;
