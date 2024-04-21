// Imports
require('dotenv').config();
const mysql = require('mysql2');
const prompt = require('inquirer');
require('console.table');


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
    console.log(`Connected to the Employee Manager database.`)
    startApp();
  });

  // Function to Start Employee Tracker Application
  function startApp() {
    prompt({
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
    })
    .then((response) => {
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
              console.log("Exited sucessfully! Goodbye!");
                break;  

        }

    });
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

        console.log(response.name);

        const query = `INSERT INTO departments (department_name) VALUES ("${response.name}")`;

        const res = await newConnection.query(query);

        console.log(`You have successfully added department ${response.name} to the database!`);
        startApp();
    } catch (err) {
        console.error("Error adding department:", err);
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

        console.log(`You have successfully added role ${response.title} to the ${response.department} department with salary ${response.salary} to the database!`);
        startApp();
    } catch (err) {
        console.error("Error adding role:", err);
        startApp();
    }
}



// close the connection when the application exits
process.on("exit", () => {
    newConnection.end();
});