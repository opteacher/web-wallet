const cfg = require("../config/db").redis;
const redis = require("../databases/redis");
const axios = require("axios");
const walletCfg = require("../config/wallet");
const serverCfg = require("../config/server");
const assetsSvc = require("../services/assets");
const withdrawSvc = require("../services/withdraw");
const depositSvc = require("../services/deposit");

redis.on("subscribe", (channel, count) => {
    console.log(`redis订阅频道: ${channel}`);
});

redis.on("message", async (channel, message) => {
    console.log(`接收到redis频道：${channel}，发来的消息：${message}`);
    switch (channel) {
        case cfg.pocsSubKey:
            let process = JSON.parse(message);
            if(process.type === "DEPOSIT") {
                // 如果是充币，则给用户加仓
                try {
                    // 获取充币信息
                    let url = `${walletCfg.host}:${walletCfg.port}/api/deposit/${process.asset}`;
                    let deposit = (await axios.get(url, {
                        params: { tx_hash: process.tx_hash }
                    })).data.data;
                    deposit = deposit[0];
                    console.log(`找到对应的充币记录：${JSON.stringify(deposit)}`);

                    // 更新用户资产
                    let result = null;
                    switch (process.process) {
                        case "FINISH":
                            result = await assetsSvc.updateWeight(process.asset, deposit.address, deposit.amount);

                            // 添加资金变动记录
                            await assetsSvc.addChange({
                                type: process.type,
                                amount: deposit.amount,
                                belong_user: await depositSvc.findUserByAddress(deposit.address, process.asset),
                                asset: process.asset,
                                direction: true,
                                rel_id: deposit.id
                            });
                            break;
                        case "INCHAIN":
                            result = await assetsSvc.changeFrozen(process.asset, deposit.address, deposit.amount);
                            break;
                        default:
                            result = { data: "没有做额外的操作" };
                    }
                    console.log(`处理完毕：${JSON.stringify(result)}`);
                } catch (e) {
                    console.error(e.message ? e.message : JSON.stringify(e));
                }
            } else if(process.type === "WITHDRAW") {
                // 如果是提币，则给用户减仓
                try {
                    // 获取提币信息
                    let url = `${walletCfg.host}:${walletCfg.port}/api/withdraw/${process.asset}`;
                    let withdraw = (await axios.get(url, {
                        params: { id: process.id }
                    })).data.data;
                    withdraw = withdraw[0];
                    console.log(`找到对应的提币记录：${JSON.stringify(withdraw)}`);

                    // 根据提币地址找到对应的用户和用户的资产地址
                    let sender = (await withdrawSvc.findRecord({ id: withdraw.id }))[0].sender_user;
                    let address = (await depositSvc.findAddressByUser(sender, process.asset))[0];

                    // 更新用户资产
                    let result = null;
                    switch (process.process) {
                        case "FINISH":
                            result = await assetsSvc.changeFrozen(process.asset, address, -withdraw.amount);

                            // 添加资金变动记录
                            await assetsSvc.addChange({
                                type: process.type,
                                amount: withdraw.amount,
                                belong_user: sender,
                                asset: process.asset,
                                direction: false,
                                rel_id: withdraw.id
                            });
                            break;
                        case "LOAD":
                            result = await assetsSvc.updateWeight(process.asset, address, -withdraw.amount);
                            break;
                        default:
                            result = { data: "没有做额外的操作" };
                    }
                    console.log(`处理完毕：${JSON.stringify(result)}`);
                } catch (e) {
                    console.error(e.message ? e.message : JSON.stringify(e));
                }
            }
            break;
    }
    console.log(`message: ${channel}-${message}`);
});

redis.subscribe(cfg.pocsSubKey);