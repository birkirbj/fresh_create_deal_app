var baseURLSales = 'https://dev-arcticadventures.myfreshworks.com/crm/sales/api';
var apiKeySales = 'oHluNLuzKb6uaBH85V-YWw';

var baseURLDesk = 'https://dev-arcticadventures.freshdesk.com/api/v2';
var apiKeyDesk = 'CWVlcgYnrXS9NWOziH';

var baseHeadersSales = {
  'Authorization': `Token token=${apiKeySales}`,
  'Content-Type': 'application/json'
};

var baseHeadersDesk = {
  'Authorization': `Basic ${Buffer.from(apiKeyDesk + ":X").toString('base64')}`,
  'Content-Type': 'application/json'
};

exports = {
  checkContactExists: function(args) {
    return new Promise(function(resolve, reject) {
      var options = {
        method: 'GET',
        url: `${baseURLSales}/contacts?email=${args.email}`,
        headers: baseHeadersSales
      };
      $request(options)
        .then(function(data) {
          var contact = JSON.parse(data.response);
          if (contact && contact.contacts && contact.contacts.length > 0) {
            resolve({ status: 200, message: contact.contacts[0].id });
          } else {
            resolve({ status: 200, message: null });
          }
        })
        .catch(function(error) {
          reject({ status: 500, message: error });
        });
    });
  },

  createContactInFreshsales: function(args) {
    var names = args.name.split(" ");
    var options = {
      method: 'POST',
      url: `${baseURLSales}/contacts`,
      headers: baseHeadersSales,
      json: {
        "contact": {
          "first_name": names[0],
          "last_name": names.length > 1 ? names[names.length - 1] : "",
          "email": args.email
        }
      }
    };
    return $request(options).then(function(data) {
      return { status: 200, message: data.response };
    }).catch(function(error) {
      return { status: 500, message: error };
    });
  },

  createDealInFreshsales: function(args) {
    var options = {
      method: 'POST',
      url: `${baseURLSales}/deals`,
      headers: baseHeadersSales,
      json: {
        "deal": {
          "name": args.name,
          "amount": args.amount,
          "currency": args.currency,
          "deal_stage_id": 1,
          "contact_ids": [args.contact_id]
        }
      }
    };
    return $request(options).then(function(data) {
      return { status: 200, message: data.response };
    }).catch(function(error) {
      return { status: 500, message: error };
    });
  },

  getContactFromFreshdesk: function(args) {
    return new Promise(function(resolve, reject) {
      var options = {
        method: 'GET',
        url: `${baseURLDesk}/contacts/${args.id}`,
        headers: baseHeadersDesk
      };
      $request(options)
        .then(function(data) {
          var contact = JSON.parse(data.response);
          resolve({ status: 200, message: contact });
        })
        .catch(function(error) {
          reject({ status: 500, message: error });
        });
    });
  }
};
