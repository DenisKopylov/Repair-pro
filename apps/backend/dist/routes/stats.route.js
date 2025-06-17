"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const db_1 = require("../lib/db");
const router = (0, express_1.Router)();
router.get('/', auth_1.auth, auth_1.requireAdmin, async (_req, res) => {
    try {
        const snap = await db_1.db.collection('orders').get();
        const partTypeCounts = {};
        let totalRepair = 0;
        let totalDefect = 0;
        let totalInternal = 0;
        const partnerStats = {};
        snap.forEach((doc) => {
            const data = doc.data();
            const type = data.partType || 'Unknown';
            partTypeCounts[type] = (partTypeCounts[type] || 0) + 1;
            totalRepair += data.repairPrice || 0;
            totalDefect += data.defectPrice || 0;
            totalInternal += data.workHours || 0;
            const partner = data.clientName || 'Unknown';
            if (!partnerStats[partner])
                partnerStats[partner] = { count: 0, total: 0 };
            partnerStats[partner].count += 1;
            partnerStats[partner].total += data.repairPrice || 0;
        });
        res.json({
            partTypeCounts,
            totals: {
                repairPrice: totalRepair,
                defectPrice: totalDefect,
                internalPrice: totalInternal,
            },
            partnerStats,
        });
    }
    catch (err) {
        console.error('GET /stats error:', err);
        res.status(500).json({ error: 'server error' });
    }
});
exports.default = router;
