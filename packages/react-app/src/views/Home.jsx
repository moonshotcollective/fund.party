import React, { useState } from "react";
import { Button, List } from "antd";
import DeployModal from "./DeployModal";
import { useEventListener } from "eth-hooks/events/useEventListener";
import { PGCard } from "../components";

function Home({ tx, writeContracts, address, readContracts, blockExplorer, localProvider }) {
  const [show, setShow] = useState(false);

  const pgs = (useEventListener(readContracts, "PGDeployer", "pgDeployed", localProvider, 1) || []).sort((a, b) =>
    a.args.timestamp > b.args.timestamp ? 1 : -1,
  );

  return (
    <div className="mt-20 pb-20 container mx-auto">
      <DeployModal
        tx={tx}
        writeContracts={writeContracts}
        address={address}
        show={show}
        onCancel={() => setShow(false)}
      />

      <div className="flex flex-1 justify-end">
        <Button onClick={() => setShow(true)}>Create Public Good Token</Button>
      </div>

      <div className="flex flex-1 mt-20 w-full">
        <List
          className="w-full"
          grid={{ gutter: 16, column: 3 }}
          dataSource={pgs.reverse()}
          renderItem={item => (
            <List.Item key={item.args.token}>
              <PGCard
                token={item.args.token}
                blockExplorer={blockExplorer}
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
