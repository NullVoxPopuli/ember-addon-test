import * as QUnit from 'qunit';

function sendStatus(status, details) {
  fetch('/_test-status', {
    method: 'POST',
    body: JSON.stringify({
      status,
      details,
    }),
    headers: {
      'Content-Type': 'application/json',
    }
  });
}

QUnit.done((details) => {
  sendStatus('done', details);
});

QUnit.testDone((details) => {
  sendStatus('testDone', details);
});

QUnit.testStart(details => {
  sendStatus('testStart', details);
});

QUnit.begin(details => {
  sendStatus('begin', details);
})

