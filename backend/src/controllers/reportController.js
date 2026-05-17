const GoalSheet = require('../models/GoalSheet');
const CheckIn = require('../models/CheckIn');
const ExcelJS = require('exceljs');
const { Parser } = require('json2csv');

// Helper to format response based on requested format
const sendExport = async (res, data, format, filename) => {
  if (format === 'excel') {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');
    
    if (data.length > 0) {
      // Generate columns from keys
      worksheet.columns = Object.keys(data[0]).map(key => ({
        header: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        key: key,
        width: 20
      }));
      worksheet.addRows(data);
      
      // Style header
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } };
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);
    
    await workbook.xlsx.write(res);
    return res.end();

  } else {
    // Default to CSV
    try {
      const parser = new Parser();
      const csv = parser.parse(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
      return res.status(200).send(csv);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error generating CSV' });
    }
  }
};

// @desc    Export Goal Completion Report
// @route   GET /api/reports/goal-completion
// @access  Private (Admin)
const exportGoalCompletion = async (req, res) => {
  const { format = 'csv', department, year } = req.query;

  try {
    const query = {};
    if (year) query.year = year;
    
    let sheets = await GoalSheet.find(query)
      .populate({ path: 'user', select: 'name email department' })
      .populate('goals');

    if (department && department !== 'All') {
      sheets = sheets.filter(s => s.user?.department === department);
    }

    const reportData = [];
    sheets.forEach(sheet => {
      sheet.goals.forEach(goal => {
        reportData.push({
          employeeName: sheet.user?.name || 'Unknown',
          department: sheet.user?.department || 'N/A',
          performanceCycle: sheet.year,
          sheetStatus: sheet.status,
          goalTitle: goal.title,
          thrustArea: goal.thrustArea,
          uomType: goal.uomType,
          target: goal.target,
          weightage: goal.weightage,
          progressScore: goal.progressScore || 0,
          status: goal.status
        });
      });
    });

    if (reportData.length === 0) {
      reportData.push({ message: 'No data found for the selected filters' });
    }

    await sendExport(res, reportData, format, `Goal_Completion_Report_${Date.now()}`);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export Quarterly Achievements Report
// @route   GET /api/reports/quarterly
// @access  Private (Admin)
const exportQuarterlyAchievements = async (req, res) => {
  const { format = 'csv', quarter } = req.query;

  try {
    const query = {};
    if (quarter && quarter !== 'All') query.quarter = quarter;

    const checkIns = await CheckIn.find(query)
      .populate({ path: 'user', select: 'name email department' })
      .populate({ path: 'goal', select: 'title target uomType weightage' })
      .populate({ path: 'managerId', select: 'name' })
      .sort({ createdAt: -1 });

    const reportData = checkIns.map(ci => ({
      employeeName: ci.user?.name || 'Unknown',
      department: ci.user?.department || 'N/A',
      quarter: ci.quarter,
      goalTitle: ci.goal?.title || 'Unknown Goal',
      target: ci.goal?.target,
      uomType: ci.goal?.uomType,
      actualAchieved: ci.actualValue,
      statusLogged: ci.status,
      employeeComments: ci.comments || '',
      managerFeedback: ci.managerComment || '',
      reviewedBy: ci.managerId?.name || 'Not Reviewed',
      loggedAt: new Date(ci.createdAt).toLocaleDateString()
    }));

    if (reportData.length === 0) {
      reportData.push({ message: 'No quarterly check-ins found' });
    }

    await sendExport(res, reportData, format, `Quarterly_Achievements_${Date.now()}`);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  exportGoalCompletion,
  exportQuarterlyAchievements
};
