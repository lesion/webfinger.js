// -*- mode:js; js-indent-level:2 -*-
/*!
 * avatar.js
 * http://github.com/silverbucket/avatar.js
 *
 * Copyright 2012 Michiel de Jong <michiel@michielbdejong.com>
 * Copyright 2012 Nick Jennings <nick@silverbucket.net>
 *
 * Released under the MIT license
 * http://github.com/silverbucket/avatar.js/LICENSE
 *
 */
(function(window, document, undefined) {

  function isValidJSON(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  function isValidDomain(domain) {
    var pattern = /^[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/;
    return pattern.test(domain);
  }

  function callWebFinger(emailAddress, host, URIEndPoint, cb) {
    if (!isValidDomain(host)) {
      cb('invalid host name');
      return;
    }

    var xhr = new XMLHttpRequest();

    xhr.open('GET', 'https://'+host+'/.well-known/'+URIEndPoint+'?resource=acct:'+emailAddress, true);
    console.log('URL: https://'+host+'/.well-known/'+URIEndPoint+'?resource=acct:'+emailAddress);

    xhr.onreadystatechange = function() {
      if(xhr.readyState==4) {
        //console.log('xhr.status: '+xhr.status);
        if(xhr.status==200) {
          console.log(xhr.responseText);
          if (isValidJSON(xhr.responseText)) {
            var links = JSON.parse(xhr.responseText).links;
            for(var i=0; i<links.length; i++) {
              //console.log(links[i]);
              if(links[i].rel=='http://webfinger.net/rel/avatar') {
                //console.log('found');
                cb(null, links[i].href);
              }
            }
          } else {
            cb('invalid json response');
          }

        } else {
          if (URIEndPoint === 'host-meta.json') {
            callWebFinger(emailAddress, host, 'host-meta', cb);
          } else {
            cb('webfinger endpoint unreachable', xhr.status);
          }
        }
      }
    };

    xhr.setRequestHeader('Accept', 'application/json');
    xhr.send();
  }

  window.avatar = function(emailAddress, cb) {
    var parts = emailAddress.replace(/ /g,'').split('@');
    if (parts.length !== 2) { cb('invalid email address'); return false; }
    callWebFinger(emailAddress, parts[1], 'host-meta.json', cb);
  };

})(this, document);
