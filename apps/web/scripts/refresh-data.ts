import { refreshMarketData } from "../src/lib/market";

refreshMarketData().then((result) => {
  console.log("Data refresh complete:", result);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
