import React, { useEffect, useState } from "react";
import { useContractReader } from "eth-hooks";
import { useExternalContractLoader, useEventListener } from "../hooks";
import { Button } from "antd";
import { ExampleUI } from ".";
import { useParams } from "react-router-dom";
import { SimpleStreamABI } from "../contracts/external_ABI";

function StreamHOC(props) {
  const { address: contractAddress } = useParams();
  const genAddress = "0x0000000000000000000000000000000000000000";
  // const [stream, setStream] = useState();
  //const stream = useContractReader(props.readContracts, "StreamFactory", "getStreamForUser", [address]) || genAddress;

  return contractAddress !== genAddress ? (
    <UserStream stream={contractAddress} contractAddress={contractAddress} {...props} />
  ) : (
    <div style={{ marginTop: 60 }}>This user's stream does not exist. Please create Stream for user first.</div>
  );
}

function UserStream({ contractAddress, stream, provider, localProvider, readContracts, ...props }) {
  const [data, setData] = useState({});
  const [ready, setReady] = useState(false);
  const SimpleStream = useExternalContractLoader(provider, contractAddress, SimpleStreamABI) || {};
  const [withdrawEvents, createWithdrawEvents] = useEventListener();
  const [depositEvents, createDepositEvents] = useEventListener();

  const loadStreamData = async () => {
    const streamBalance = await SimpleStream.streamBalance();
    const streamCap = await SimpleStream.cap();
    const streamfrequency = await SimpleStream.frequency();
    const streamToAddress = await SimpleStream.toAddress();
    const totalStreamBalance = await provider.getBalance(stream);

    setData({ streamBalance, streamCap, streamfrequency, streamToAddress, totalStreamBalance });
    setReady(true);
  };

  useEffect(() => {
    if (SimpleStream.streamBalance) {
      loadStreamData();
      createWithdrawEvents({ SimpleStream }, "SimpleStream", "Withdraw", provider, 1);
      createDepositEvents({ SimpleStream }, "SimpleStream", "Deposit", provider, 1);
    }
  }, [SimpleStream.streamBalance]);

  return ready ? (
    <ExampleUI
      {...data}
      {...props}
      stream={contractAddress}
      SimpleStream={SimpleStream}
      readContracts={readContracts}
      depositEvents={depositEvents}
      withdrawEvents={withdrawEvents}
    />
  ) : null;
}

export default StreamHOC;
