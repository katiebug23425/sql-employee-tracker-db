const express = require('express');
const mysql = require('mysql2');
const prompt = require('inquirer');

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const newConnection = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'employeeManager_db',
  });
  
  newConnection.connect((err) => {
    if (err) throw err;
    console.log(`Connected to the Employee Manager database.`)
    startApp();
  });

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


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  