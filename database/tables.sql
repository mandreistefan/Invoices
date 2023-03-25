-- invoicemanager.clients definition

CREATE TABLE `clients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_type` varchar(4) NOT NULL DEFAULT 'pers',
  `client_fiscal_1` varchar(20) DEFAULT NULL,
  `client_fiscal_2` varchar(20) DEFAULT NULL,
  `client_first_name` varchar(20) NOT NULL,
  `client_last_name` varchar(20) NOT NULL,
  `client_county` varchar(20) NOT NULL,
  `client_city` varchar(20) NOT NULL,
  `client_street` varchar(20) NOT NULL,
  `client_adress_number` varchar(20) NOT NULL,
  `client_zip` varchar(20) NOT NULL,
  `client_phone` varchar(15) DEFAULT NULL,
  `client_email` varchar(50) DEFAULT NULL,
  `client_notes` text,
  `client_billing_adress` varchar(50) DEFAULT NULL,
  `client_gui_color` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- invoicemanager.clients_archived definition

CREATE TABLE `clients_archived` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_type` varchar(4) NOT NULL DEFAULT 'pers',
  `client_fiscal_1` varchar(20) DEFAULT NULL,
  `client_fiscal_2` varchar(20) DEFAULT NULL,
  `client_first_name` varchar(20) NOT NULL,
  `client_last_name` varchar(20) NOT NULL,
  `client_county` varchar(20) NOT NULL,
  `client_city` varchar(20) NOT NULL,
  `client_street` varchar(20) NOT NULL,
  `client_adress_number` varchar(20) NOT NULL,
  `client_zip` varchar(20) NOT NULL,
  `client_phone` varchar(15) NOT NULL,
  `client_email` varchar(25) NOT NULL,
  `client_notes` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- invoicemanager.employees definition

CREATE TABLE `employees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `emp_first_name` text NOT NULL,
  `emp_last_name` text NOT NULL,
  `emp_adress` varchar(150) NOT NULL,
  `emp_ident_no` varchar(15) NOT NULL,
  `emp_phone` varchar(10) NOT NULL,
  `emp_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `emp_active` tinyint(1) NOT NULL DEFAULT '1',
  `emp_job_name` varchar(50) NOT NULL,
  `emp_cur_salary_gross` float NOT NULL,
  `emp_tax` tinyint(1) NOT NULL DEFAULT '0',
  `emp_tax_cass` tinyint(1) NOT NULL DEFAULT '0',
  `emp_cur_salary_net` float NOT NULL,
  `emp_notes` text,
  `emp_vacation_days` int NOT NULL DEFAULT '20',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- invoicemanager.employees_archived definition

CREATE TABLE `employees_archived` (
  `id` int NOT NULL AUTO_INCREMENT,
  `emp_first_name` text NOT NULL,
  `emp_last_name` text NOT NULL,
  `emp_adress` varchar(150) NOT NULL,
  `emp_ident_no` varchar(15) NOT NULL,
  `emp_phone` varchar(10) NOT NULL,
  `emp_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `emp_active` tinyint(1) NOT NULL DEFAULT '1',
  `emp_job_name` varchar(50) NOT NULL,
  `emp_cur_salary_gross` float NOT NULL,
  `emp_tax` tinyint(1) NOT NULL DEFAULT '0',
  `emp_cur_salary_net` float NOT NULL,
  `emp_notes` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- invoicemanager.employees_salaries definition

CREATE TABLE `employees_salaries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `paid_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `sum_gross` float NOT NULL,
  `sum_net` float NOT NULL,
  `tax_cas` float NOT NULL,
  `tax_cass` float NOT NULL,
  `tax_income` float NOT NULL,
  `tax_cm` float NOT NULL,
  `paid_to` int NOT NULL,
  `salary_month` int NOT NULL,
  `salary_year` int NOT NULL,
  `comments` varchar(250) DEFAULT NULL,
  `bank_ref` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- invoicemanager.employees_vacation definition

