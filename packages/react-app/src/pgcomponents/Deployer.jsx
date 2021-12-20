import React, { useState } from "react";
import { Button } from "antd";

function Details({ tx, reset, pgType, pgData, address, isDeploying, writeContracts, onPreviousStep, setIsDeploying }) {
  console.log(pgData);

  const handleDeployment = async () => {
    setIsDeploying(true);
    console.log(pgData);

    try {
      let method = "deployERC20";
      const { name, symbol, totalSupply, decimal } = pgData;
      let extradata = [decimal];
      let calldata = [address, name, symbol, totalSupply];

      if (pgType === 2) {
        method = "deployERC721";
        extradata = [pgData.baseURI, ""];
      }

      calldata = [...calldata, ...extradata];

      const result = tx(writeContracts.PGDeployer[method](...calldata), update => {
        console.log("📡 Transaction Update:", update);
        if (update && (update.status === "confirmed" || update.status === 1)) {
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
      const txResult = await result;

      // wait for given number of confirmations
      txResult.wait(1);

      reset();
    } catch (error) {
      console.log(error);
      setIsDeploying(false);
      // reset();
    }
  };

  return (
    <div className="text-center">
      <h1 className="text-2xl font-medium">Deployment in Progress</h1>
      <div className="my-2">Wait while we confirm your token on the blockchain.</div>

      <div className="flex flex-1 flex-col items-center justify-center mx-auto mt-16 max-w-lg">
        {pgData.name && (
          <div className="flex flex-1 flex-row border-b mb-2">
            <div className="mr-2">Project Name:</div>
            <div>
              {pgData.name} ({pgData.symbol})
            </div>
          </div>
        )}
        {pgData.totalSupply && (
          <div className="flex flex-1 flex-row border-b mb-2">
            <div className="mr-2">Max Total Supply:</div>
            <div>{pgData.totalSupply}</div>
          </div>
        )}
        {pgData.decimal && (
          <div className="flex flex-1 flex-row border-b mb-2">
            <div className="mr-2">Token Decimal:</div>
            <div>{pgData.decimal}</div>
          </div>
        )}
        {pgData.inflation && (
          <div className="flex flex-1 flex-row border-b mb-2">
            <div className="mr-2">Token Inflation Rate:</div>
            <div>{pgData.inflation}</div>
          </div>
        )}
        {pgData.baseURI && (
          <div className="flex flex-1 flex-row mb-2">
            <div className="mr-2 flex flex-nowrap">Token baseURI:</div>
            <div className="truncate max-w-sm">
              <a href={pgData.baseURI} target="_blank">
                {pgData.baseURI}
              </a>
            </div>
          </div>
        )}
      </div>
      <div className="mt-20 flex flex-1 items-center justify-center flex-row">
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
