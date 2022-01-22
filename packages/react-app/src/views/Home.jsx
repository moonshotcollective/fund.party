import React, { useEffect, useState } from "react";
import { Contract } from "ethers";
import { Button, List, Input, Spin } from "antd";
import DeployModal from "./DeployModal";
import { useEventListener } from "eth-hooks/events/useEventListener";
import { formatEther, parseEther } from "@ethersproject/units";
import { PlusOutlined } from "@ant-design/icons";
import { PGCard } from "../components";

function Home({ tx, writeContracts, address, readContracts, localProvider, cart, setCart }) {
  const [show, setShow] = useState(false);
  const [publicGoods, setPublicGoods] = useState(null);

  const fetchEvents = async () => {
    const contract = readContracts.PGDeployer;
    if (contract) {
      const eventFilter = contract.filters.pgDeployed();
      const events = await contract.queryFilter(eventFilter);
      setPublicGoods(events.map(eventLog => eventLog.args));
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [readContracts]);

  return (
    <div className="mt-5 pb-20 container mx-auto">
      <DeployModal
        tx={tx}
        writeContracts={writeContracts}
        address={address}
        show={show}
        onCancel={() => setShow(false)}
        fetchEvents={fetchEvents}
      />

      <div className="flex flex-1 justify-center my-5">
        <Button onClick={() => setShow(true)} type="primary">
          Create Public Good
        </Button>
      </div>

      {publicGoods && (
        <div className="grid lg:grid-cols-3 max-w-6xl mx-auto gap-6 md:grid-cols-2 grid-cols-1 px-4">
          {publicGoods.map(item => (
            <PGCard
              cart={cart}
              setCart={setCart}
              token={item.token}
              supply={item.supply.toString()}
              pgType={item.pgtype.toString()}
              creator={item.creator}
              localProvider={localProvider}
            />
          ))}
        </div>
      )}

      {publicGoods && publicGoods.length === 0 && (
        <div className="text-center">
          <p className="m-0 p-0">No public goods created yet</p>
        </div>
      )}

      {!publicGoods && (
        <div className="text-center">
          <Spin />
        </div>
      )}
    </div>
  );
}

export default Home;
