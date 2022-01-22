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
    <div className="text-center">
      <h1 className="text-2xl font-medium">Deploy variables</h1>
      <div className="flex-1 justify-center mx-auto mt-10 max-w-lg">
        {pgData.name && (
          <div className="flex flex-1 flex-row mb-2">
            <div className="mr-2">Project Name:</div>
            <div>
              {pgData.name} ({pgData.symbol})
            </div>
          </div>
        )}
        {pgData.totalSupply && (
          <div className="flex flex-1 flex-row mb-2">
            <div className="mr-2">Max Total Supply:</div>
            <div>{pgData.totalSupply}</div>
          </div>
        )}
        {pgData.decimal && (
          <div className="flex flex-1 flex-row mb-2">
            <div className="mr-2">Token Decimal:</div>
            <div>{pgData.decimal}</div>
          </div>
        )}
        {pgData.inflation && (
          <div className="flex flex-1 flex-row mb-2">
            <div className="mr-2">Token Inflation Rate:</div>
            <div>{pgData.inflation}</div>
          </div>
        )}
        {pgData.baseURI && (
          <div className="flex flex-1 flex-row mb-2">
            <div className="mr-2 flex flex-nowrap">Token BaseURI:</div>
            <div className="truncate max-w-sm">
              <a href={pgData.baseURI} target="_blank">
                Click
              </a>
            </div>
          </div>
        )}
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
