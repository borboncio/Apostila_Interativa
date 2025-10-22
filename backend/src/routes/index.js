const { Router } = require('express');
const supabase = require('../services/supabase');

const router = Router();

router.get('/health', async (req, res, next) => {
  try {
    const database = {
      provider: 'supabase',
      status: 'not_configured'
    };

    if (supabase.isConfigured()) {
      try {
        await supabase.checkConnection();
        database.status = 'ok';
      } catch (error) {
        database.status = 'error';
        database.error = error.message;
      }
    }

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
