const db = require('../../db');
const { audit } = require('../../services/audit');
const { getApprovedOutpassStudentIds } = require('../../services/outpassContract');
const {
  menuCreateUpdateSchema,
  mealPreferenceSchema,
  cutoffConfigSchema,
} = require('./food.validation');

/**
 * Retrieve Cutoff Configuration
 */
async function getCutoffConfig() {
  const res = await db.query(`SELECT value FROM system_settings WHERE key = 'food_cutoff_time'`);
  if (res.rows.length > 0) {
    const val = typeof res.rows[0].value === 'string' ? JSON.parse(res.rows[0].value) : res.rows[0].value;
    return {
      hour: parseInt(val.hour ?? 21, 10),
      minute: parseInt(val.minute ?? 0, 10),
    };
  }
  return {
    hour: parseInt(process.env.FOOD_CUTOFF_HOUR || '21', 10),
    minute: parseInt(process.env.FOOD_CUTOFF_MINUTE || '0', 10),
  };
}

/**
 * Calculate whether the cutoff deadline for a specific mealDate has passed
 * @param {string} mealDateStr - 'YYYY-MM-DD'
 * @param {Object} cutoffConfig - { hour, minute }
 */
function isMealCutoffPassed(mealDateStr, cutoffConfig) {
  const [year, month, day] = mealDateStr.split('-').map(Number);
  // Cutoff is the previous day at cutoffConfig.hour:cutoffConfig.minute
  const cutoffDate = new Date(year, month - 1, day - 1, cutoffConfig.hour, cutoffConfig.minute, 0);
  const now = new Date();
  return {
    isLocked: now.getTime() >= cutoffDate.getTime(),
    cutoffTimestamp: cutoffDate.toISOString(),
  };
}

/**
 * Get Weekly Menu
 */
async function getWeeklyMenu(req, res) {
  try {
    const result = await db.query(
      `SELECT id, day_of_week, meal_type, start_time, end_time, title, description, options, is_active
       FROM food_menus
       WHERE is_active = TRUE
       ORDER BY day_of_week ASC, 
         CASE meal_type 
           WHEN 'breakfast' THEN 1 
           WHEN 'lunch' THEN 2 
           WHEN 'snacks' THEN 3 
           WHEN 'dinner' THEN 4 
         END`
    );

    const cutoff = await getCutoffConfig();

    return res.status(200).json({
      success: true,
      data: {
        menus: result.rows,
        cutoffConfig: cutoff,
      },
      error: null,
    });
  } catch (err) {
    console.error('[FOOD-GET-WEEKLY-MENU] Error:', err);
    return res.status(500).json({
      success: false,
      data: null,
      error: { message: 'Failed to retrieve weekly menu: ' + err.message, code: 'MENU_FETCH_ERROR' },
    });
  }
}

/**
 * Create or Update Menu Item (Mess Staff / Admin)
 */
async function upsertMenuItem(req, res) {
  try {
    const parseResult = menuCreateUpdateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          message: 'Invalid menu item payload.',
          code: 'VALIDATION_ERROR',
          details: parseResult.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
        },
      });
    }

    const { dayOfWeek, mealType, startTime, endTime, title, description, options } = parseResult.data;

    // Check if item exists
    const existing = await db.query(
      'SELECT id FROM food_menus WHERE day_of_week = $1 AND meal_type = $2',
      [dayOfWeek, mealType]
    );

    let menuRecord;
    if (existing.rows.length > 0) {
      const updateRes = await db.query(
        `UPDATE food_menus 
         SET start_time = $1, end_time = $2, title = $3, description = $4, options = $5, is_active = TRUE
         WHERE id = $6
         RETURNING *`,
        [startTime, endTime, title, description, JSON.stringify(options), existing.rows[0].id]
      );
      menuRecord = updateRes.rows[0];
    } else {
      const insertRes = await db.query(
        `INSERT INTO food_menus (day_of_week, meal_type, start_time, end_time, title, description, options, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
         RETURNING *`,
        [dayOfWeek, mealType, startTime, endTime, title, description, JSON.stringify(options)]
      );
      menuRecord = insertRes.rows[0];
    }

    await audit({
      userId: req.user.id,
      action: 'FOOD_MENU_SAVED',
      entityType: 'menu',
      entityId: menuRecord.id,
      details: { dayOfWeek, mealType, title },
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      data: {
        message: 'Menu entry successfully saved.',
        menu: menuRecord,
      },
      error: null,
    });
  } catch (err) {
    console.error('[FOOD-UPSERT-MENU] Error:', err);
    return res.status(500).json({
      success: false,
      data: null,
      error: { message: 'Failed to update menu: ' + err.message, code: 'MENU_SAVE_ERROR' },
    });
  }
}

