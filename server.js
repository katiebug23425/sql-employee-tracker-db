// Imports
require('dotenv').config();
const mysql = require('mysql2');
const prompt = require('inquirer');
require('console.table');
const chalk=require("chalk"); 


// Connect to database
const newConnection = mysql.createConnection(
  {
    host: 'localhost',
    user: process.env.username,
    password: process.env.password,
    database: 'employeeManager_db',
  });
  
  newConnection.connect((err) => {
    if (err) throw err;
    console.log(chalk.magenta(`Connected to the Employee Manager database.`))
    startApp();
  });

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
            newConnection.end();
            console.log(chalk.magenta("Exited successfully! Goodbye!"));
            break;
    }
}


// function to view all departments
  async function allDepts() {
    try {
        const query = "SELECT * FROM departments";
        const rows = await new Promise((resolve, reject) => {
            newConnection.query(query, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
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

        const res = await newConnection.query(query);

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
        const rows = await new Promise((resolve, reject) => {
            newConnection.query(query, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
        console.table(rows);
    } catch (error) {
        console.error(error);
    }
    startApp();
}


// function to add a role
async function addRole() {
    try {
        const query = "SELECT * FROM departments";
        const res = await newConnection.query(query);

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
                choices: res.map((department) => department.department_name),
            },
        ]);

        const department = res.find((department) => department.name === response.department);
        
        const insertQuery = "INSERT INTO roles SET ?";
        await newConnection.query(insertQuery, {
            title: response.title,
            salary: response.salary,
            department_id: department.id,
        });

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
        LEFT JOIN role r ON e.role_id = r.id
        LEFT JOIN department d ON r.department_id = d.id
        LEFT JOIN employee m ON e.manager_id = m.id;
        `;
        const rows = await new Promise((resolve, reject) => {
            newConnection.query(query, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
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
        const rolesRes = await newConnection.query(rolesQuery);
        const roles = rolesRes.map(({ id, title }) => ({
            name: title,
            value: id
        }));

        const managersQuery = "SELECT id, first_name, last_name FROM employee WHERE manager_id IS NULL";
        const managersRes = await newConnection.query(managersQuery);
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
        await newConnection.query(insertSqlQuery, [response.firstName, response.lastName, response.roleId, response.managerId]);

        console.log(chalk.green(`You have successfully added the employee to the database!`));
        startApp();
    } catch (err) {
        console.error(chalk.red("Error adding employee:", err));
        startApp();
    }
}



// close the connection when the application exits
process.on("exit", () => {
    newConnection.end();
});