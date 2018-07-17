module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  ropsten: {
    provider: new HDWalletProvider(mnemonic, "https://ropsten.infura.io/Fk6TkgXxOYX9dEbI4krn/"),
    network_id: '3',
  }
};
