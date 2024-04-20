INSERT INTO departments (department_name)
VALUES
("Marketing"),
("Customer Service"),
("Research and Development"),
("Human Resources"),
("Maintenance"),
("Engineering"),
("Finance"),
("Information Technology"),
("Legal"),
("Executive Board");

INSERT INTO roles (title, salary, department_id)
VALUES
("Social Media Manager", 100000.00, 1),
("Customer Service Manager", 90000.00, 2),
("Research and Development Manager", 150000.00, 3),
("HR Director", 125000.00, 4),
("Maintenance Manager", 80000.00, 5),
("Chief Engineer", 175000.00, 6),
("Director of Finance", 140000.00, 7),
("IT Manager", 135000.00, 8),
("Legal Manager", 95000.00, 9),
("Chief Executive Officer", 300000.00, 10);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
("Adrianna", "Poleni", 1, 1),
("Lilly", "Moore", 2, 2),
("Julia", "Magnan", 3, 3),
("Diane", "Skoczylas", 4, 4),
("Joseph", "Keller", 5, 5),
("Patrick", "Schultz", 6, 6),
("Amanda", "Stewart", 7, 7),
("Marcella", "Roberts", 8, 8),
("Gordon", "Smith", 9, 9),
("Michael", "Williams", 10, 10);
