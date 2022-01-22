import React, { useState, useEffect } from "react";
import { Button, Form, Input, InputNumber, Space, Spin } from "antd";
import { create, urlSource } from "ipfs-http-client";
import axios from "axios";

//phunk CID QmQcoXyYKokyBHzN3yxDYgPP25cmZkm5Gqp5bzZsTDF7cd

const erc721Fields = ["inflation", "name", "owner", "preview", "startPrice", "symbol", "cid"];

function Details({ onPreviousStep, onNextStep, pgType, pgData, setPgData, handleDeployment, ...props }) {
  const [form] = Form.useForm();
  const [validness, setValidness] = useState(false);

  const [previewDetails, setPreviewDetails] = useState({
    preview: "",
    valid: false,
  });
  const [cidDetails, setCidDetails] = useState({
    cid: "",
    valid: false,
    loading: false,
    userURIs: [],
    baseURI: "",
    totalSupply: "",
  });

  const validateAndContinue = async () => {
    const values = form.getFieldsValue();

    setPgData({
      ...values,
      baseURI: cidDetails.baseURI,
      userURIs: cidDetails.userURIs,
      totalSupply: cidDetails.totalSupply,
    });

    onNextStep();
  };

  const isERC20 = pgType === 1;

  const checkValidness = () => {
    if (isERC20) return true;

    const values = form.getFieldsValue();
    const errors = form.getFieldsError();

    for (const error of errors) {
      if (error.errors.length > 0) {
        return false;
      }
    }
    for (const field of erc721Fields) {
      if (values[field] === undefined) {
        return false;
      }
    }
    if (!previewDetails.valid) return false;
    if (!cidDetails.valid) return false;

    return true;
  };

  useEffect(() => {
    const checkPreviewImage = async () => {
      if (!previewDetails.preview) {
        return setPreviewDetails(old => ({ ...old, valid: false }));
      }

      if (form.getFieldError("preview").length > 0) {
        return setPreviewDetails(old => ({ ...old, valid: false }));
      }
      try {
        const data = await axios.get(previewDetails.preview);
        console.log("fetched image", data.headers);
        if (
          data.headers["content-type"].includes("png") ||
          data.headers["content-type"].includes("jpg") ||
          data.headers["content-type"].includes("jpeg")
        ) {
          return setPreviewDetails(old => ({ ...old, valid: true }));
        }
        setPreviewDetails(old => ({ ...old, valid: false }));
      } catch {
        setPreviewDetails(old => ({ ...old, valid: false }));
      }
    };

    checkPreviewImage();
  }, [previewDetails.preview]);

  useEffect(() => {
    const checkCid = async () => {
      if (cidDetails.cid.length != 46) {
        return setCidDetails(old => ({ ...old, valid: false }));
      }
      setCidDetails(old => ({ ...old, loading: true }));

      const url = "https://dweb.link/api/v0";
      const ipfs = create({ url });

      const links = [];
      try {
        for await (const link of ipfs.ls(cidDetails.cid)) {
          links.push(link);
        }
      } catch {
        return setCidDetails(old => ({ ...old, valid: false, loading: false }));
      }
      const fileNames = [];

      for (let x = 0; x < links.length; x++) {
        fileNames.push(links[x].name);
      }

      setCidDetails(old => ({
        ...old,
        valid: true,
        loading: false,
        userURIs: fileNames,
        totalSupply: fileNames.length.toString(),
        baseURI: `http://ipfs.io/ipfs/${cidDetails.cid}/`,
      }));
    };

    checkCid();
  }, [cidDetails.cid]);

  useEffect(() => {
    setValidness(checkValidness());
  }, [cidDetails, previewDetails]);

  return (
    <div>
      <div className="text-center">
        <h1 className="text-2xl font-medium">
          Provide details for your {isERC20 ? "ERC-20" : "ERC-721"} token contract?
        </h1>
        <div className="my-2">Some more description on what details are needed to launch the token.</div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center mx-auto mt-10 max-w-lg">
        <Form
          form={form}
          onChange={() => {
            setValidness(checkValidness());
          }}
          className="w-full flex flex-col items-center mx-auto justify-center"
          layout="vertical"
          initialValues={{
            name: pgData.name,
            symbol: pgData.symbol,
            totalSupply: pgData.totalSupply,
            startPrice: pgData.startPrice,
            decimal: pgData.decimal || 18,
            baseURI: pgData.baseURI,
            owner: pgData.owner,
            userURIs: pgData.uris,
            inflation: pgData.inflation,
            preview: pgData.preview,
            cid: pgData.cid,
          }}
          size="large"
        >
          <Form.Item
            label="Project name"
            name="name"
            required
            tooltip="Name of your public good"
            className="w-full"
            rules={[{ required: true }, { type: "string", min: 6 }]}
          >
            <Input placeholder="Simple Public Goods Project" />
          </Form.Item>
          <Form.Item
            label="Symbol"
            name="symbol"
            tooltip="Symbol is a short name for your public good's token"
            className="w-full"
            required
            rules={[{ required: true }, { type: "string", min: 3 }]}
          >
            <Input placeholder="SPGP" />
          </Form.Item>

          {isERC20 ? (
            <Form.Item label="Token Decimal" name="decimal" required tooltip="Decimal Info" className="w-full">
              <Input type="number" placeholder="18" />
            </Form.Item>
          ) : (
            <>
              <Form.Item
                label="Owner address"
                name="owner"
                required
                tooltip="Address of Owner"
                className="w-full"
                rules={[{ required: true }, { type: "string", len: 42 }]}
              >
                <Input placeholder="0x..." />
              </Form.Item>
              <Form.Item
                label="Start mint price"
                name="startPrice"
                required
                tooltip="Start price in ETH"
                className="w-full"
                rules={[{ type: "number", min: 0, max: 100 }]}
              >
                <InputNumber placeholder="0.03Ξ" style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                label="Price inflation rate"
                name="inflation"
                required
                tooltip="Price inflation rate in percents"
                className="w-full"
                rules={[{ type: "number", min: 0, max: 100 }]}
              >
                <InputNumber placeholder="3%" style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item
                label="Preview image"
                name="preview"
                required
                tooltip="Preview image for your ERC721 collection (PNG or JPEG)"
                className="block w-full"
                rules={[{ required: true }, { type: "url", warningOnly: true }, { type: "string", min: 6 }]}
              >
                <Input
                  placeholder="https://imgur.com/nft.png"
                  className="block"
                  onChange={e =>
                    setPreviewDetails({
                      preview: e.target.value,
                      valid: true,
                    })
                  }
                />
              </Form.Item>
              {previewDetails.valid ? <img src={previewDetails.preview} className="mb-5" alt="Preview" /> : null}
              <Form.Item
                className="w-full"
                name="cid"
                label="CID"
                required
                tooltip="IPFS CID to fetch information about your collection"
                rules={[{ required: true, len: 46 }]}
              >
                <Input
                  onChange={e => {
                    setCidDetails(old => ({ ...old, cid: e.target.value }));
                  }}
                  placeholder="QmQcoXyYKokyBHzN3yd..."
                />
              </Form.Item>
              {cidDetails.valid && (
                <div className="mr-auto p-0 m-0" style={{ marginTop: "-10px" }}>
                  <p className="p-0 m-0">Total supply: {cidDetails.totalSupply}</p>
                  <p className="p-0 m-0">
                    Base URI:{" "}
                    <a href={cidDetails.baseURI} target="_blank">
                      Click
                    </a>
                  </p>
                </div>
              )}
              {cidDetails.loading && <Spin />}
            </>
          )}
        </Form>

        <div className="mt-10 flex flex-1 items-center justify-center flex-row">
          <Button size="large" onClick={onPreviousStep}>
            Go Back
          </Button>
          <div className="w-4" />
          <Button type="primary" size="large" onClick={validateAndContinue} htmlType="submit" disabled={!validness}>
            Confirm token details
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Details;
