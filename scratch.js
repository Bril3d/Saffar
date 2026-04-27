const { getDb } = require('./backend/src/db/db');
const db = getDb();
console.log("All lots:", db.prepare('SELECT * FROM animal_lots').all());
console.log("Prescriptions:", db.prepare('SELECT rx_id, animal_lot_id, administered, withdrawal_end FROM prescriptions_offchain').all());
console.log("Certifications:", db.prepare('SELECT * FROM lot_certifications').all());

console.log("Pending lots query:");
console.log(db.prepare(`
    SELECT 
        al.id as lot_id,
        COUNT(p.rx_id) as total_treatments,
        SUM(CASE WHEN p.administered = 1 THEN 1 ELSE 0 END) as administered_treatments,
        MAX(p.withdrawal_end) as latest_withdrawal_end,
        datetime(MAX(p.withdrawal_end)) as parsed_withdrawal,
        datetime('now') as now
    FROM animal_lots al
    JOIN prescriptions_offchain p ON al.id = p.animal_lot_id
    LEFT JOIN lot_certifications lc ON al.id = lc.lot_id
    WHERE lc.lot_id IS NULL
    GROUP BY al.id
`).all());
