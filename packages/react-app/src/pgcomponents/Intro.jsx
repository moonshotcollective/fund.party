import { Button } from "antd";
import React from "react";

function Intro({ onNextStep }) {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-medium">So You Want To Create A Public Goods?</h1>
      <div className="my-3">Some more description of what public goods are and how to do it well.</div>

      <div className="mt-20">
        <Button type="primary" size="large" onClick={onNextStep}>
          Continue
        </Button>
      </div>
    </div>
  );
}

export default Intro;
