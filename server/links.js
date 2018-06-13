let url = require('url');

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

async function infoForLinkAsync(link) {
  let u = url.parse(link);
  let domainInfo = await companyInfoForDomainAsync(u.hostname);
  return {
    domain: domainInfo,
    url: link,
  };

}

module.exports = {
  companyInfoForDomainAsync,
  infoForLinkAsync,
}