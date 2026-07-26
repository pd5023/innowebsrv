const pool = require('../db/pool');

// time_entries removed in new schema — Time Card feature to be redesigned
async function getTCToday(emplId) {
  return [{ result: 'norecords' }];
}

async function updateTC(emplId, step) {
  return [{ result: 'ok' }];
}

async function getTCPeriod(emplId) {
  return [{ result: 'norecords' }];
}

module.exports = { getTCToday, updateTC, getTCPeriod };
