import React, { useState, useEffect } from "react";
import { Button, Form, Input } from "antd";
import { NFTStorage } from "nft.storage";
import { useDropzone } from "react-dropzone";

function Details({ onPreviousStep, onNextStep, pgType, pgData, setPgData, handleDeployment, ...props }) {
  const [files, setFiles] = useState([]);
  const [CID, setCID] = useState("");
  const [form] = Form.useForm();
  const [requiredMark, setRequiredMarkType] = useState("optional");

  let uris = [];

  const onRequiredTypeChange = ({ requiredMarkValue }) => {
    setRequiredMarkType(requiredMarkValue);
  };

  const validateAndContinue = async () => {
    files.forEach(element => uris.push(element.path));
    //console.log(uris);
    form.setFieldsValue({ userURIs: uris });
    form.setFieldsValue({ totalSupply: files.length });
    form.setFieldsValue({ baseURI: CID });
    const values = form.getFieldsValue();
    // TODO: run validation and then continue

    setPgData(values);
    onNextStep();
  };

  const isERC20 = pgType === 1;

  const client = new NFTStorage({
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDllRjc3OGNjQ0VCOEQ2NTg2ZDllRjYxYTEwNTk1Y0QyNDUwMGU5YUQiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYzNTQ4MDM3MDAxMywibmFtZSI6ImRkIn0.Cy-vLvDjMBUGw8vuXTcM7Lv0Lj07aPx_S_LpHwRnV6c",
    endpoint: "https://api.nft.storage",
  });

  function Dropzone(props) {
    const { getRootProps, getInputProps, open } = useDropzone({
      accept: ".json",
      maxFiles: 10000,
      onDrop: acceptedFiles => {
        setFiles(
          acceptedFiles.map(file =>
            Object.assign(file, {
              pinblob: pintoStorage(acceptedFiles),
              //filelist: createList(...acceptedFiles)
            }),
          ),
        );
      },
    });

    return (
      <div {...getRootProps({ className: "dropzone" })}>
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          <Button type="button" onClick={open}>
            Open File Explorer
          </Button>
        </div>
      </div>
    );
  }

  <Dropzone />;

  async function pintoStorage(file) {
    var cid = await client.storeDirectory(file);
    setCID(`https://ipfs.io/ipfs/${cid}/`);

    //let filenames = file.path
    //filenames.map(file => file.path)
    //console.log(filenames)

    return cid;
  }

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
              <div className="text-center">
                <h1 className="text-2xl font-medium">Upload jsons</h1>
              </div>
              <Dropzone files={files} setFiles={setFiles} />
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
              <Form.Item label="Base URI" name="baseURI" required tooltip="Base URI info" className="w-full">
                {CID && (
                  <div className="flex flex-1 flex-row mb-2">
                    <div className="truncate max-w-sm">
                      <a href={CID} target="_blank">
                        {CID}
                      </a>
                    </div>
                  </div>
                )}
              </Form.Item>
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
                <Input type="number" placeholder="3" min={0} max={100} addonAfter={<span>%</span>} />
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
