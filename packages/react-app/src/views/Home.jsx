import React, { useEffect, useState } from "react";
import { Contract } from "ethers";
import { Button, Select, List, Input, Spin } from "antd";
import DeployModal from "./DeployModal";
import { useEventListener } from "eth-hooks/events/useEventListener";
import { formatEther, parseEther } from "@ethersproject/units";
import { PlusOutlined } from "@ant-design/icons";
import { StreamCard } from "../components";
import { StreamABI } from "../contracts/StreamABI";
import { useDebounce } from "../hooks";

const { Search } = Input;
const { Option } = Select;

function Home({ tx, writeContracts, address, readContracts, localProvider, cart, setCart }) {
  const [show, setShow] = useState(false);
  const [publicGoods, setPublicGoods] = useState(null);
  const [selectFilter, setSelectFilter] = useState("");
  const [searchName, setSearchName] = useState("");
  const debouncedSearchName = useDebounce(searchName, 1000);

  const fetchEvents = async () => {
    setPublicGoods(null);

    const contract = readContracts.PGDeployer;

    if (contract) {
      const eventFilter = contract.filters.pgDeployed();
      const events = await contract.queryFilter(eventFilter);
      const goods = events.map(eventLog => ({ ...eventLog.args, name: "" }));
      console.log("gud", goods);
      for (const good of goods) {
        const contract = new Contract(good.token, StreamABI, localProvider);
        good.name = await contract.orgName();
        console.log("fetched good", good);
      }
      const selectedGoods = goods.filter(
        x => x.pgtype.toString().includes(selectFilter) && x.name.toLowerCase().includes(debouncedSearchName),
      );
      setPublicGoods(selectedGoods);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [readContracts, selectFilter, debouncedSearchName]);

  return (
    <div className="mt-5 pb-20 container mx-auto max-w-6xl px-4">
      <DeployModal
        tx={tx}
        writeContracts={writeContracts}
        address={address}
        show={show}
        onCancel={() => setShow(false)}
        fetchEvents={fetchEvents}
      />
      <div className="flex justify-between">
        <p className="font-bold text-2xl m-0 mb-3">Public TokenStreams</p>
        <Button onClick={() => setShow(true)} type="primary" type="ghost">
          Create Stream
        </Button>
      </div>
      <div className="mb-6 flex">
        <Input
          placeholder="Search by Organization name"
          size="large"
          onChange={e => setSearchName(e.target.value)}
          value={searchName}
        />
        <Select
          defaultValue="lucy"
          style={{ width: 120, height: "100%" }}
          size="large"
          style={{ width: 110, marginLeft: 20 }}
          value={selectFilter}
          onChange={newValue => setSelectFilter(newValue)}
        >
          <Option value="">All</Option>
        </Select>
      </div>

      {publicGoods && (
        <>
          {/* <Search placeholder="Name" allowClear enterButton="Search" size="large" className="mb-6" />
          <Input /> */}
          <div className="grid lg:grid-cols-3 max-w-6xl mx-auto gap-6 md:grid-cols-2 grid-cols-1">
            {publicGoods.map(item => (
              <StreamCard
                cart={cart}
                setCart={setCart}
                token={item.token}
                /* minted={item.minted} */
                /* supply={item.supply.toString()}
                pgType={item.pgtype.toString()} */
                creator={item.creator}
                localProvider={localProvider}
              />
            ))}
          </div>
        </>
      )}
      {publicGoods && publicGoods.length === 0 && (
        <div className="text-center">
          <p className="m-0 p-0">No streams deployed yet..</p>
          <p className="m-0 p-0">Click "Create a Stream", and be the first!</p>
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
