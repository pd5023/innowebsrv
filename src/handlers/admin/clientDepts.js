const pool = require('../../db/pool');

async function listClientDepts(cltId) {
  const r = await pool.query(
    `SELECT cd.cltDept_id AS "cltDept_id", cd.cltDept_cltId AS "cltDept_cltId",
            cd.cltDept_dept AS "cltDept_dept", cd.cltDept_alias AS "cltDept_alias",
            d.dept_name
     FROM client_depts cd
     LEFT JOIN departments d ON d.dept_id = cd.cltDept_dept
     WHERE cd.cltDept_cltId = $1
     ORDER BY cd.cltDept_alias`,
    [cltId]
  );
  return r.rows;
}

async function createClientDept(data) {
  const r = await pool.query(
    `INSERT INTO client_depts (cltDept_cltId, cltDept_dept, cltDept_alias)
     VALUES ($1,$2,$3)
     RETURNING cltDept_id AS "cltDept_id", cltDept_cltId AS "cltDept_cltId",
               cltDept_dept AS "cltDept_dept", cltDept_alias AS "cltDept_alias"`,
    [data.cltDept_cltId, data.cltDept_dept, data.cltDept_alias]
  );
  return r.rows[0];
}

async function updateClientDept(id, data) {
  const r = await pool.query(
    `UPDATE client_depts SET cltDept_dept=$1, cltDept_alias=$2
     WHERE cltDept_id=$3
     RETURNING cltDept_id AS "cltDept_id", cltDept_cltId AS "cltDept_cltId",
               cltDept_dept AS "cltDept_dept", cltDept_alias AS "cltDept_alias"`,
    [data.cltDept_dept, data.cltDept_alias, id]
  );
  return r.rows[0];
}

async function deleteClientDept(id) {
  await pool.query('DELETE FROM client_depts WHERE cltDept_id = $1', [id]);
  return { deleted: true };
}

module.exports = { listClientDepts, createClientDept, updateClientDept, deleteClientDept };
