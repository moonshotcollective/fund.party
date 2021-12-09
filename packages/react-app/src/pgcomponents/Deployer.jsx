import React, { useState } from "react";
import { Button } from "antd";

function Details({ onPreviousStep, onNextStep, deployed, ...props }) {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-medium">Deployment in Progress</h1>
      <div className="my-2">Wait while we confirm your token on the blockchain.</div>

      <div className="flex flex-1 flex-col items-center justify-center mx-auto mt-16 max-w-lg">
        Display Loading Icon w/ tx Hash
      </div>

      <div className="mt-20 flex flex-1 items-center justify-center flex-row">
        {deployed && (
          <Button type="primary" size="large" onClick={onNextStep}>
            Deployment completed
          </Button>
        )}
      </div>
    </div>
  );
}

export default Details;
