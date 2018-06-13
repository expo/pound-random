let clearbit = require("./clearbit");

async function companyInfoForDomainAsync(domain) {
  let clearbitInfo = await clearbit.Company.find({domain});
  return {
    name: clearbitInfo.name,
    logo: clearbitInfo.logo,
  }
}

module.exports = {
  companyInfoForDomainAsync,
}