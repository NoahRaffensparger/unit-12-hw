const inquirer = require('inquirer');
const { Pool } = require('pg')

const pool = new Pool(
  {
    user: 'postgres',
    password: 'rocky',
    host: 'localhost',
    database: 'company_db',
    port: 5432
  },
  console.log(`Connected to the company_db database.`)
)

pool.connect()

let departmentList = []
let roleList = []
let employeeList = []

const checkDepartments = () => {
  pool.query('SELECT id AS value, name FROM departments;', (err, res) => {
    if (err) {
      console.error(err);
    } else {
      departmentList = res.rows
    }
  })
}
const checkRoles = () => {
  pool.query('SELECT id AS value, title AS name FROM roles;', (err, res) => {
    if (err) {
      console.error(err);
    } else {
      roleList = res.rows
    }
  })
}

const checkEmployees = async () => {
  const result = await new Promise((resolve, reject) => {
    pool.query('SELECT id AS value, first_name, last_name FROM employees;', (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res.rows);
      }
    });
  });

  employeeList = result.map(employee => ({
    value: employee.value,
    name: `${employee.first_name} ${employee.last_name}`
  }));
}

async function viewDepartments() {

  const query = (text, params) => new Promise((resolve, reject) => {
    pool.query(text, params, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });

  const result = await query('SELECT * FROM departments;');
  console.table(result.rows);

  await start();
}


async function viewRoles() {

  const query = (text, params) => new Promise((resolve, reject) => {
    pool.query(text, params, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });

  const result = await query(`
SELECT
    roles.title AS job_title,
    roles.id AS role_id,
    departments.name AS department_name,
    roles.salary
FROM
    roles
JOIN 
    departments ON roles.department_id = departments.id;`);
  console.table(result.rows);

  await start();
}

async function viewEmployees() {

  const query = (text, params) => new Promise((resolve, reject) => {
    pool.query(text, params, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });

  const result = await query(`
SELECT
    e.id AS employee_id,
    e.first_name,
    e.last_name,
    roles.title AS job_title,
    departments.name AS department_name,
    roles.salary,
    manager.id AS manager_id,
    manager.first_name AS manager_first_name,
    manager.last_name AS manager_last_name
FROM
    employees e
LEFT JOIN
    employees manager ON e.manager_id = manager.id
JOIN
    roles ON e.role_id = roles.id
JOIN
    departments ON roles.department_id = departments.id;`);
  console.table(result.rows);

  await start();
}


async function addDepartment(answer) {

  const query = (text, params) => new Promise((resolve, reject) => {
    pool.query(text, params, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });

  const result = await query(`
INSERT INTO departments (name)
VALUES ('${answer.department}');
SELECT * FROM departments;`);
  console.log(`Added ${answer.department} department.`);

  await start();
}

async function addRole(answer) {

  const query = (text, params) => new Promise((resolve, reject) => {
    pool.query(text, params, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });

  const result = await query(`
INSERT INTO roles (title, salary, department_id)
VALUES ('${answer.roleTitle}', ${answer.roleSalary}, ${answer.roleDepartment});
SELECT * FROM departments;`);
  console.log(`Added ${answer.roleTitle} role.`);

  await start();
}

async function addEmployee(answer) {

  const query = (text, params) => new Promise((resolve, reject) => {
    pool.query(text, params, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });

  const result = await query(`
INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES ('${answer.empFName}', '${answer.empLName}', '${answer.empRole}', '${answer.empManager}');`);
  console.log(`Added ${answer.empFName} ${answer.empLName} to the database.`);

  await start();
}

async function updateEmployee(answer) {

  const query = (text, params) => new Promise((resolve, reject) => {
    pool.query(text, params, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });

  const result = await query(`
UPDATE employees
SET role_id = ${answer.updateRole}
WHERE id = ${answer.updateEmpList}`);
  console.log(`Updated employee`);

  await start();
}



const start = () => {
  checkDepartments()
  checkRoles()
  checkEmployees()
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'index',
        choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add an employee', 'Update an employee role']
      }
    ])
    .then((answer) => {
      if (answer.index == 'View all departments') {
        viewDepartments()
      } else if (answer.index == 'View all roles') {
        viewRoles()
      } else if (answer.index == 'View all employees') {
        viewEmployees()
      } else if (answer.index == 'Add a department') {
        inquirer
          .prompt([
            {
              type: 'input',
              name: 'department',
              message: 'Enter department'
            }
          ])
          .then((answer) => {
            addDepartment(answer)
          })
      } else if (answer.index == 'Add a role') {
        inquirer
          .prompt([
            {
              type: 'input',
              name: 'roleTitle',
              message: 'Enter role'
            },
            {
              type: 'input',
              name: 'roleSalary',
              message: 'Enter salary'
            },
            {
              type: 'list',
              name: 'roleDepartment',
              message: 'Which department does the role belong to?',
              choices: departmentList
            }
          ])
          .then((answer) => {
            addRole(answer)
          })
      } else if (answer.index == 'Add an employee') {
        inquirer
          .prompt([
            {
              type: 'input',
              name: 'empFName',
              message: 'Enter first name'
            },
            {
              type: 'input',
              name: 'empLName',
              message: 'Enter last name'
            },
            {
              type: 'list',
              name: 'empRole',
              message: 'What is the employees role?',
              choices: roleList
            },
            {
              type: 'list',
              name: 'empManager',
              message: 'Who is the employees manager?',
              choices: employeeList
            }
          ])
          .then((answer) => {
            addEmployee(answer)
          })
      } else if (answer.index == 'Update an employee role'){
        inquirer
          .prompt([
            {
              type: 'list',
              name: 'updateEmpList',
              message: 'Select employee to update',
              choices: employeeList
            },
            {
              type: 'list',
              name: 'updateRole',
              message: 'Select new role',
              choices: roleList
            }
          ])
          .then((answer) => {
            updateEmployee(answer)
          })
      }
    })
}


start()