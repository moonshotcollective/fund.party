import React, { useState, useEffect } from "react";
import { Button, Form, Input } from "antd";
import { NFTStorage } from "nft.storage";
import { useDropzone } from "react-dropzone";

function Details({
  onPreviousStep,
  onNextStep,
  pgType,
  pgData,
  setPgData,
  setuFiles,
  setuCID,
  handleDeployment,
  ...props
}) {
  const [files, setFiles] = useState([]);
  const [CID, setCID] = useState("");
  const [form] = Form.useForm();
  const [requiredMark, setRequiredMarkType] = useState("optional");

  const onRequiredTypeChange = ({ requiredMarkValue }) => {
    setRequiredMarkType(requiredMarkValue);
  };

  const validateAndContinue = async () => {
    const values = form.getFieldsValue();
    form.setFieldsValue({ baseURI: CID });
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
    const baseStyle = {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "20px",
      borderWidth: 2,
      borderRadius: 2,
      borderColor: "#eeeeee",
      borderStyle: "dashed",
      backgroundColor: "#fafafa",
      color: "#bdbdbd",
      outline: "none",
      transition: "border .24s ease-in-out",
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      accept: ".json",
      maxFiles: 10000,
      onDrop: acceptedFiles => {
        setFiles(
          acceptedFiles.map(file =>
            Object.assign(file, {
              preview: URL.createObjectURL(file),
              pinblob: pintoStorage(acceptedFiles),
              //filelist: createList(...acceptedFiles)
            }),
          ),
        );
      },
    });

    useEffect(
      () => () => {
        // Make sure to revoke the data uris to avoid memory leaks
        files.forEach(file => URL.revokeObjectURL(file.preview));
      },
      [files],
    );

    return (
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {isDragActive ? <p>Drop the files here ...</p> : <p>Drag 'n' drop some files here, or click to select files</p>}
      </div>
    );
  }

  <Dropzone />;

  async function pintoStorage(file) {
    var cid = await client.storeDirectory(file);
    setuCID(`https://ipfs.io/ipfs/${cid}/`);
    setCID(`https://ipfs.io/ipfs/${cid}/`);
    console.log(cid);

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
            decimal: pgData.decimal || 18,
            baseURI: pgData.baseURI,
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
              <Form.Item label="Total Supply" name="supply" required tooltip="Equal to # of JSONs" className="w-full">
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
