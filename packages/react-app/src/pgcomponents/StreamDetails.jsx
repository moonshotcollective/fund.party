import React, { useState, useEffect } from "react";
import { Button, Form, Input, InputNumber, Space, Spin } from "antd";
import { create, urlSource } from "ipfs-http-client";
import axios from "axios";

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
    totalSupply: "",
  });

  const validateAndContinue = async () => {
    const values = form.getFieldsValue();

    setPgData({
      ...values,
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

  /* useEffect(() => {
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
  }, [cidDetails.cid]); */

  useEffect(() => {
    setValidness(checkValidness());
  }, [cidDetails, previewDetails]);

  return (
    <div>
      <div className="text-center">
        <h1 className="text-2xl font-medium">Provide details for your stream.</h1>
        <div className="my-2">Some more description on what details are needed to launch.</div>
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
            owner: pgData.owner,
            admins: pgData.admins,
            preview: pgData.preview,
          }}
          size="large"
        >
          <Form.Item
            label="Organization name"
            name="name"
            required
            tooltip="Name of your public good"
            className="w-full"
            rules={[{ required: true }, { type: "string", min: 6 }]}
          >
            <Input placeholder="myDAO" />
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
                label="Admin addresses"
                name="admins"
                required
                tooltip="Comma separated list of addresses"
                className="w-full"
                rules={[{ required: true }, { type: "string" }]}
              >
                <Input placeholder="0xaddress,0xaddress,etc.. no trailing commas" />
              </Form.Item>
              <Form.Item
                label="Preview image - (1100 x 400px) "
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
          <Button
            type="primary"
            size="large"
            onClick={validateAndContinue}
            htmlType="submit" /* disabled={!validness} */
          >
            Confirm token details
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Details;
