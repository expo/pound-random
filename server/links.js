let clearbit = require("./clearbit");

async function companyInfoForDomainAsync(domain) {
  try {
    let clearbitInfo = await clearbit.Company.find({ domain });
    return {
      name: clearbitInfo.name,
      logo: clearbitInfo.logo,
    }
  } catch (e) {
    if (e.name === "CompanyQueuedError") {
      console.log("Got a Clearbit CompanyQueuedError for " + domain + "... It will probably work next time.");
    } else {
      console.warn(e.toString());
    }
    return {};
  }
}

module.exports = {
  companyInfoForDomainAsync,
}