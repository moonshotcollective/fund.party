import React, { useState, useEffect, useMemo } from "react";
import { Contract, ethers, utils } from "ethers";
import axios from "axios";
import { useHistory } from "react-router-dom";

import { NFTABI } from "../contracts/nftabi.js";

import { useParams, Link } from "react-router-dom";

import { Modal, Button, notification, Radio, InputNumber, List, Row, Col, Progress, Spin } from "antd";
import { AddressInput, Address, Balance } from "../components";
import { SimpleStreamABI } from "../contracts/external_ABI";
import { useExternalContractLoader, useEventListener } from "../hooks";
import { useContractLoader, useContractReader } from "eth-hooks";

const STREAMS_CACHE_TTL_MILLIS = Number.parseInt(process.env.REACT_APP_STREAMS_CACHE_TTL_MILLIS) || 43200000; // 12h ttl by default
// the actual cache
const streamsCache = {};

class CachedValue {
  constructor(value) {
    this.value = value;
    this.updatedAt = Date.now();
  }

  isStale = () => {
    return this.updatedAt + STREAMS_CACHE_TTL_MILLIS <= Date.now();
  };
}

async function resolveStreamSummary(streamAddress, localProvider) {
  const cachedStream = streamsCache[streamAddress];
  if (cachedStream && cachedStream instanceof CachedValue && !cachedStream.isStale()) {
    return cachedStream.value;
  }

  var contract = new ethers.Contract(streamAddress, SimpleStreamABI, localProvider);

  var data = {};

  // Call it's cap function
  await contract.cap().then(result => (data.cap = Number(result._hex) * 0.000000000000000001));

  // Call it's Balance function, calculate the current percentage
  await contract
    .streamBalance()
    .then(result => (data.percent = ((Number(result._hex) * 0.000000000000000001) / data.cap) * 100));

  streamsCache[streamAddress] = new CachedValue(data);
  console.log("resolved", data);
  return data;
}

const ViewNFT = ({
  loadWeb3Modal,
  tx,
  mainnetProvider,
  yourLocalBalance,
  localProvider,
  provider,
  readContracts,
  userSigner,
  localChainId,
  address,
  userProvider,
  injectedProvider,
}) => {
  const history = useHistory();
  const [amount, setAmount] = useState(1);
  const [userAddress, setUserAddress] = useState("");
  const [duration, setDuration] = useState(4);
  const [startFull, setStartFull] = useState(0);
  const [newStreamModal, setNewStreamModal] = useState(false);
  const [ready, setReady] = useState(false);
  const [withdrawEvents, createWithdrawEvents] = useEventListener();
  const [orgInfo, setorgInfo] = useState(null);
  const [depositEvents, createDepositEvents] = useEventListener();

  const [sData, setData] = useState([]);
  let { nft: orgAddress } = useParams();
  console.log("address", orgAddress);

  const orgContract = useMemo(() => {
    if (!orgAddress) return null;
    if (userSigner) return new Contract(orgAddress, NFTABI, userSigner);
    return new Contract(orgAddress, NFTABI, localProvider);
  }, [orgAddress, userSigner]);

  const fetchOrgInfo = async () => {
    if (!address || !orgContract) return;
    let eventFilter = orgContract.filters.StreamAdded();
    /* const requests = [await orgContract.queryFilter(eventFilter)];
    const responses = await Promise.all(requests); */
    let rawStreams = await orgContract.queryFilter(eventFilter);
    let streams = rawStreams.map(s => s.decode(s.data));
    console.log("ejs", streams);

    Promise.all(
      streams.map(async stream => {
        const summary = await resolveStreamSummary(stream.stream, localProvider);
        return { ...stream, 3: summary.cap, percent: summary.percent };
      }),
    ).then(results => {
      setData(results);

      // Wait until list is almost fully loaded to render
      if (results.length >= 20) {
        setReady(true);
      }
    });

    /* setorgInfo({
      stream: responses[0].args,
    }); */
  };

  useEffect(() => {
    fetchOrgInfo();
    console.log("org", orgInfo);
  }, [orgContract, address]);

  const createNewStream = async () => {
    const capFormatted = ethers.utils.parseEther(`${amount || "1"}`);
    const frequencyFormatted = ethers.BigNumber.from(`${duration || 1}`).mul("604800");
    const _startFull = startFull === 1;
    const GTCContractAddress = readContracts && readContracts.GTC.address;

    const result = tx(
      orgContract.createStreamFor(userAddress, capFormatted, frequencyFormatted, _startFull, GTCContractAddress),
      async update => {
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
          // reset form to default values
          setUserAddress("");
          setAmount(1);
          setDuration(4);
          setStartFull(0);

          // close stream modal
          setNewStreamModal(false);

          // send notification of stream creation
          notification.success({
            message: "New GTC Stream created",
            description: `Stream is now available for ${userAddress}`,
            placement: "topRight",
          });
        }
      },
    );
    console.log("awaiting metamask/web3 confirm result...", result);
    console.log(await result);
  };

  return (
    <div
      style={{
        width: 600,
        margin: "20px auto",
        padding: 20,
        paddingBottom: 50,
      }}
    >
      <Button style={{ marginTop: 20 }} type="primary" onClick={() => setNewStreamModal(true)}>
        Create New Stream
      </Button>
      {newStreamModal && (
        <Modal
          centered
          title="Create new stream"
          visible={newStreamModal}
          onOk={createNewStream}
          onCancel={() => setNewStreamModal(false)}
        >
          <div style={{ marginBottom: 5 }}>Recipient:</div>
          <AddressInput ensProvider={mainnetProvider} value={userAddress} onChange={a => setUserAddress(a)} />
          <div style={{ marginBottom: 25 }} />
          <div style={{ display: "flex", flex: 1, flexDirection: "row" }}>
            <div style={{ flex: 1, flexDirection: "column" }}>
              <div style={{ marginBottom: 5 }}>GTC Amount:</div>
              <InputNumber
                placeholder="Amount"
                min={1}
                value={amount}
                onChange={v => setAmount(v)}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ marginLeft: 10, marginRight: 10 }} />
            <div style={{ flex: 1, flexDirection: "column" }}>
              <div style={{ marginBottom: 5 }}>Frequency in weeks:</div>
              <InputNumber
                placeholder="Duration"
                min={1}
                value={duration}
                onChange={d => setDuration(d)}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ marginLeft: 10, marginRight: 10 }} />
            <div style={{ flex: 1, flexDirection: "column" }}>
              <div style={{ marginBottom: 5 }}>Start full:</div>
              <Radio.Group onChange={e => setStartFull(e.target.value)} value={startFull}>
                <Radio value={1}>Yes</Radio>
                <Radio value={0}>No</Radio>
              </Radio.Group>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ViewNFT;
