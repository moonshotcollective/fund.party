import { SyncOutlined } from "@ant-design/icons";
import { formatEther, parseEther } from "@ethersproject/units";
import { Button, Card, DatePicker, Divider, Input, List, Progress, Slider, Spin, Switch, notification } from "antd";
import React, { useState } from "react";
import { Address, Balance, AddressInput, EtherInput } from "../components";
import { useHistory } from "react-router-dom";
import StackGrid from "react-stack-grid";
import { ethers } from "ethers";

export default function Checkout({ setRoute, cart, setCart, displayCart, tx, writeContracts, mainnetProvider }) {
  const [newPurpose, setNewPurpose] = useState("loading...");
  const [q, setQ] = useState("");

  let history = useHistory();
  const [thanks, setThanks] = useState();

  const fundProjects = async () => {
    const selected = cart.map(item => item.address);
    tx(
      writeContracts.PGDeployer.fundSelectedProjects(selected, {
        value: parseEther(q),
      }),
    );
  };

  if (thanks) {
    return (
      <div>
        <div style={{ width: "calc(max(min(80vw,800px),300px))", margin: "auto" }}>{thanks}</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ width: "calc(max(min(80vw,800px),300px))", margin: "auto" }}>
        <p className="text-xl font-medium mt-10 mb-0">Funding</p>
        {/* <div className="flex items-center max-w-md">
          <Input
            type="number"
            placeholder="Fund all Projects with 'x' ETH"
            id="quantity"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <Button disabled={q === ""} onClick={fundProjects} className="ml-5">
            Deposit
          </Button>
        </div> */}

        {cart && cart.length > 0 ? (
          <>
            <div className="grid lg:grid-cols-3 gap-6 md:grid-cols-2 grid-cols-1 mt-4">{displayCart}</div>
            <div className="flex justify-between max-w-sm mt-4">
              <Input
                type="number"
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Amount in ETH to split"
              />
              {/* <EtherInput
                type=""
                autoFocus={true}
                placeholder={cart && cart.length > 0 ? "Amount in ETH to split" : "Amount in ETH"}
                price={false}
                value={amount}
                onChange={value => {
                  setAmount(value);
                }}
              /> */}
              <Button onClick={fundProjects} size="large" type="primary" className="ml-4" disabled={!q}>
                Fund
              </Button>
            </div>
          </>
        ) : (
          <div>
            <p className="m-0 p-0 mt-3">Cart is empty</p>
          </div>
        )}
      </div>
    </div>
  );
}
