/*
  Warnings:

  - You are about to drop the `Appointment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Appointment";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "citas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" BIGINT NOT NULL,
    "service" TEXT NOT NULL,
    "duration" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'solicitado',
    "number" TEXT,
    "name" TEXT
);
