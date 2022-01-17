import { Button, Col, Menu, Row } from "antd";
import "antd/dist/antd.css";
import { useBalance, useContractLoader, useGasPrice, useOnBlock, useUserProviderAndSigner } from "eth-hooks";
import {
  ExportOutlined,
  ForkOutlined,
  ExperimentOutlined,
  ReconciliationOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import React, { useCallback, useEffect, useState, setRoute } from "react";
import { Link, Route, Switch, useLocation } from "react-router-dom";
import {
  Account,
  Address,
  Contract,
  Faucet,
  GasGauge,
  Header,
  Ramp,
  ThemeSwitch,
  NetworkDisplay,
  FaucetHint,
  NetworkSwitch,
} from "./components";
import { NETWORKS, ALCHEMY_KEY } from "./constants";
import externalContracts from "./contracts/external_contracts";
// contracts
import deployedContracts from "./contracts/hardhat_contracts.json";
import { Transactor, Web3ModalSetup } from "./helpers";
import { Home, ViewNFT, WhalesUI, Checkout, Funding } from "./views";
import { useStaticJsonRPC, useLocalStorage } from "./hooks";

const { ethers } = require("ethers");
/*
    Welcome to 🏗 scaffold-eth !

    Code:
    https://github.com/scaffold-eth/scaffold-eth

    Support:
    https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA
    or DM @austingriffith on twitter or telegram

    You should get your own Alchemy.com & Infura.io ID and put it in `constants.js`
    (this is your connection to the main Ethereum network for ENS etc.)


    🌏 EXTERNAL CONTRACTS:
    You can also bring in contract artifacts in `constants.js`
    (and then use the `useExternalContractLoader()` hook!)
*/

// 😬 Sorry for all the console logging
const DEBUG = true;
const NETWORKCHECK = true;

const web3Modal = Web3ModalSetup();

// 🛰 providers
const providers = [
  "https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406",
  `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
  "https://rpc.scaffoldeth.io:48544",
];

function App(props) {
  // specify all the chains your app is available on. Eg: ['localhost', 'mainnet', ...otherNetworks ]
  // reference './constants.js' for other networks
  const networkOptions = ["localhost", "mainnet", "rinkeby"];

  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();
  const [selectedNetwork, setSelectedNetwork] = useState(networkOptions[0]);
  const location = useLocation();

  /// 📡 What chain are your contracts deployed to?
  const targetNetwork = NETWORKS[selectedNetwork]; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

  // 🔭 block explorer URL
  const blockExplorer = targetNetwork.blockExplorer;

  // load all your providers
  const localProvider = useStaticJsonRPC([
    process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : targetNetwork.rpcUrl,
  ]);
  const mainnetProvider = useStaticJsonRPC(providers);

  if (DEBUG) console.log(`Using ${selectedNetwork} network`);

  // 🛰 providers
  if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangeEthPrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast");
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProviderAndSigner = useUserProviderAndSigner(injectedProvider, localProvider);
  const userSigner = userProviderAndSigner.signer;
  const userProvider = userProviderAndSigner.provider;

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        setAddress(newAddress);
      }
    }
    getAddress();
  }, [userSigner]);

  const [route, setRoute] = useState();
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  // You can warn the user if you would like them to be on a specific network
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId =
    userSigner && userSigner.provider && userSigner.provider._network && userSigner.provider._network.chainId;

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userSigner, gasPrice);

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);

  // Just plug in different 🛰 providers to get your balance on different chains:
  const yourMainnetBalance = useBalance(mainnetProvider, address);

  // const contractConfig = useContractConfig();

  const contractConfig = { deployedContracts: deployedContracts || {}, externalContracts: externalContracts || {} };

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider, contractConfig);

  // If you want to make 🔐 write transactions to your contracts, use the userSigner:
  const writeContracts = useContractLoader(userSigner, contractConfig, localChainId);

  // If you want to call a function on a new block
  useOnBlock(mainnetProvider, () => {
    console.log(`⛓ A new mainnet block is here: ${mainnetProvider._lastBlockNumber}`);
  });

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new ethers.providers.Web3Provider(provider));

    provider.on("chainChanged", chainId => {
      console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    provider.on("accountsChanged", () => {
      console.log(`account changed!`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      logoutOfWeb3Modal();
    });
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const faucetAvailable = localProvider && localProvider.connection && targetNetwork.name.indexOf("local") !== -1;

  const [cart, setCart] = useLocalStorage("buidlguidlcart", [], 12000000); //12000000 ms timeout? idk
  //console.log("cart",cart)
  //console.log("route",route)

  let displayCart = [];
  if (cart && cart.length > 0) {
    for (let c in cart) {
      console.log("CART ITEM", c, cart[c]);
      if (!cart[c].streamAddress) {
        displayCart.push(
          <div key={c} style={{ padding: 22, border: "1px solid #dddddd", borderRadius: 8 }}>
            <div style={{ marginLeft: 32 }}>
              <div style={{ float: "right", zIndex: 2 }}>
                <Button
                  borderless={true}
                  onClick={() => {
                    console.log("REMOVE ", c, cart[c]);
                    let update = [];
                    for (let x in cart) {
                      if (cart[c].id != cart[x].id) {
                        update.push(cart[x]);
                      }
                    }
                    console.log("update", update);
                    setCart(update);
                  }}
                >
                  x
                </Button>
              </div>
              <div style={{ fontSize: 18, marginLeft: "auto" }}>{cart[c].name}</div>
            </div>
          </div>,
        );
      } else {
        displayCart.push(
          <div key={c} style={{ padding: 16, border: "1px solid #dddddd", borderRadius: 8 }}>
            <div style={{ marginLeft: 32 }}>
              <div style={{ float: "right", zIndex: 2 }}>
                <Button
                  onClick={() => {
                    console.log("REMOVE ", c, cart[c]);
                    let update = [];
                    for (let x in cart) {
                      if (cart[c].id != cart[x].id) {
                        update.push(cart[x]);
                      }
                    }
                    console.log("update", update);
                    setCart(update);
                  }}
                >
                  x
                </Button>
              </div>
              <Address
                hideCopy={true}
                punkBlockie={true}
                fontSize={18}
                address={cart[c].address}
                ensProvider={mainnetProvider}
                blockExplorer={blockExplorer}
              />
            </div>
          </div>,
        );
      }
    }
  }

  return (
    <div className="App">
      {/* ✏️ Edit the header and change the title to your project name */}
      <Header />
      <NetworkDisplay
        NETWORKCHECK={NETWORKCHECK}
        localChainId={localChainId}
        selectedChainId={selectedChainId}
        targetNetwork={targetNetwork}
      />
      {cart && cart.length > 0 && route != "/funding" ? (
        <Link
          onClick={() => {
            setRoute("/funding");
          }}
          style={{ color: "#FFF" }}
          to="/funding"
        >
          <div
            className="main fade-in"
            style={{
              zIndex: 1111,
              position: "fixed",
              right: 16,
              bottom: 0,
              backgroundColor: "#1890ff",
              borderRadius: "8px 8px 0px 0px",
              padding: 16,
              fontSize: 32,
            }}
          >
            <ShoppingCartOutlined /> Checkout [{cart.length} item{cart.length == 1 ? "" : "s"}]
          </div>
        </Link>
      ) : (
        ""
      )}
      <Menu style={{ textAlign: "center" }} selectedKeys={[location.pathname]} mode="horizontal">
        <Menu.Item key="/">
          <Link to="/">Home</Link>
        </Menu.Item>
        <Menu.Item key="/debug">
          <Link to="/debug">Debug Contracts</Link>
        </Menu.Item>
        <Menu.Item key="/funding">
          <Link to="/funding">Funding (cart)</Link>
        </Menu.Item>
      </Menu>

      <Switch>
        <Route exact path="/">
          {/* pass in any web3 props to this Home component. For example, yourLocalBalance */}
          <Home
            cart={cart}
            setCart={setCart}
            displayCart={displayCart}
            tx={tx}
            address={address}
            localProvider={localProvider}
            readContracts={readContracts}
            writeContracts={writeContracts}
            mainnetProvider={mainnetProvider}
            yourLocalBalance={yourLocalBalance}
          />
        </Route>
        <Route exact path="/debug">
          <Contract
            name="PGDeployer"
            price={price}
            address={address}
            signer={userSigner}
            provider={localProvider}
            blockExplorer={blockExplorer}
            contractConfig={contractConfig}
          />
        </Route>
        <Route path="/view/:nft">
          <ViewNFT
            tx={tx}
            address={address}
            userSigner={userSigner}
            localProvider={localProvider}
            userSigner={userSigner}
            localChainId={localChainId}
            readContracts={readContracts}
            userProvider={userProvider}
          />
        </Route>
        <Route path="/funding">
          <Funding
            setRoute={setRoute}
            cart={cart}
            setCart={setCart}
            displayCart={displayCart}
            tx={tx}
            address={address}
            localProvider={localProvider}
            readContracts={readContracts}
            writeContracts={writeContracts}
            mainnetProvider={mainnetProvider}
            yourLocalBalance={yourLocalBalance}
          />
        </Route>
        <Route path="/whale/:nft">
          <WhalesUI
            address={address}
            tx={tx}
            userSigner={userSigner}
            localProvider={localProvider}
            localChainId={localChainId}
            readContracts={readContracts}
          />
        </Route>
      </Switch>

      <ThemeSwitch />

      {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
      <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
        <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
          <div style={{ marginRight: 20 }}>
            {/* <NetworkSwitch
              networkOptions={networkOptions}
              selectedNetwork={selectedNetwork}
              setSelectedNetwork={setSelectedNetwork}
            /> */}
          </div>
          <Account
            address={address}
            localProvider={localProvider}
            userSigner={userSigner}
            mainnetProvider={mainnetProvider}
            price={price}
            web3Modal={web3Modal}
            loadWeb3Modal={loadWeb3Modal}
            logoutOfWeb3Modal={logoutOfWeb3Modal}
            blockExplorer={blockExplorer}
          />
        </div>
        <FaucetHint localProvider={localProvider} targetNetwork={targetNetwork} address={address} />
      </div>

      {/* 🗺 Extra UI like gas price, eth price, faucet, and support: */}
      <div style={{ position: "fixed", textAlign: "left", left: 0, bottom: 20, padding: 10 }}>
        <Row align="middle" gutter={[4, 4]}>
          <Col span={8}>
            <Ramp price={price} address={address} networks={NETWORKS} />
          </Col>

          <Col span={8} style={{ textAlign: "center", opacity: 0.8 }}>
            <GasGauge gasPrice={gasPrice} />
          </Col>
          <Col span={8} style={{ textAlign: "center", opacity: 1 }}>
            <Button
              onClick={() => {
                window.open("https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA");
              }}
              size="large"
              shape="round"
            >
              <span style={{ marginRight: 8 }} role="img" aria-label="support">
                💬
              </span>
              Support
            </Button>
          </Col>
        </Row>

        <Row align="middle" gutter={[4, 4]}>
          <Col span={24}>
            {
              /*  if the local provider has a signer, let's show the faucet:  */
              faucetAvailable ? (
                <Faucet localProvider={localProvider} price={price} ensProvider={mainnetProvider} />
              ) : (
                ""
              )
            }
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default App;
