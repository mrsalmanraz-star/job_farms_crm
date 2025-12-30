CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` varchar(50) NOT NULL,
	`clientId` int NOT NULL,
	`serviceId` int NOT NULL,
	`assignedTo` int,
	`status` enum('pending','confirmed','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
	`salaryMin` decimal(10,2) NOT NULL,
	`salaryMax` decimal(10,2) NOT NULL,
	`workProfile` text,
	`responsibilities` json,
	`bookingDate` timestamp,
	`completionDate` timestamp,
	`notes` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`),
	CONSTRAINT `bookings_bookingId_unique` UNIQUE(`bookingId`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`mobile1` varchar(20) NOT NULL,
	`mobile2` varchar(20),
	`address` text,
	`city` varchar(100),
	`state` varchar(100),
	`zipCode` varchar(10),
	`notes` text,
	`status` enum('active','inactive','archived') NOT NULL DEFAULT 'active',
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`paymentType` enum('standard','japa','trial') NOT NULL,
	`baseSalary` decimal(10,2) NOT NULL,
	`commission` decimal(10,2) NOT NULL,
	`gstRate` decimal(5,2) NOT NULL,
	`gstAmount` decimal(10,2) NOT NULL,
	`totalAmount` decimal(10,2) NOT NULL,
	`trialFee` decimal(10,2),
	`status` enum('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
	`paymentDate` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`hours` int,
	`baseSalaryMin` decimal(10,2) NOT NULL,
	`baseSalaryMax` decimal(10,2) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `systemConfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`gstRate` decimal(5,2) NOT NULL DEFAULT '18.00',
	`trialFee` decimal(10,2) NOT NULL DEFAULT '199.00',
	`officeAddress` text,
	`officePhone1` varchar(20),
	`officePhone2` varchar(20),
	`officeEmail` varchar(320),
	`website` varchar(255),
	`companyName` varchar(255) DEFAULT 'JOB FARMS',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `systemConfig_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('super_admin','admin','team_member','user') NOT NULL DEFAULT 'user';