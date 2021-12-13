import React, { useState, useEffect } from "react";
import { NFTStorage } from "nft.storage";
import { useDropzone } from "react-dropzone";

function Uploader() {
  const [files, setFiles] = useState([]);

  const client = new NFTStorage({
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDllRjc3OGNjQ0VCOEQ2NTg2ZDllRjYxYTEwNTk1Y0QyNDUwMGU5YUQiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYzNTQ4MDM3MDAxMywibmFtZSI6ImRkIn0.Cy-vLvDjMBUGw8vuXTcM7Lv0Lj07aPx_S_LpHwRnV6c",
    endpoint: "https://api.nft.storage",
  });

  function Previews() {
    const { getRootProps, getInputProps } = useDropzone({
      accept: ".json",
      maxFiles: 1000,
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
      <section className="container">
        <div {...getRootProps({ className: "dropzone" })}>
          <input {...getInputProps()} />
          <p>Click here to upload jsons</p>
        </div>
      </section>
    );
  }

  <Previews />;

  async function pintoStorage(file) {
    var cid = await client.storeDirectory(file);
    console.log(cid);

    //let filenames = file.path
    //filenames.map(file => file.path)
    //console.log(filenames)

    return cid;
  }

  return (
    <div className="text-center">
      <Previews files={files} setFiles={setFiles} />
      <div>
        Files :
        {files.map(file => (
          <div>{file.path} </div>
        ))}
      </div>
    </div>
  );
}

export default Uploader;
