import { Router } from 'express';
import { auth, requireAdmin } from '../middlewares/auth';
import { db } from '../lib/db';

const router = Router();

router.get('/', auth, requireAdmin, async (_req, res) => {
  try {
    const snap = await db.collection('orders').get();
    const partTypeCounts: Record<string, number> = {};
    let totalRepair = 0;
    let totalDefect = 0;
    let totalInternal = 0;
    const partnerStats: Record<string, { count: number; total: number }> = {};

    snap.forEach((doc) => {
      const data = doc.data() as any;
      const type = data.partType || 'Unknown';
      partTypeCounts[type] = (partTypeCounts[type] || 0) + 1;

      totalRepair += data.repairPrice || 0;
      totalDefect += data.defectPrice || 0;
      totalInternal += data.workHours || 0;

      const partner = data.clientName || 'Unknown';
      if (!partnerStats[partner]) partnerStats[partner] = { count: 0, total: 0 };
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
  } catch (err) {
    console.error('GET /stats error:', err);
    res.status(500).json({ error: 'server error' });
  }
});

export default router; 