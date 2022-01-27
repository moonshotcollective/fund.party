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
    <div style={{ marginTop: 64, paddingBottom: 64, marginBottom: 64 }}>
      <div>
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
