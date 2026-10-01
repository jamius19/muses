PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_threads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`topic_id` integer NOT NULL,
	`type` text DEFAULT 'text' NOT NULL,
	`title` text NOT NULL,
	`body` text,
	`url` text,
	`author` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_threads`("id", "topic_id", "title", "body", "author", "created_at") SELECT "id", "topic_id", "title", "body", "author", "created_at" FROM `threads`;--> statement-breakpoint
DROP TABLE `threads`;--> statement-breakpoint
ALTER TABLE `__new_threads` RENAME TO `threads`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `topics` ADD `status` text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `topics` ADD `generation_error` text;--> statement-breakpoint
UPDATE `topics` SET `status` = 'done' WHERE `id` IN (SELECT `topic_id` FROM `threads`);