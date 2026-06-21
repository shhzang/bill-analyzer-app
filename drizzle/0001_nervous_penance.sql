CREATE TABLE `userSubmissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`country` varchar(100) NOT NULL,
	`email` varchar(320) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userSubmissions_id` PRIMARY KEY(`id`)
);
