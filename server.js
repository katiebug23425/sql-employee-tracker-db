// Imports
const mysql = require('mysql2/promise');
const util = require('util');
const { prompt } = require('inquirer');
const chalk = require('chalk'); 

let db;
(async () => {
    try {
        db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'Curie22081%',
            database: 'employee_manager_db',
          });
      console.log(chalk.magenta(`Connected to the Employee Manager database.`));
      startApp();
     } catch (err) {
      console.error(chalk.red('Error connecting to the database:', err));
    }
 })();

  // Function to Start Employee Tracker Application
  async function startApp() {
    const response = await prompt({
        type: "list",
        name: "options",
        message: "What would you like to do? Choose below",
        choices: [
            "View All Departments",
            "Add Department",
            "View All Roles",
            "Add Role",
            "View All Employees",
            "Add Employee",
            "Update Employee Role",
            "Exit"
        ],
    });

    switch (response.options) {
        case "View All Departments":
            allDepts();
            break;
        case "Add Department":
            addDept();
            break;
        case "View All Roles":
            allRoles();
            break;
        case "Add Role":
            addRole();
            break;
        case "View All Employees":
            allEmployees();
            break;
        case "Add Employee":
            addEmployee();
            break;
        case "Update Employee Role":
            updateRole();
            break;
        case "Exit":
            console.log(chalk.magenta("Exited successfully! Goodbye!"));
            process.exit();
    }
}


// function to view all departments
  async function allDepts() {
    try {
        const query = "SELECT * FROM departments";
        const [rows] = await db.query(query);
        console.table(rows);
    } catch (error) {
        console.error(error);
    }
    startApp();
}

// function to add a department
async function addDept() {
    try {
        const response = await prompt({
            type: "input",
            name: "name",
            message: "Please enter the name of the department you would like to create:"
        });

        console.log(chalk.yellow(response.name));

        const query = `INSERT INTO departments (department_name) VALUES ("${response.name}")`;

        const res = await db.query(query);

        console.log(chalk.green(`You have successfully added department ${response.name} to the database!`));
        startApp();
    } catch (err) {
        console.error(chalk.red("Error adding department:", err));
        startApp();
    }
}

// function to view all roles
async function allRoles() {
    try {
        const query = "SELECT roles.title, roles.id, departments.department_name, roles.salary FROM roles JOIN departments ON roles.department_id = departments.id";
        const [rows] = await db.query(query);
        console.table(rows);
    } catch (error) {
        console.error(error);
    }
    startApp();
}


// function to add a role
async function addRole() {
    try {
        const query = "SELECT id AS value, department_name AS name FROM departments";
        const res = await db.query(query);

        
        const response = await prompt([
            {
                type: "input",
                name: "title",
                message: "Please enter the title of the role you would like to create:",
            },
            {
                type: "input",
                name: "salary",
                message: "Please enter the salary of the role you would like to create:",
            },
            {
                type: "list",
                name: "department",
                message: "Please select the department for the role you are creating:",
                choices: res
            },
        ]);

        const department = res.find((department) => department.name === response.department);
        const insertQuery = `INSERT INTO roles (title, salary, department_id) VALUES ("${response.title}", ${response.salary}, ${response.department})`;
        await db.query(insertQuery);

        console.log(chalk.green(`You have successfully added role ${response.title} to the ${response.department} department with salary ${response.salary} to the database!`));
        startApp();
    } catch (err) {
        console.error(chalk.red("Error adding role:", err));
        startApp();
    }
}

// function to view all employees
async function allEmployees() {
    try {
        const query = `
        SELECT e.id, e.first_name, e.last_name, r.title, d.department_name, r.salary, CONCAT(m.first_name, " ", m.last_name) AS manager_name
        FROM employee e
        LEFT JOIN roles r ON e.role_id = r.id
        LEFT JOIN departments d ON r.department_id = d.id
        LEFT JOIN employee m ON e.manager_id = m.id;
        `;
        const [rows] = await db.query(query);
        console.table(rows);
    } catch (error) {
        console.error(error);
    }
    startApp();
}

// function to add an employee
async function addEmployee() {
    try {
        const rolesQuery = "SELECT id, title FROM roles";
        const rolesRes = await db.query(rolesQuery);
        const roles = rolesRes.map(({ id, title }) => ({
            name: title,
            value: id
        }));

        const managersQuery = "SELECT id, first_name, last_name FROM employee WHERE manager_id IS NULL";
        const managersRes = await db.query(managersQuery);
        const managers = managersRes.map(({ id, first_name, last_name }) => ({
            name: `${first_name} ${last_name}`,
            value: id
        }));

        const response = await prompt([
            {
                type: "input",
                name: "firstName",
                message: "Please enter the first name of the employee you would like to create:",
            },
            {
                type: "input",
                name: "lastName",
                message: "Please enter the last name of the employee you would like to create:",
            },
            {
                type: "list",
                name: "roleId",
                message: "Please select the role for the employee you are creating:",
                choices: roles,
            },
            {
                type: "list",
                name: "managerId",
                message: "Please select the manager for the employee you are creating:",
                choices: [
                    { name: "None", value: null },
                    ...managers,
                ],
            },
        ]);

        const insertSqlQuery = "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";
        await db.query(insertSqlQuery, [response.firstName, response.lastName, response.roleId, response.managerId]);

        console.log(chalk.green(`You have successfully added the employee to the database!`));
        startApp();
    } catch (err) {
        console.error(chalk.red("Error adding employee:", err));
        startApp();
    }
}

//function to update Role

async function updateRole() {
    try {
        const resEmployees = await db.query("SELECT employee.id, employee.first_name, employee.last_name, roles.title FROM employee LEFT JOIN roles ON employee.role_id = roles.id");
        const resRoles = await db.query("SELECT * FROM roles");

        const answers = await prompt([
            {
                type: "list",
                name: "employee",
                message: "Please select the employee you would like to update:",
                choices: resEmployees.map(employee =>{ 
                   return {name: `${employee.first_name} ${employee.last_name}`, value: employee.id}
                })
            },
            {
                type: "list",
                name: "role",
                message: "Please select the new role for the update:",
                choices: resRoles.map(role => role.title)
            }
        ]);

        const employee = resEmployees.find(employee => employee.id === answers.employee);
        const role = resRoles.find(role => role.title === answers.role);

        await db.query("UPDATE employee SET role_id = ? WHERE id = ?", [role.id, answers.employee]);

        console.log(chalk.green(`You have successfully updated ${employee.first_name} ${employee.last_name}'s role to ${role.title} in the database!`));
        startApp();
    } catch (err) {
        console.error(chalk.red("Error updating role:", err));
        startApp();
    }
}

// close the connection when the application exits
process.on("exit", () => {
});