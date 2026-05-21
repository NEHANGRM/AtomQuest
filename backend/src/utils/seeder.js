const User = require('../models/User');
const GoalSheet = require('../models/GoalSheet');
const Goal = require('../models/Goal');
const AuditLog = require('../models/AuditLog');
const CheckIn = require('../models/CheckIn');
const SharedGoal = require('../models/SharedGoal');
const Notification = require('../models/Notification');

const seedDatabase = async () => {
  try {
    // 1. Clear database
    console.log('[Seeder] Clearing old records...');
    await User.deleteMany({});
    await GoalSheet.deleteMany({});
    await Goal.deleteMany({});
    await AuditLog.deleteMany({});
    await CheckIn.deleteMany({});
    await SharedGoal.deleteMany({});
    await Notification.deleteMany({});

    // 2. Define Indian Names
    const firstNames = [
      'Aarav', 'Aditya', 'Amit', 'Arjun', 'Anil', 'Dev', 'Gaurav', 'Hari', 'Ishaan', 'Kabir',
      'Krishna', 'Madhav', 'Nikhil', 'Pranav', 'Rahul', 'Rohan', 'Sai', 'Siddharth', 'Varun', 'Vihaan',
      'Ananya', 'Diya', 'Ishita', 'Kavya', 'Meera', 'Neha', 'Pooja', 'Priya', 'Riya', 'Sanya',
      'Shreya', 'Sneha', 'Tanvi', 'Vanya', 'Aditi', 'Divya', 'Kiran', 'Nisha', 'Rashmi', 'Shruti'
    ];
    const lastNames = [
      'Sharma', 'Verma', 'Gupta', 'Patel', 'Iyer', 'Sen', 'Nair', 'Mehta', 'Joshi', 'Reddy',
      'Rao', 'Choudhury', 'Singh', 'Kumar', 'Mishra', 'Pandey', 'Deshmukh', 'Kulkarni', 'Bose', 'Das'
    ];

    const departments = ['Sales', 'Operations', 'Engineering', 'HR', 'Finance', 'Marketing'];

    console.log('[Seeder] Seeding Admins...');
    // Seed 3 HR Admins
    const admin1 = await User.create({
      name: 'System Admin',
      email: 'admin@gmail.com',
      password: 'admin',
      role: 'admin',
      department: 'HR'
    });
    const admin2 = await User.create({
      name: 'Aishwarya Admin',
      email: 'admin2@gmail.com',
      password: 'admin',
      role: 'admin',
      department: 'HR'
    });
    const admin3 = await User.create({
      name: 'Karan Admin',
      email: 'admin3@gmail.com',
      password: 'admin',
      role: 'admin',
      department: 'HR'
    });

    console.log('[Seeder] Seeding L1 Managers...');
    // Seed 8 Managers
    const managers = [];
    const managerDetails = [
      { name: 'Jane Manager', email: 'manager@gmail.com', password: 'manager', dept: 'Engineering' },
      { name: 'Aarav Manager', email: 'manager2@gmail.com', password: 'manager', dept: 'Sales' },
      { name: 'Diya Manager', email: 'manager3@gmail.com', password: 'manager', dept: 'Operations' },
      { name: 'Kabir Manager', email: 'manager4@gmail.com', password: 'manager', dept: 'HR' },
      { name: 'Meera Manager', email: 'manager5@gmail.com', password: 'manager', dept: 'Finance' },
      { name: 'Pranav Manager', email: 'manager6@gmail.com', password: 'manager', dept: 'Marketing' },
      { name: 'Sneha Manager', email: 'manager7@gmail.com', password: 'manager', dept: 'Engineering' },
      { name: 'Varun Manager', email: 'manager8@gmail.com', password: 'manager', dept: 'Sales' }
    ];

    for (const m of managerDetails) {
      const managerUser = await User.create({
        name: m.name,
        email: m.email,
        password: m.password,
        role: 'manager',
        department: m.dept
      });
      managers.push(managerUser);
    }

    console.log('[Seeder] Seeding Employees...');
    // Seed 40 Employees (including demouser@gmail.com)
    const employees = [];
    
    // First, seed demouser@gmail.com
    const demoUser = await User.create({
      name: 'Demo User',
      email: 'demouser@gmail.com',
      password: 'user',
      role: 'employee',
      department: 'Engineering',
      managerId: managers[0]._id // Jane Manager
    });
    employees.push(demoUser);

    // Seed 39 other employees
    for (let i = 1; i < 40; i++) {
      const fname = firstNames[i % firstNames.length];
      const lname = lastNames[(i + 3) % lastNames.length];
      const dept = departments[i % departments.length];
      const mgr = managers[i % managers.length];

      const emp = await User.create({
        name: `${fname} ${lname}`,
        email: `${fname.toLowerCase()}.${lname.toLowerCase()}@acme.com`,
        password: 'password123',
        role: 'employee',
        department: dept,
        managerId: mgr._id
      });
      employees.push(emp);
    }

    console.log('[Seeder] Seeding Shared Goals Templates...');
    // Seed 3 Shared Goals (pushed by HR/Admin)
    const sg1 = await SharedGoal.create({
      createdBy: admin1._id,
      thrustArea: 'Compliance & Risk',
      title: 'POSH Training Certification',
      description: 'Achieve 100% completion of the annual POSH training modules.',
      uomType: 'Percentage',
      direction: 'Higher',
      target: 100,
      timeline: 'Q2',
      assignedTo: employees.map(e => e._id)
    });

    const sg2 = await SharedGoal.create({
      createdBy: admin1._id,
      thrustArea: 'Operational Excellence',
      title: 'Information Security Training',
      description: 'Complete the ISO 27001 compliance program and mock phishing drills.',
      uomType: 'Zero-based',
      direction: 'Higher',
      target: 0, // 0 failures means 100%
      timeline: 'Q1',
      assignedTo: employees.map(e => e._id)
    });

    const sg3 = await SharedGoal.create({
      createdBy: admin1._id,
      thrustArea: 'People & Culture',
      title: 'Organization Survey Participation',
      description: 'Fill out and submit the annual Acme employee satisfaction survey.',
      uomType: 'Percentage',
      direction: 'Higher',
      target: 100,
      timeline: 'Q1',
      assignedTo: employees.map(e => e._id)
    });

    console.log('[Seeder] Seeding Goal Sheets...');
    // Seed Goal Sheets for employees:
    // - 25 employees: Approved goal sheets with 4-6 goals spanning all 4 UoM types
    // - 10 employees: Approved goal sheets with Q1 achievements logged
    // - 5 employees: Submitted (pending review)
    // - 2 employees: Returned for rework
    // Total employees: 42 (demoUser + 39 = 40)
    // Wait, let's distribute the 40 employees:
    // Approved with no actuals: indices 0 to 22 (23 employees)
    // Approved with Q1 actuals: indices 23 to 32 (10 employees)
    // Pending approval: indices 33 to 37 (5 employees)
    // Returned for rework: indices 38 to 39 (2 employees)

    const goalTemplates = [
      { thrustArea: 'Revenue Growth', title: 'Expand Key Accounts', desc: 'Secure renewals and upsells on major enterprise contracts.', uom: 'Percentage', target: 20, weight: 25 },
      { thrustArea: 'Customer Experience', title: 'Improve CSAT Score', desc: 'Maintain CSAT rating above target for all resolved helpdesk issues.', uom: 'Numeric', target: 95, weight: 25 },
      { thrustArea: 'Innovation', title: 'Launch Microservices Migration', desc: 'Refactor old monolithic modules into clean Node microservices.', uom: 'Timeline', target: 0, weight: 20, timeline: 'Q3' },
      { thrustArea: 'Operational Excellence', title: 'System Downtime Prevention', desc: 'Sustain zero critical service disruptions in production database cluster.', uom: 'Zero-based', target: 0, weight: 15 },
      { thrustArea: 'People & Culture', title: 'Upskilling Certification', desc: 'Complete certified courses in React Advanced patterns or Cloud Architecture.', uom: 'Numeric', target: 2, weight: 15 }
    ];

    for (let eIdx = 0; eIdx < employees.length; eIdx++) {
      const emp = employees[eIdx];
      let status = 'approved';
      if (eIdx >= 23 && eIdx <= 32) {
        status = 'approved'; // Will also log achievements
      } else if (eIdx >= 33 && eIdx <= 37) {
        status = 'submitted';
      } else if (eIdx >= 38 && eIdx <= 39) {
        status = 'returned';
      }

      const sheet = await GoalSheet.create({
        user: emp._id,
        year: '2026',
        status: status,
        managerComments: status === 'returned' ? 'Please re-balance weightages to make upsells 30%.' : undefined
      });

      const goalIds = [];
      // Generate 4-5 goals per employee
      for (let gIdx = 0; gIdx < 4; gIdx++) {
        const temp = goalTemplates[gIdx];
        
        const goal = await Goal.create({
          user: emp._id,
          goalSheet: sheet._id,
          thrustArea: temp.thrustArea,
          title: temp.title,
          description: temp.desc,
          uomType: temp.uom,
          direction: 'Higher',
          target: temp.target,
          weightage: temp.weight,
          deadline: temp.timeline ? new Date(2026, 8, 30) : undefined,
          status: 'Not Started',
          progressScore: 0
        });

        // Add Q1 achievement for those 10 employees
        if (status === 'approved' && eIdx >= 23 && eIdx <= 32) {
          let actual = 0;
          let progress = 0;
          if (temp.uom === 'Percentage') {
            actual = 15; // Target was 20
            progress = Math.round((actual / temp.target) * 100);
          } else if (temp.uom === 'Numeric') {
            actual = 92; // Target was 95
            progress = Math.round((actual / temp.target) * 100);
          } else if (temp.uom === 'Zero-based') {
            actual = 0; // Met target
            progress = 100;
          } else {
            actual = 1; // Completed
            progress = 100;
          }
          
          goal.achievements.push({
            quarter: 'Q1',
            actualValue: actual,
            comments: 'Completed Q1 checkpoints smoothly.',
            date: new Date()
          });
          goal.progressScore = progress;
          goal.status = progress >= 100 ? 'Completed' : 'On Track';
          await goal.save();

          // Seed manager CheckIn
          await CheckIn.create({
            goal: goal._id,
            user: emp._id,
            quarter: 'Q1',
            actualValue: actual,
            status: goal.status,
            comments: 'Completed Q1 checkpoints smoothly.',
            managerComment: 'Great progress. Keep up the high standards!',
            managerId: emp.managerId,
            reviewedAt: new Date()
          });
        }
        
        goalIds.push(goal._id);
      }

      // Link shared compliance POSH goal (sg1)
      const poshLinkedGoal = await Goal.create({
        user: emp._id,
        goalSheet: sheet._id,
        thrustArea: sg1.thrustArea,
        title: sg1.title,
        description: sg1.description,
        uomType: sg1.uomType,
        direction: sg1.direction,
        target: sg1.target,
        weightage: 15, // editable by recipient
        isShared: true,
        sharedGoalId: sg1._id,
        status: 'Not Started',
        progressScore: 0
      });
      goalIds.push(poshLinkedGoal._id);

      sheet.goals = goalIds;
      await sheet.save();
    }

    console.log('[Seeder] Seeding Audit Logs...');
    // Seed Audit Logs (~30 logs)
    const logActions = [
      { action: 'CREATE_GOAL_SHEET', model: 'GoalSheet' },
      { action: 'UPDATE_GOAL_SHEET', model: 'GoalSheet' },
      { action: 'MANAGER_REVIEW_APPROVED', model: 'GoalSheet' },
      { action: 'UPDATE_ACHIEVEMENT', model: 'Goal' },
      { action: 'ADMIN_UNLOCK_SHEET', model: 'GoalSheet' }
    ];

    for (let i = 0; i < 30; i++) {
      const emp = employees[i % employees.length];
      const template = logActions[i % logActions.length];
      await AuditLog.create({
        user: emp._id,
        action: template.action,
        model: template.model,
        documentId: emp._id,
        previousValue: { status: 'draft' },
        newValue: { status: 'approved' }
      });
    }

    console.log('[Seeder] Seeding In-App Notifications...');
    // Seed ~10 Notifications per key demo user
    const rolesDemoUsers = [admin1, managers[0], demoUser];
    for (const u of rolesDemoUsers) {
      for (let i = 1; i <= 10; i++) {
        await Notification.create({
          user: u._id,
          title: `Notification ${i} for ${u.role}`,
          message: `This is a realistic notification message details number ${i} regarding company workflows.`,
          type: i % 2 === 0 ? 'info' : 'success',
          read: i > 3 // 7 read, 3 unread
        });
      }
    }

    console.log('[Seeder] Database Seeding Completed Successfully! 🚀');
  } catch (error) {
    console.error('[Seeder] Database Seeding Failed:', error);
    throw error;
  }
};

module.exports = { seedDatabase };
