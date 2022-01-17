import React, { useState } from "react";
import { Button, List, Input } from "antd";
import DeployModal from "./DeployModal";
import { useEventListener } from "eth-hooks/events/useEventListener";
import { formatEther, parseEther } from "@ethersproject/units";
import { PGCard } from "../components";

function Home({ tx, writeContracts, address, readContracts, localProvider, cart, setCart }) {
  const [show, setShow] = useState(false);

  const pgs = (useEventListener(readContracts, "PGDeployer", "pgDeployed", localProvider, 1) || []).reverse();

  return (
    <div className="mt-5 pb-20 container mx-auto">
      <DeployModal
        tx={tx}
        writeContracts={writeContracts}
        address={address}
        show={show}
        onCancel={() => setShow(false)}
      />

      <div className="flex flex-1 justify-center mb-20">
        <Button onClick={() => setShow(true)}>Create Public Good</Button>
      </div>

      <div className="flex flex-1 mt-5 w-full">
        <List
          className="w-full"
          grid={{ gutter: 16, column: 3 }}
          dataSource={pgs}
          renderItem={item => (
            <List.Item>
              <PGCard
                cart={cart}
                setCart={setCart}
                token={item.args.token}
                supply={item.args.supply.toString()}
                pgType={item.args.pgtype.toString()}
                creator={item.args.creator}
                localProvider={localProvider}
              />
            </List.Item>
          )}
        />
      </div>
    </div>
  );
}

export default Home;
