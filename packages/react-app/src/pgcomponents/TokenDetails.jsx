import React, { useState, useEffect } from "react";
import { Button, Form, Input } from "antd";
import { create, urlSource } from "ipfs-http-client";

//phunk CID QmQcoXyYKokyBHzN3yxDYgPP25cmZkm5Gqp5bzZsTDF7cd

function Details({ onPreviousStep, onNextStep, pgType, pgData, setPgData, handleDeployment, ...props }) {
  const [files, setFiles] = useState([]);
  const [userURI2, setUserURI2] = useState();
  const [form] = Form.useForm();
  const [requiredMark, setRequiredMarkType] = useState("optional");

  const onRequiredTypeChange = ({ requiredMarkValue }) => {
    setRequiredMarkType(requiredMarkValue);
  };

  async function getLinks(ipfsPath) {
    const url = "https://dweb.link/api/v0";
    const ipfs = create({ url });

    const links = [];
    for await (const link of ipfs.ls(userURI2)) {
      links.push(link);
    }
    console.log(links);
  }

  /* const onFill = () => {
    form.setFieldsValue({
      uri: "https://taobao.com/",
    });
  }; */

  const validateAndContinue = async () => {
    files.forEach(element => uris.push(element.path));
    form.setFieldsValue({ userURIs: uris });
    form.setFieldsValue({ totalSupply: files.length });
    const values = form.getFieldsValue();
    // TODO: run validation and then continue

    setPgData(values);
    onNextStep();
  };

  const isERC20 = pgType === 1;

  return (
    <div>
      <div className="text-center">
        <h1 className="text-2xl font-medium">
          Provide details for your {isERC20 ? "ERC-20" : "ERC-721"} token contract?
        </h1>
        <div className="my-2">Some more description on what details are needed to launch the token.</div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center mx-auto mt-16 max-w-lg">
        <Form
          form={form}
          className="w-full flex flex-col items-center mx-auto justify-center"
          layout="vertical"
          initialValues={{
            requiredMarkValue: requiredMark,
            name: pgData.name,
            symbol: pgData.symbol,
            totalSupply: pgData.totalSupply,
            startPrice: pgData.startPrice,
            decimal: pgData.decimal || 18,
            baseURI: pgData.baseURI,
            owner: pgData.owner,
            userURIs: pgData.uris,
            inflation: pgData.inflation,
          }}
          size="large"
          onValuesChange={onRequiredTypeChange}
          requiredMark={requiredMark}
        >
          <Form.Item label="Project Name" name="name" required tooltip="This is a required field" className="w-full">
            <Input placeholder="Simple Public Goods Project" />
          </Form.Item>
          <Form.Item label="Symbol" name="symbol" tooltip="Tooltip with customize icon" className="w-full">
            <Input placeholder="SPGP" />
          </Form.Item>

          {isERC20 ? (
            <Form.Item label="Token Decimal" name="decimal" required tooltip="Decimal Info" className="w-full">
              <Input type="number" placeholder="18" />
            </Form.Item>
          ) : (
            <>
              <Form
                size="large"
                className="w-full flex flex-col items-center mx-auto justify-center"
                layout="vertical"
                getLinks={getLinks}
                autoComplete="off"
              >
                <Form.Item name="uri" label="CID">
                  <Input onChange={e => setUserURI2(e.target.value)} placeholder="input placeholder" />
                </Form.Item>
                <Form.Item>
                  <Button onClick={getLinks}>Submit</Button>
                </Form.Item>
              </Form>
              <div className="text-center"></div>
              <Form.Item
                label="Total Supply"
                name="totalSupply"
                required
                tooltip="Equal to # of JSONs"
                className="w-full"
                display="none"
              >
                {files.length}
              </Form.Item>
              <Form.Item label="Token uris" name="userURIs" required tooltip="" className="w-full">
                {files.length}
              </Form.Item>
              {/* <Form.Item label="Base URI" name="baseURI" required tooltip="Base URI info" className="w-full">
                {CID && (
                  <div className="flex flex-1 flex-row mb-2">
                    <div className="truncate max-w-sm">
                      <a href={CID} target="_blank">
                        {CID}
                      </a>
                    </div>
                  </div>
                )}
              </Form.Item> */}
              <Form.Item label="Owner Address" name="owner" required tooltip="Address of Owner" className="w-full">
                <Input placeholder="0x..." />
              </Form.Item>
              <Form.Item
                label="Start mint price"
                name="startPrice"
                required
                tooltip="Start price info"
                className="w-full"
              >
                <Input type="number" placeholder="0.03" addonAfter={<span>Ξ</span>} />
              </Form.Item>
              <Form.Item
                label="Price inflation rate"
                name="inflation"
                required
                tooltip="Price inflation rate info"
                className="w-full"
              >
                <Input type="number" placeholder="3" min={1} max={100} addonAfter={<span>%</span>} />
              </Form.Item>
            </>
          )}
        </Form>

        <div className="mt-20 flex flex-1 items-center justify-center flex-row">
          <Button size="large" onClick={onPreviousStep}>
            Go Back
          </Button>
          <div className="w-4" />
          <Button type="primary" size="large" onClick={validateAndContinue}>
            Confirm token details
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Details;