/**
 * Get Student Preferences for Date Range
 */
async function getStudentPreferences(req, res) {
  try {
    const studentId = req.user.studentId;
    if (!studentId) {
      return res.status(403).json({
        success: false,
        data: null,
        error: { message: 'Only active students can query personal meal preferences.', code: 'FORBIDDEN' },
      });
    }

    const { startDate, endDate } = req.query;
    let query = `SELECT id, student_id, meal_date, meal_type, selected_option_id, is_locked, updated_at
                 FROM meal_preferences
                 WHERE student_id = $1`;
    const params = [studentId];

    if (startDate && endDate) {
      params.push(startDate, endDate);
      query += ` AND meal_date >= $2 AND meal_date <= $3`;
    }

    query += ` ORDER BY meal_date ASC, meal_type ASC`;

    const result = await db.query(query, params);
    const cutoff = await getCutoffConfig();

    // Map lock status based on current cutoff
    const preferencesWithLock = result.rows.map(pref => {
      const { isLocked, cutoffTimestamp } = isMealCutoffPassed(pref.meal_date.toISOString ? pref.meal_date.toISOString().split('T')[0] : String(pref.meal_date), cutoff);
      return {
        ...pref,
        isLockedNow: isLocked || pref.is_locked,
        cutoffTimestamp,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        preferences: preferencesWithLock,
        cutoffConfig: cutoff,
      },
      error: null,
    });
  } catch (err) {
    console.error('[FOOD-GET-PREFERENCES] Error:', err);
    return res.status(500).json({
      success: false,
      data: null,
      error: { message: 'Failed to get meal preferences: ' + err.message, code: 'PREFERENCES_FETCH_ERROR' },
    });
  }
}

/**
 * Submit or Update Meal Preference
 * Validates cutoff lock
 */
