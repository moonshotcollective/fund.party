import React from "react";
import { Checkout } from ".";

const Funding = ({
  setRoute,
  cart,
  setCart,
  displayCart,
  readContracts,
  address,
  writeContracts,
  tx,
  userSigner,
  localProvider,
}) => {
  return (
    <div style={{ marginTop: 64, borderBottom: "1px solid #eeeeee", paddingBottom: 64, marginBottom: 64 }}>
      <div style={{ fontSize: 20, opacity: 0.777, fontWeight: "normal" }}>
        <Checkout
          setRoute={setRoute}
          cart={cart}
          setCart={setCart}
          displayCart={displayCart}
          tx={tx}
          writeContracts={writeContracts}
          mainnetProvider={localProvider}
        />
      </div>
    </div>
  );
};

export default Funding;
