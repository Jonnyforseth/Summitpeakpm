const realEstateUrl = 'https://champrealestate.org/';

function realEstateSection(audience = 'overview') {
  const copy = {
    renters: {
      eyebrow: 'FROM RENTING TO OWNING',
      heading: 'Thinking about a home<br><em>of your own?</em>',
      body: 'When buying a home becomes part of your plans, explore your next step with Champ Real Estate, our owner’s real estate business. Start a conversation about buying in the Colorado Springs area.',
      action: 'Explore home buying'
    },
    owners: {
      eyebrow: 'WHEN YOUR PROPERTY PLANS CHANGE',
      heading: 'Ready to sell?<br><em>Plan your next chapter.</em>',
      body: 'Thinking about selling your home or rental property, or buying your next one? Connect with Champ Real Estate, our owner’s real estate business, to discuss your plans in the Colorado Springs area.',
      action: 'Explore buying &amp; selling'
    },
    overview: {
      eyebrow: 'BUYING &amp; SELLING IN COLORADO SPRINGS',
      heading: 'A new home.<br><em>A new chapter.</em>',
      body: 'Looking to buy a home or sell a property? Visit Champ Real Estate, the real estate business of Summit Peak’s owner, for your next step in buying or selling.',
      action: 'Explore buying &amp; selling'
    },
    about: {
      eyebrow: 'MEET CHAMP REAL ESTATE',
      heading: 'Local experience.<br><em>For your next move, too.</em>',
      body: 'Darryl also operates Champ Real Estate, his real estate business for people looking to buy or sell a home. Whether you are moving from renting to owning or planning to sell a property, continue the conversation on his real estate website.',
      action: 'Visit Champ Real Estate'
    }
  }[audience];
  return `<section class="real-estate-section section-wrap" id="buy-sell"><div><p class="eyebrow green">${copy.eyebrow}</p><h2>${copy.heading}</h2><p class="real-estate-description">${copy.body}</p></div><div class="real-estate-destination"><p class="real-estate-name">Champ Real Estate</p><p>Home buying &amp; selling</p><a class="button button-dark" href="${realEstateUrl}">${copy.action} <span aria-hidden="true">↗</span></a><p class="real-estate-domain">Continue to Champrealestate.org</p></div></section>`;
}

module.exports = { realEstateUrl, realEstateSection };
