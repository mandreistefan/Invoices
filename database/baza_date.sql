-- phpMyAdmin SQL Dump
-- version 5.1.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 09, 2023 at 10:34 AM
-- Server version: 10.4.24-MariaDB
-- PHP Version: 8.1.5

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Database: `baza_date_facturi`
--

-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

CREATE TABLE `clients` (
  `id` int(11) NOT NULL,
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
  `client_billing_adress` varchar(50) NOT NULL,
  `client_phone` varchar(15) NOT NULL,
  `client_email` varchar(50) NOT NULL,
  `client_notes` text NOT NULL,
  `client_gui_color` varchar(7) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `clients_archived`
--

CREATE TABLE `clients_archived` (
  `id` int(11) NOT NULL,
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
  `client_billing_adress` varchar(50) NOT NULL,
  `client_phone` varchar(15) NOT NULL,
  `client_email` varchar(25) NOT NULL,
  `client_notes` text NOT NULL,
  `client_gui_color` varchar(7) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` int(11) NOT NULL,
  `emp_first_name` text NOT NULL,
  `emp_last_name` text NOT NULL,
  `emp_adress` varchar(150) NOT NULL,
  `emp_ident_no` varchar(15) NOT NULL,
  `emp_phone` varchar(10) NOT NULL,
  `emp_date` date NOT NULL DEFAULT current_timestamp(),
  `emp_active` tinyint(1) NOT NULL DEFAULT 1,
  `emp_job_name` varchar(50) NOT NULL,
  `emp_cur_salary_gross` float NOT NULL,
  `emp_tax` tinyint(1) NOT NULL DEFAULT 0,
  `emp_cur_salary_net` float NOT NULL,
  `emp_notes` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `employees_archived`
--

CREATE TABLE `employees_archived` (
  `id` int(11) NOT NULL,
  `emp_first_name` text NOT NULL,
  `emp_last_name` text NOT NULL,
  `emp_adress` varchar(150) NOT NULL,
  `emp_ident_no` varchar(15) NOT NULL,
  `emp_phone` varchar(10) NOT NULL,
  `emp_date` date NOT NULL DEFAULT current_timestamp(),
  `emp_active` tinyint(1) NOT NULL DEFAULT 1,
  `emp_job_name` varchar(50) NOT NULL,
  `emp_cur_salary_gross` float NOT NULL,
  `emp_tax` tinyint(1) NOT NULL DEFAULT 0,
  `emp_cur_salary_net` float NOT NULL,
  `emp_notes` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `employees_salaries`
--

CREATE TABLE `employees_salaries` (
  `id` int(11) NOT NULL,
  `paid_on` date NOT NULL DEFAULT current_timestamp(),
  `sum_gross` float NOT NULL,
  `sum_net` float NOT NULL,
  `tax_cas` float NOT NULL,
  `tax_cass` float NOT NULL,
  `tax_income` float NOT NULL,
  `tax_cm` float NOT NULL,
  `paid_to` int(11) NOT NULL,
  `salary_month` int(2) NOT NULL,
  `comments` varchar(250) NOT NULL,
  `bank_ref` varchar(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `employees_vacation`
--

CREATE TABLE `employees_vacation` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `vacation_date` date NOT NULL,
  `vacation_type` varchar(10) NOT NULL,
  `date` date NOT NULL DEFAULT current_timestamp(),
  `status` text NOT NULL DEFAULT 'approved'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` int(11) NOT NULL,
  `exp_name` varchar(50) NOT NULL,
  `exp_sum` float NOT NULL,
  `exp_description` text NOT NULL,
  `exp_date` date NOT NULL,
  `exp_deduct` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `invoice_number` int(11) NOT NULL,
  `invoice_status` varchar(10) NOT NULL DEFAULT 'draft',
  `invoice_pay_method` varchar(5) NOT NULL DEFAULT 'cash',
  `invoice_bank_ref` varchar(10) DEFAULT NULL,
  `rec_number` int(11) DEFAULT NULL,
  `customer_id` int(11) NOT NULL,
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
  `invoice_date` date NOT NULL DEFAULT current_timestamp(),
  `invoice_tax` float NOT NULL,
  `invoice_total_sum` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `invoices_archived`
--

CREATE TABLE `invoices_archived` (
  `invoice_number` int(11) NOT NULL,
  `invoice_status` varchar(10) NOT NULL DEFAULT 'draft',
  `invoice_pay_method` varchar(5) NOT NULL DEFAULT 'cash',
  `invoice_bank_ref` varchar(10) DEFAULT NULL,
  `rec_number` int(11) DEFAULT NULL,
  `customer_id` int(11) NOT NULL,
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
  `invoice_date` date NOT NULL DEFAULT current_timestamp(),
  `invoice_tax` float NOT NULL,
  `invoice_total_sum` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `invoices_billed_products`
--

CREATE TABLE `invoices_billed_products` (
  `id` int(11) NOT NULL,
  `invoiceID` int(10) NOT NULL,
  `product_id` int(5) DEFAULT NULL,
  `product_name` varchar(25) NOT NULL,
  `product_mu` varchar(10) NOT NULL,
  `product_quantity` int(11) NOT NULL,
  `product_tax_pr` float NOT NULL,
  `total_tax` float NOT NULL,
  `product_price` float NOT NULL,
  `total_price` float NOT NULL,
  `product_description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `invoices_recurrent`
--

CREATE TABLE `invoices_recurrent` (
  `rec_number` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `client_first_name` varchar(20) NOT NULL,
  `client_last_name` varchar(20) NOT NULL,
  `client_county` varchar(20) NOT NULL,
  `client_city` varchar(20) NOT NULL,
  `client_street` varchar(20) NOT NULL,
  `client_adress_number` varchar(20) NOT NULL,
  `client_zip` varchar(20) NOT NULL,
  `client_billing_adress` varchar(25) NOT NULL,
  `recurrency_creation_date` date NOT NULL DEFAULT current_timestamp(),
  `invoice_recurrency` varchar(15) NOT NULL,
  `invoice_re_mo_date` date DEFAULT NULL,
  `invoice_re_y_date` date DEFAULT NULL,
  `invoice_total_sum` float NOT NULL,
  `next_invoice_date` date NOT NULL DEFAULT current_timestamp(),
  `last_invoice_date` date DEFAULT NULL,
  `invoice_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `invoices_recurrent_products`
--

CREATE TABLE `invoices_recurrent_products` (
  `id` int(11) NOT NULL,
  `invoiceID` int(10) NOT NULL,
  `product_id` int(5) DEFAULT NULL,
  `product_name` varchar(25) NOT NULL,
  `product_mu` varchar(10) NOT NULL,
  `product_quantity` int(11) NOT NULL,
  `product_tax_pr` float NOT NULL,
  `total_tax` float NOT NULL,
  `product_price` float NOT NULL,
  `total_price` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `predefined_products`
--

CREATE TABLE `predefined_products` (
  `id` int(5) NOT NULL,
  `pp_name` varchar(25) NOT NULL,
  `pp_um` varchar(10) NOT NULL,
  `pp_tax` float NOT NULL DEFAULT 10,
  `pp_price_per_item` float NOT NULL,
  `pp_description` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `clients_archived`
--
ALTER TABLE `clients_archived`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `employees_archived`
--
ALTER TABLE `employees_archived`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `employees_salaries`
--
ALTER TABLE `employees_salaries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `employees_vacation`
--
ALTER TABLE `employees_vacation`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`invoice_number`);

--
-- Indexes for table `invoices_archived`
--
ALTER TABLE `invoices_archived`
  ADD PRIMARY KEY (`invoice_number`);

--
-- Indexes for table `invoices_billed_products`
--
ALTER TABLE `invoices_billed_products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `invoices_recurrent`
--
ALTER TABLE `invoices_recurrent`
  ADD PRIMARY KEY (`rec_number`);

--
-- Indexes for table `invoices_recurrent_products`
--
ALTER TABLE `invoices_recurrent_products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `predefined_products`
--
ALTER TABLE `predefined_products`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `clients`
--
ALTER TABLE `clients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `clients_archived`
--
ALTER TABLE `clients_archived`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employees_archived`
--
ALTER TABLE `employees_archived`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employees_salaries`
--
ALTER TABLE `employees_salaries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employees_vacation`
--
ALTER TABLE `employees_vacation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `invoice_number` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoices_archived`
--
ALTER TABLE `invoices_archived`
  MODIFY `invoice_number` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoices_billed_products`
--
ALTER TABLE `invoices_billed_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoices_recurrent`
--
ALTER TABLE `invoices_recurrent`
  MODIFY `rec_number` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoices_recurrent_products`
--
ALTER TABLE `invoices_recurrent_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `predefined_products`
--
ALTER TABLE `predefined_products`
  MODIFY `id` int(5) NOT NULL AUTO_INCREMENT;
COMMIT;
