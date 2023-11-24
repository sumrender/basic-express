const { JSDOM } = require('jsdom');

function getContentInsideSquareBrackets(inputString) {
    const regex = /\[(.*?)\]/; // This regular expression matches anything inside square brackets and captures it
  
    const match = inputString.match(regex);
  
    // Check if there's a match and return the content inside brackets, or an empty string if there's no match
    return match ? match[1] : '';
}

function parseEmail(email, outlookmail) {
    const subject = email.subject;
    const ticketId = getContentInsideSquareBrackets(subject);
    const emailBody = email.body.content;
    
    // Create a virtual DOM
    const dom = new JSDOM(emailBody);
    const doc = dom.window.document;

    let targetDiv = doc.querySelector('div[dir="ltr"]');
    if(email.sender.emailAddress.address === outlookmail) {
        targetDiv = doc.querySelector('.elementToProof');
    }
    
    const divTextContent = targetDiv.textContent;
    return {
        ticketId,
        sender: email.sender.emailAddress.address,
        message: divTextContent
    };
}

module.exports = parseEmail;