CREATE TABLE `employees_vacation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `vacation_date` date NOT NULL,
  `vacation_type` varchar(10) NOT NULL,
  `date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- invoicemanager.expenses definition

CREATE TABLE `expenses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `exp_name` varchar(50) NOT NULL,
  `exp_sum` float NOT NULL,
  `exp_description` text NOT NULL,
  `exp_type` varchar(15) NOT NULL,
  `exp_date` date NOT NULL,
  `exp_deduct` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- invoicemanager.invoices definition

CREATE TABLE `invoices` (
  `invoice_number` int NOT NULL AUTO_INCREMENT,
  `invoice_status` varchar(10) NOT NULL DEFAULT 'draft',
  `invoice_pay_method` varchar(5) NOT NULL DEFAULT 'cash',
  `invoice_bank_ref` varchar(10) DEFAULT NULL,
  `rec_number` int DEFAULT NULL,
  `customer_id` int NOT NULL,
  `client_type` varchar(4) NOT NULL DEFAULT 'pers',
  `client_fiscal_1` varchar(20) NOT NULL,
  `client_fiscal_2` varchar(20) NOT NULL,
  `client_first_name` varchar(20) NOT NULL,
  `client_last_name` varchar(20) NOT NULL,
  `client_county` varchar(20) NOT NULL,
  `client_city` varchar(20) NOT NULL,
  `client_street` varchar(20) NOT NULL,
  `client_adress_number` varchar(20) NOT NULL,
  `client_zip` varchar(20) NOT NULL,
  `client_phone` varchar(10) NOT NULL,
  `client_email` varchar(50) NOT NULL,
  `invoice_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `invoice_tax` float DEFAULT '0',
  `invoice_total_sum` float DEFAULT '0',
  PRIMARY KEY (`invoice_number`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- invoicemanager.invoices_archived definition

CREATE TABLE `invoices_archived` (
  `invoice_number` int NOT NULL AUTO_INCREMENT,
  `invoice_status` varchar(10) NOT NULL DEFAULT 'draft',
  `invoice_pay_method` varchar(5) NOT NULL DEFAULT 'cash',
  `invoice_bank_ref` varchar(10) DEFAULT NULL,
  `rec_number` int DEFAULT NULL,
  `customer_id` int NOT NULL,
  `client_type` varchar(4) NOT NULL DEFAULT 'pers',
  `client_fiscal_1` varchar(20) NOT NULL,
  `client_fiscal_2` varchar(20) NOT NULL,
  `client_first_name` varchar(20) NOT NULL,
  `client_last_name` varchar(20) NOT NULL,
  `client_county` varchar(20) NOT NULL,
  `client_city` varchar(20) NOT NULL,
  `client_street` varchar(20) NOT NULL,
  `client_adress_number` varchar(20) NOT NULL,
  `client_zip` varchar(20) NOT NULL,
  `client_phone` varchar(10) NOT NULL,
  `client_email` varchar(25) NOT NULL,
  `invoice_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `invoice_tax` float NOT NULL,
  `invoice_total_sum` float NOT NULL,
  PRIMARY KEY (`invoice_number`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- invoicemanager.invoices_billed_products definition

CREATE TABLE `invoices_billed_products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoiceID` int NOT NULL,
  `product_id` int DEFAULT NULL,
  `product_name` varchar(25) NOT NULL,
  `product_mu` varchar(10) NOT NULL,
  `product_quantity` int NOT NULL,
  `product_tax_pr` float NOT NULL,
  `total_tax` float NOT NULL,
  `product_price` float NOT NULL,
  `total_price` float NOT NULL,
  `product_description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- invoicemanager.predefined_products definition

CREATE TABLE `predefined_products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pp_name` varchar(25) NOT NULL,
  `pp_um` varchar(10) NOT NULL,
  `pp_tax` float NOT NULL DEFAULT '10',
  `pp_price_per_item` float NOT NULL,
  `pp_description` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- invoicemanager.log definition

CREATE TABLE `log` (
  `date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `message` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;