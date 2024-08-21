const { ether, EVM_REVERT_BALANCE } = require("./helpers");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const Token = artifacts.require("./Token");

chai.use(chaiAsPromised);
chai.should();

contract("Token", ([deployer, receiver, exchange]) => {
  const name = "DiBa Token";
  const symbol = "DiBa";
  const decimals = "18";
  const totalSupply = ether(1000000).toString();
  let token;

  beforeEach(async () => {
    token = await Token.new();
  });

  describe("deployment", () => {
    it("tracks the name", async () => {
      const result = await token.name();
      result.should.equal(name);
    });

    it("tracks the symbol", async () => {
      const result = await token.symbol();
      result.should.equal(symbol);
    });

    it("tracks the decimals", async () => {
      const result = await token.decimals();
      result.toString().should.equal(decimals);
    });

    it("tracks the total supply", async () => {
      const result = await token.totalSupply();
      result.toString().should.equal(totalSupply.toString());
    });

    it("assigns the total supply to the deployer", async () => {
      const result = await token.balanceOf(deployer);
      result.toString().should.equal(totalSupply.toString());
    });
  });

  describe("sending tokens", () => {
    let result;
    let amount;

    describe("success", async () => {
      beforeEach(async () => {
        amount = ether(100);
        result = await token.transfer(receiver, amount, { from: deployer });
      });

      it("transfers token balances", async () => {
        let balanceOf;
        balanceOf = await token.balanceOf(deployer);
        balanceOf.toString().should.equal(ether(999900).toString());
        balanceOf = await token.balanceOf(receiver);
        balanceOf.toString().should.equal(amount.toString());
      });

      it("emits a Transfer event", async () => {
        const log = result.logs[0];
        log.event.should.equal("Transfer");
        const event = log.args;
        event.from.toString().should.equal(deployer, "from is correct");
        event.to.should.equal(receiver, "to is correct");
        event.value
          .toString()
          .should.equal(amount.toString(), "value is to correct");
      });
    });

    describe("rejects insufficient balances", async () => {
      it("rejects insufficient balances", async () => {
        let invalidAmount;
        invalidAmount = ether(100000000);

        // Greater than total supply
        await token
          .transfer(receiver, invalidAmount, { from: deployer })
          .should.be.rejectedWith(EVM_REVERT_BALANCE);

        // Transfer tokens from de receiver to the deployer
        invalidAmount = ether(10); // recipient has no tokens
        await token
          .transfer(deployer, invalidAmount, { from: receiver })
          .should.be.rejectedWith(EVM_REVERT_BALANCE);
      });

      it("rejects invalid recipients", async () => {
        await token.transfer(0x0, amount, { from: deployer }).should.be
          .rejected;
      });
    });
  });

  describe("approving tokens", () => {
    let result;
    let amount;

    beforeEach(async () => {
      amount = ether(100);
      result = await token.approve(exchange, amount, { from: deployer });
    });

    describe("success", () => {
      it("allocates an allowance for delegated token spending on exchange", async () => {
        const allowance = await token.allowance(deployer, exchange);
        allowance.toString().should.equal(amount.toString());
      });

      it("emits an Approval event", () => {
        const log = result.logs[0];
        log.event.should.eq("Approval");
        const event = log.args;
        event.owner.toString().should.equal(deployer, "owner is correct");
        event.spender.should.equal(exchange, "spender is correct");
        event.value
          .toString()
          .should.equal(amount.toString(), "value is correct");
      });
    });

    describe("failure", () => {
      it("rejects invalid spenders", () => {
        token.approve(0x0, amount, { from: deployer }).should.be.rejected;
      });
    });
  });

  describe("delegated token transfers", () => {
    let result;
    let amount;

    beforeEach(async () => {
      amount = ether(100);
      await token.approve(exchange, amount, { from: deployer });
    });

    describe("success", () => {
      beforeEach(async () => {
        result = await token.transferFrom(deployer, receiver, amount, {
          from: exchange,
        });
      });

      it("transfers token balances", async () => {
        let balanceOf;
        balanceOf = await token.balanceOf(deployer);
        balanceOf.toString().should.equal(ether(999900).toString());
        balanceOf = await token.balanceOf(receiver);
        balanceOf.toString().should.equal(ether(100).toString());
      });

      it("resets the allowance", async () => {
        const allowance = await token.allowance(deployer, exchange);
        allowance.toString().should.equal("0");
      });

      it("emits a Transfer event", () => {
        const log = result.logs[0];
        log.event.should.eq("Transfer");
        const event = log.args;
        event.from.toString().should.equal(deployer, "from is correct");
        event.to.should.equal(receiver, "to is correct");
        event.value
          .toString()
          .should.equal(amount.toString(), "value is correct");
      });
    });

    describe("failure", () => {
      it("rejects insufficient amounts", () => {
        // Attempt transfer too many tokens
        const invalidAmount = ether(100000000);
        token
          .transferFrom(deployer, receiver, invalidAmount, { from: exchange })
          .should.be.rejectedWith(EVM_REVERT_BALANCE);
      });

      xit("rejects invalid recipients", async () => {
        await token.transferFrom(deployer, 0x0, amount, { from: exchange })
          .should.be.rejected;
      });
    });
  });
});