async function submitMealPreference(req, res) {
  try {
    const studentId = req.user.studentId;
    if (!studentId) {
      return res.status(403).json({
        success: false,
        data: null,
        error: { message: 'Only registered students can select meal preferences.', code: 'FORBIDDEN' },
      });
    }

    const parseResult = mealPreferenceSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          message: 'Invalid meal preference payload.',
          code: 'VALIDATION_ERROR',
          details: parseResult.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
        },
      });
    }

    const { mealDate, mealType, selectedOptionId } = parseResult.data;

    // 1. Verify Cutoff Time
    const cutoff = await getCutoffConfig();
    const { isLocked, cutoffTimestamp } = isMealCutoffPassed(mealDate, cutoff);

    if (isLocked) {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          message: `Cut-off time has passed for ${mealDate} (Locked daily at ${String(cutoff.hour).padStart(2, '0')}:${String(cutoff.minute).padStart(2, '0')}). Changes can no longer be made.`,
          code: 'PREFERENCE_LOCKED',
          details: { cutoffTimestamp },
        },
      });
    }

    // 2. Validate Selected Option against Menu
    const targetDateObj = new Date(mealDate);
    const dayOfWeek = targetDateObj.getDay();

    const menuRes = await db.query(
      `SELECT id, options FROM food_menus WHERE day_of_week = $1 AND meal_type = $2 AND is_active = TRUE`,
      [dayOfWeek, mealType]
    );

    if (menuRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { message: `No active menu found for ${mealType} on that day.`, code: 'MENU_NOT_FOUND' },
      });
    }

    const menuOptions = typeof menuRes.rows[0].options === 'string'
      ? JSON.parse(menuRes.rows[0].options)
      : menuRes.rows[0].options;

    const matchedOption = menuOptions.find(o => o.id === selectedOptionId);
    if (!matchedOption) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { message: 'Invalid meal option selected for this meal type.', code: 'INVALID_OPTION' },
      });
    }

    // 3. Upsert preference in meal_preferences
    const upsertRes = await db.query(
      `INSERT INTO meal_preferences (student_id, meal_date, meal_type, selected_option_id, is_locked, created_at, updated_at)
       VALUES ($1, $2, $3, $4, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (student_id, meal_date, meal_type)
       DO UPDATE SET selected_option_id = EXCLUDED.selected_option_id, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [studentId, mealDate, mealType, selectedOptionId]
    );

    await audit({
      userId: req.user.id,
      action: 'MEAL_PREFERENCE_SUBMITTED',
      entityType: 'meal_preference',
      entityId: upsertRes.rows[0].id,
      details: { mealDate, mealType, selectedOption: matchedOption.name },
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      data: {
        message: `Preference recorded: ${matchedOption.name} for ${mealType} on ${mealDate}.`,
        preference: upsertRes.rows[0],
      },
      error: null,
    });
  } catch (err) {
    console.error('[FOOD-SUBMIT-PREFERENCE] Error:', err);
    return res.status(500).json({
      success: false,
      data: null,
      error: { message: 'Failed to record preference: ' + err.message, code: 'PREFERENCE_SAVE_ERROR' },
    });
  }
}

/**
 * Meal Count Report for Mess Staff & Admin
 * Aggregates count by Block and Meal Option, applying defaults for non-respondents
 * and excluding students who hold an approved outpass!
 */
async function getMealReport(req, res) {
  try {
    const mealDate = req.query.date || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const targetMealType = req.query.mealType; // optional filter

    // 1. Fetch Students with Approved Outpass (Contract Hook)
    const excludedStudentIds = await getApprovedOutpassStudentIds(mealDate, targetMealType || 'any');

    // 2. Determine Day of Week for Menu
    const targetDateObj = new Date(mealDate);
    const dayOfWeek = targetDateObj.getDay();

    // 3. Load Active Menus for that day
    let menuQuery = `SELECT id, day_of_week, meal_type, title, options FROM food_menus WHERE day_of_week = $1 AND is_active = TRUE`;
    const menuParams = [dayOfWeek];
    if (targetMealType) {
      menuParams.push(targetMealType);
      menuQuery += ` AND meal_type = $2`;
    }
    const menusRes = await db.query(menuQuery, menuParams);

    // 4. Load Active Students and their Blocks
    const studentsRes = await db.query(
      `SELECT s.id AS student_id, s.block_id, b.name AS block_name, b.code AS block_code, b.gender
       FROM students s
       JOIN users u ON u.id = s.user_id
       JOIN blocks b ON b.id = s.block_id
       WHERE u.status = 'active'`
    );

    const allStudents = studentsRes.rows;
    const eligibleStudents = allStudents.filter(s => !excludedStudentIds.includes(s.student_id));

    // 5. Load Explicit Preferences for this Date
    let prefQuery = `SELECT student_id, meal_type, selected_option_id FROM meal_preferences WHERE meal_date = $1`;
    const prefsRes = await db.query(prefQuery, [mealDate]);

    // Build fast lookup map: `${studentId}_${mealType}` -> selectedOptionId
    const prefMap = new Map();
    prefsRes.rows.forEach(p => {
      prefMap.set(`${p.student_id}_${p.meal_type}`, p.selected_option_id);
    });

    // 6. Aggregate by Meal Type and Block
    const reportData = [];

    for (const menuRow of menusRes.rows) {
      const mealType = menuRow.meal_type;
      const options = typeof menuRow.options === 'string' ? JSON.parse(menuRow.options) : menuRow.options;
      const defaultOption = options.find(o => o.isDefault) || options[0] || { id: 'default', name: 'Standard Meal' };

      const blockCounts = {};
      const optionTotals = {};
      options.forEach(opt => {
        optionTotals[opt.id] = { id: opt.id, name: opt.name, count: 0 };
      });

      let totalEatersForMeal = 0;

      for (const student of eligibleStudents) {
        const studentChoiceKey = `${student.student_id}_${mealType}`;
        const chosenOptionId = prefMap.get(studentChoiceKey) || defaultOption.id;

        // Initialize block bucket
        if (!blockCounts[student.block_id]) {
          blockCounts[student.block_id] = {
            blockId: student.block_id,
            blockName: student.block_name,
            blockCode: student.block_code,
            gender: student.gender,
            options: {},
            total: 0,
          };
          options.forEach(opt => {
            blockCounts[student.block_id].options[opt.id] = {
              name: opt.name,
              count: 0,
            };
          });
        }

        // Increment counts
        if (blockCounts[student.block_id].options[chosenOptionId]) {
          blockCounts[student.block_id].options[chosenOptionId].count++;
        }
        blockCounts[student.block_id].total++;

        if (optionTotals[chosenOptionId]) {
          optionTotals[chosenOptionId].count++;
        }
        totalEatersForMeal++;
      }

      reportData.push({
        mealType,
        menuTitle: menuRow.title,
        totalEligibleStudents: eligibleStudents.length,
        totalExcludedOutpass: excludedStudentIds.length,
        totalExpectedEaters: totalEatersForMeal,
        optionTotals: Object.values(optionTotals),
        byBlock: Object.values(blockCounts),
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        date: mealDate,
        totalActiveStudents: allStudents.length,
        totalExcludedOutpass: excludedStudentIds.length,
        meals: reportData,
      },
      error: null,
    });
  } catch (err) {
    console.error('[FOOD-GET-MEAL-REPORT] Error:', err);
    return res.status(500).json({
      success: false,
      data: null,
      error: { message: 'Failed to generate meal count report: ' + err.message, code: 'REPORT_GEN_ERROR' },
    });
  }
}

/**
 * Update Cutoff Time (Admin / Mess Supervisor)
 */
async function updateCutoffConfig(req, res) {
  try {
    const parseResult = cutoffConfigSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        data: null,
        error: { message: 'Cutoff time requires valid hour (0-23) and minute (0-59).', code: 'VALIDATION_ERROR' },
      });
    }

    const { hour, minute } = parseResult.data;
    const valueObj = { hour, minute };

    await db.query(
      `INSERT INTO system_settings (key, value, description, updated_at)
       VALUES ('food_cutoff_time', $1, 'Daily meal preference locking cut-off time', CURRENT_TIMESTAMP)
       ON CONFLICT (key)
       DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
      [JSON.stringify(valueObj)]
    );

    await audit({
      userId: req.user.id,
      action: 'FOOD_CUTOFF_CONFIG_UPDATED',
      entityType: 'system_setting',
      entityId: 'food_cutoff_time',
      details: valueObj,
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      data: {
        message: `Cut-off time updated to ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}.`,
        cutoffConfig: valueObj,
      },
      error: null,
    });
  } catch (err) {
    console.error('[FOOD-UPDATE-CUTOFF] Error:', err);
    return res.status(500).json({
      success: false,
      data: null,
      error: { message: 'Failed to update cut-off configuration.', code: 'CUTOFF_UPDATE_ERROR' },
    });
  }
}

module.exports = {
  getWeeklyMenu,
  upsertMenuItem,
  getStudentPreferences,
  submitMealPreference,
  getMealReport,
  getCutoffConfigHandler: async (req, res) => {
    const config = await getCutoffConfig();
    return res.status(200).json({ success: true, data: config, error: null });
  },
  updateCutoffConfig,
};
