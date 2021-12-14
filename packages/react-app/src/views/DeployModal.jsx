import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import { Modal, Steps } from "antd";
import { X } from "react-feather";
import { Deployer, Intro, TokenDetails, TokenOptions } from "../pgcomponents";

const steps = [
  { title: "Intro", Component: Intro },
  { title: "Token Type", Component: TokenOptions },
  { title: "Token Details", Component: TokenDetails },
  { title: "Launch", Component: Deployer },
];

function DeployModal({ tx, writeContracts, address, show, onCancel }) {
  const [activeStep, setActiveStep] = useState(0);
  const [pgType, setPgType] = useState(0);
  const [pgData, setPgData] = useState({});
  const [uFiles, setuFiles] = useState([]);
  const [uCID, setuCID] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);

  const reset = () => {
    onCancel && onCancel();
    setActiveStep(0);
    setPgType(0);
    setPgData({});
  };

  const onNextStep = () => {
    const nextStep = activeStep + 1;

    if (nextStep < steps.length) {
      setActiveStep(nextStep);
    }

    if (isDeploying) {
      reset();
    }
  };

  const onPreviousStep = () => {
    const previousStep = activeStep - 1;

    if (previousStep >= 0) {
      setActiveStep(previousStep);
    }
  };

  const handleCancel = args => {
    onCancel(args);

    if (activeStep === steps.length - 1) {
      reset();
    }
  };

  const ActiveStepView = steps[activeStep].Component;

  return (
    <Modal
      centered
      visible={show}
      footer={null}
      width={700}
      onCancel={handleCancel}
      closeIcon={
        <span className="flex items-center justify-center h-full">
          <X />
        </span>
      }
    >
      <div className="w-full flex flex-col items-center">
        <div className="mb-16 w-full">
          <Steps progressDot current={activeStep}>
            {steps.map(s => (
              <Steps.Step title={s.title} key={s.title} />
            ))}
          </Steps>
        </div>
        <ActiveStepView
          tx={tx}
          reset={reset}
          pgType={pgType}
          pgData={pgData}
          uFiles={uFiles}
          uCID={uCID}
          address={address}
          setPgType={setPgType}
          setPgData={setPgData}
          setuFiles={setuFiles}
          setuCID={setuCID}
          onNextStep={onNextStep}
          isDeploying={isDeploying}
          setIsDeploying={setIsDeploying}
          onPreviousStep={onPreviousStep}
          writeContracts={writeContracts}
        />
      </div>
    </Modal>
  );
}

export default DeployModal;
